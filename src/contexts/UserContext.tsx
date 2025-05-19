
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface UserContextType {
  user: User;
  updatePoints: (amount: number) => void;
  saveOffer: (offerId: string) => void;
  unsaveOffer: (offerId: string) => void;
  isOfferSaved: (offerId: string) => boolean;
  updateLocation: (location: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Try to load user from localStorage if available
const getInitialUser = (): User => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Update location to India if it's the first time
      if (parsedUser.location !== 'India') {
        parsedUser.location = 'India';
      }
      return parsedUser;
    } else {
      // Set default location to India
      return {
        ...mockUser,
        location: 'India',
        savedOffers: []
      };
    }
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return {
      ...mockUser,
      location: 'India',
      savedOffers: []
    };
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const { toast } = useToast();
  const [authSession, setAuthSession] = useState<any>(null);

  // Check if user is authenticated with Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setAuthSession(session);
        
        if (session) {
          console.log("User is authenticated:", session.user.id);
          
          // If authenticated, fetch user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
          
          if (profileData) {
            console.log("Profile data fetched:", profileData);
            
            // Fetch saved offers for this user
            const { data: savedOffers, error: savedOffersError } = await supabase
              .from('saved_offers')
              .select('offer_id')
              .eq('user_id', session.user.id);
            
            if (savedOffersError) {
              console.error('Error fetching saved offers:', savedOffersError);
            }
            
            console.log("Saved offers:", savedOffers);
            
            // Update the user state with data from Supabase
            setUser(prevUser => ({
              ...prevUser,
              id: session.user.id,
              email: session.user.email || '',
              location: profileData.location || 'India',
              savedOffers: savedOffers ? savedOffers.map(item => item.offer_id) : []
            }));
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setAuthSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        // User signed in, fetch their profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Fetch saved offers for this user
        const { data: savedOffers } = await supabase
          .from('saved_offers')
          .select('offer_id')
          .eq('user_id', session.user.id);
        
        console.log("Signed in - saved offers:", savedOffers);
        
        // Update user state
        const updatedUser = {
          ...user,
          id: session.user.id,
          email: session.user.email || '',
          location: profileData?.location || 'India',
          savedOffers: savedOffers ? savedOffers.map(item => item.offer_id) : []
        };
        
        setUser(updatedUser);
        
        // Cache the updated user
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (event === 'SIGNED_OUT') {
        // User signed out, revert to default user
        const defaultUser = {
          ...mockUser,
          location: 'India'
        };
        
        setUser(defaultUser);
        
        // Cache the default user
        localStorage.setItem('user', JSON.stringify(defaultUser));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

  // Set up real-time listener for saved_offers
  useEffect(() => {
    if (!authSession?.user?.id) return;
    
    const channel = supabase
      .channel('public:saved_offers')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'saved_offers',
          filter: `user_id=eq.${authSession.user.id}`
        },
        async () => {
          // Refresh saved offers when changes occur
          console.log('Saved offers changed, refreshing...');
          
          const { data: savedOffers, error } = await supabase
            .from('saved_offers')
            .select('offer_id')
            .eq('user_id', authSession.user.id);
            
          if (error) {
            console.error('Error refreshing saved offers:', error);
            return;
          }
          
          if (savedOffers) {
            const updatedSavedOffers = savedOffers.map(item => item.offer_id);
            
            setUser(prevUser => {
              const updatedUser = {
                ...prevUser,
                savedOffers: updatedSavedOffers
              };
              
              // Cache the updated user
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
  }, [authSession?.user?.id]);

  // Function to update user points
  const updatePoints = (amount: number) => {
    setUser(prevUser => {
      const newPoints = prevUser.points + amount;
      if (amount > 0) {
        toast({
          title: `+${amount} points earned!`,
          description: `You now have ${newPoints} points total.`,
        });
      }
      return {
        ...prevUser,
        points: newPoints
      };
    });
  };

  // Function to save an offer to user's favorites in Supabase
  const saveOffer = async (offerId: string) => {
    console.log('Saving offer:', offerId);
    
    if (!user.savedOffers.includes(offerId)) {
      // Update local state first for responsiveness
      const updatedUser = {
        ...user,
        savedOffers: [...user.savedOffers, offerId],
        points: user.points + 5 // Add 5 points for saving an offer
      };
      
      setUser(updatedUser);
      
      // Cache the updated user immediately
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If user is authenticated, save to Supabase
      if (authSession && authSession.user) {
        try {
          console.log('Saving to Supabase:', offerId, 'User ID:', authSession.user.id);
          const { error } = await supabase
            .from('saved_offers')
            .insert({
              user_id: authSession.user.id,
              offer_id: offerId
            });
            
          if (error) {
            console.error('Error saving offer to Supabase:', error);
            // Revert local state if Supabase update fails
            const revertedUser = {
              ...user,
              savedOffers: user.savedOffers.filter(id => id !== offerId),
              points: user.points - 5
            };
            
            setUser(revertedUser);
            localStorage.setItem('user', JSON.stringify(revertedUser));
            
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
        description: "The offer has been added to your saved items and you've earned 5 points!",
      });
    } else {
      console.log('Offer already saved:', offerId);
    }
  };

  // Function to remove an offer from user's favorites in Supabase
  const unsaveOffer = async (offerId: string) => {
    console.log('Unsaving offer:', offerId);
    
    // Update local state first for responsiveness
    const updatedUser = {
      ...user,
      savedOffers: user.savedOffers.filter(id => id !== offerId)
    };
    
    setUser(updatedUser);
    
    // Cache the updated user immediately
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // If user is authenticated, remove from Supabase
    if (authSession && authSession.user) {
      try {
        console.log('Removing from Supabase:', offerId, 'User ID:', authSession.user.id);
        const { error } = await supabase
          .from('saved_offers')
          .delete()
          .eq('user_id', authSession.user.id)
          .eq('offer_id', offerId);
          
        if (error) {
          console.error('Error removing offer from Supabase:', error);
          // Revert local state if Supabase update fails
          const revertedUser = {
            ...user,
            savedOffers: [...user.savedOffers, offerId]
          };
          
          setUser(revertedUser);
          localStorage.setItem('user', JSON.stringify(revertedUser));
          
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

  // Function to update user location and save to Supabase
  const updateLocation = async (location: string) => {
    // Update local state first for responsiveness
    setUser(prevUser => ({
      ...prevUser,
      location
    }));
    
    // If user is authenticated, update location in Supabase
    if (authSession && authSession.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ location })
          .eq('id', authSession.user.id);
          
        if (error) {
          console.error('Error updating location in Supabase:', error);
          // Don't revert local state as it's not critical
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
      updatePoints, 
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
