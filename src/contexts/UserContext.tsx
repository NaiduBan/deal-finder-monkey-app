
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

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
      return {
        ...parsedUser,
        savedOffers: parsedUser.savedOffers || []
      };
    } else {
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
  const { session, userProfile } = useAuth();

  // Sync with auth context
  useEffect(() => {
    if (session?.user && userProfile) {
      // Update user data with auth information
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          id: session.user.id,
          email: userProfile.email || session.user.email || '',
          name: userProfile.name || '',
          phone: userProfile.phone || '',
          location: userProfile.location || 'India',
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      });
      
      // Fetch saved offers for authenticated user
      const fetchSavedOffers = async () => {
        try {
          const { data: savedOffers } = await (supabase as any)
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
      // Reset to guest user when signed out
      const guestUser = {
        ...mockUser,
        location: 'India',
        savedOffers: []
      };
      setUser(guestUser);
      localStorage.setItem('user', JSON.stringify(guestUser));
    }
  }, [session, userProfile]);

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
      
      const updatedUser = {
        ...prevUser,
        points: newPoints
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };

  // Function to save an offer to user's favorites
  const saveOffer = async (offerId: string) => {
    console.log('Saving offer:', offerId);
    
    if (!user.savedOffers.includes(offerId)) {
      // Update local state first for responsiveness
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          savedOffers: [...prevUser.savedOffers, offerId],
          points: prevUser.points + 5 // Add 5 points for saving an offer
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      
      // If user is authenticated, save to Supabase
      if (session?.user) {
        try {
          console.log('Saving to Supabase:', offerId, 'User ID:', session.user.id);
          const { error } = await (supabase as any)
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
                savedOffers: prevUser.savedOffers.filter(id => id !== offerId),
                points: prevUser.points - 5
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
        description: "The offer has been added to your saved items and you've earned 5 points!",
      });
    }
  };

  // Function to remove an offer from user's favorites
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
        const { error } = await (supabase as any)
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

  // Function to update user location
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
    
    // If user is authenticated, update location in Supabase through auth context
    if (session?.user) {
      try {
        const { error } = await (supabase as any)
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
