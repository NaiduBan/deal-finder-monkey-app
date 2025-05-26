
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
  user: User;
  userPreferences: {[key: string]: string[]};
  saveOffer: (offerId: string) => void;
  unsaveOffer: (offerId: string) => void;
  isOfferSaved: (offerId: string) => boolean;
  updateLocation: (location: string) => void;
  refreshUserPreferences: () => Promise<void>;
  hasPreferences: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialUser = (): User => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      return {
        ...parsedUser,
        savedOffers: parsedUser.savedOffers || [],
        points: 0
      };
    } else {
      return {
        ...mockUser,
        location: 'India',
        savedOffers: [],
        points: 0
      };
    }
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return {
      ...mockUser,
      location: 'India',
      savedOffers: [],
      points: 0
    };
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>({
    stores: [],
    categories: [],
    banks: []
  });
  const { toast } = useToast();
  const { session, userProfile } = useAuth();

  // Compute if user has any preferences
  const hasPreferences = Object.values(userPreferences).some(arr => arr.length > 0);

  // Sync with auth context
  useEffect(() => {
    if (session?.user && userProfile) {
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          id: session.user.id,
          email: userProfile.email || session.user.email || '',
          name: userProfile.name || '',
          phone: userProfile.phone || '',
          location: userProfile.location || 'India',
          points: 0
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      
      // Fetch saved offers for authenticated user
      const fetchSavedOffers = async () => {
        try {
          const { data: savedOffers } = await supabase
            .from('saved_offers')
            .select('offer_id')
            .eq('user_id', session.user.id);
          
          if (savedOffers) {
            setUser(prevUser => {
              const updatedUser = {
                ...prevUser,
                savedOffers: savedOffers.map((item: any) => item.offer_id)
              };
              
              localStorage.setItem('user', JSON.stringify(updatedUser));
              return updatedUser;
            });
          }
        } catch (error) {
          console.error('Error fetching saved offers:', error);
        }
      };
      
      fetchSavedOffers();
      refreshUserPreferences();
    } else if (!session) {
      const guestUser = {
        ...mockUser,
        location: 'India',
        savedOffers: [],
        points: 0
      };
      setUser(guestUser);
      setUserPreferences({ stores: [], categories: [], banks: [] });
      localStorage.setItem('user', JSON.stringify(guestUser));
    }
  }, [session, userProfile]);

  // Fetch user preferences from database
  const refreshUserPreferences = async () => {
    if (!session?.user) return;

    try {
      console.log('Fetching user preferences for user:', session.user.id);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_type, preference_value')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const preferences = { stores: [], categories: [], banks: [] };
      data?.forEach(pref => {
        const type = pref.preference_type as keyof typeof preferences;
        if (preferences[type]) {
          preferences[type].push(pref.preference_value);
        }
      });

      console.log('User preferences loaded:', preferences);
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Real-time subscription for saved offers
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('saved-offers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_offers',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Saved offer change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setUser(prevUser => {
              const updatedUser = {
                ...prevUser,
                savedOffers: [...prevUser.savedOffers, payload.new.offer_id]
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              return updatedUser;
            });
          } else if (payload.eventType === 'DELETE') {
            setUser(prevUser => {
              const updatedUser = {
                ...prevUser,
                savedOffers: prevUser.savedOffers.filter(id => id !== payload.old.offer_id)
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              return updatedUser;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Real-time subscription for user preferences
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('user-preferences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('User preference change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setUserPreferences(prev => ({
              ...prev,
              [payload.new.preference_type]: [...prev[payload.new.preference_type as keyof typeof prev], payload.new.preference_value]
            }));
          } else if (payload.eventType === 'DELETE') {
            setUserPreferences(prev => ({
              ...prev,
              [payload.old.preference_type]: prev[payload.old.preference_type as keyof typeof prev].filter(val => val !== payload.old.preference_value)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const saveOffer = async (offerId: string) => {
    console.log('Saving offer:', offerId);
    
    if (!user.savedOffers.includes(offerId)) {
      // Update local state first for responsiveness
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          savedOffers: [...prevUser.savedOffers, offerId]
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      
      // If user is authenticated, save to Supabase with proper conflict handling
      if (session?.user) {
        try {
          console.log('Saving to Supabase:', offerId, 'User ID:', session.user.id);
          const { error } = await supabase
            .from('saved_offers')
            .upsert({
              user_id: session.user.id,
              offer_id: offerId
            }, {
              onConflict: 'user_id,offer_id',
              ignoreDuplicates: true
            });
            
          if (error) {
            console.error('Error saving offer to Supabase:', error);
            // Revert local state if Supabase update fails
            setUser(prevUser => {
              const updatedUser = {
                ...prevUser,
                savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
              };
              
              localStorage.setItem('user', JSON.stringify(updatedUser));
              return updatedUser;
            });
            
            toast({
              title: "Error saving offer",
              description: "There was a problem saving this offer. Please try again.",
              variant: "destructive"
            });
            return;
          }
        } catch (error) {
          console.error('Exception while saving offer:', error);
        }
      }
      
      toast({
        title: "Offer saved!",
        description: "The offer has been added to your saved items.",
      });
    }
  };

  const unsaveOffer = async (offerId: string) => {
    console.log('Unsaving offer:', offerId);
    
    // Update local state first for responsiveness
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
    
    // If user is authenticated, remove from Supabase
    if (session?.user) {
      try {
        console.log('Removing from Supabase:', offerId, 'User ID:', session.user.id);
        const { error } = await supabase
          .from('saved_offers')
          .delete()
          .eq('user_id', session.user.id)
          .eq('offer_id', offerId);
          
        if (error) {
          console.error('Error removing offer from Supabase:', error);
          // Revert local state if Supabase update fails
          setUser(prevUser => {
            const updatedUser = {
              ...prevUser,
              savedOffers: [...prevUser.savedOffers, offerId]
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
          });
          
          toast({
            title: "Error removing offer",
            description: "There was a problem removing this offer. Please try again.",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        console.error('Exception while unsaving offer:', error);
      }
    }
    
    toast({
      title: "Offer removed",
      description: "The offer has been removed from your saved items.",
    });
  };

  const isOfferSaved = (offerId: string) => {
    return user.savedOffers.includes(offerId);
  };

  const updateLocation = async (location: string) => {
    // Update local state first for responsiveness
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        location
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
    
    // If user is authenticated, update location in Supabase
    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ location })
          .eq('id', session.user.id);
          
        if (error) {
          console.error('Error updating location in Supabase:', error);
        }
      } catch (error) {
        console.error('Exception while updating location:', error);
      }
    }
    
    toast({
      title: "Location updated",
      description: `Your location has been updated to ${location}.`,
    });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      userPreferences,
      saveOffer, 
      unsaveOffer, 
      isOfferSaved,
      updateLocation,
      refreshUserPreferences,
      hasPreferences
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
