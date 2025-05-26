
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
  user: User;
  saveOffer: (offerId: string) => void;
  unsaveOffer: (offerId: string) => void;
  isOfferSaved: (offerId: string) => boolean;
  updateLocation: (location: string) => void;
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
        points: 0 // Remove points completely
      };
    } else {
      return {
        ...mockUser,
        location: 'India',
        savedOffers: [],
        points: 0 // Remove points completely
      };
    }
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return {
      ...mockUser,
      location: 'India',
      savedOffers: [],
      points: 0 // Remove points completely
    };
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const { toast } = useToast();
  const { session, userProfile } = useAuth();

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
          points: 0 // Remove points completely
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
    } else if (!session) {
      const guestUser = {
        ...mockUser,
        location: 'India',
        savedOffers: [],
        points: 0 // Remove points completely
      };
      setUser(guestUser);
      localStorage.setItem('user', JSON.stringify(guestUser));
    }
  }, [session, userProfile]);

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
      
      // If user is authenticated, save to Supabase
      if (session?.user) {
        try {
          console.log('Saving to Supabase:', offerId, 'User ID:', session.user.id);
          const { error } = await supabase
            .from('saved_offers')
            .insert({
              user_id: session.user.id,
              offer_id: offerId
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
      saveOffer, 
      unsaveOffer, 
      isOfferSaved,
      updateLocation
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
