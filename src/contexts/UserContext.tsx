
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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setAuthSession(session);
        
        if (session) {
          console.log("User is authenticated:", session.user.id);
          
          // If authenticated, fetch user profile from Supabase
          const { data: profileData, error: profileError } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            
            // If profile doesn't exist yet, create it
            if (profileError.code === 'PGRST116') {
              try {
                const { error: insertError } = await (supabase as any)
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    location: 'India'
                  });
                  
                if (insertError) {
                  console.error('Error creating user profile:', insertError);
                } else {
                  console.log('Created new user profile');
                }
              } catch (err) {
                console.error('Error in profile creation:', err);
              }
            }
          }
          
          // Fetch saved offers for this user
          const { data: savedOffers, error: savedOffersError } = await (supabase as any)
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
            location: profileData?.location || 'India',
            savedOffers: savedOffers ? savedOffers.map((item: any) => item.offer_id) : []
          }));
          
          // Save user to localStorage for offline access
          localStorage.setItem('user', JSON.stringify({
            ...prevUser,
            id: session.user.id,
            email: session.user.email || '',
            location: profileData?.location || 'India',
            savedOffers: savedOffers ? savedOffers.map((item: any) => item.offer_id) : []
          }));
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
        const { data: profileData, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          try {
            const { error: insertError } = await (supabase as any)
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                location: 'India'
              });
              
            if (insertError) {
              console.error('Error creating user profile on sign in:', insertError);
            } else {
              console.log('Created new user profile on sign in');
            }
          } catch (err) {
            console.error('Error in profile creation on sign in:', err);
          }
        }
        
        // Fetch saved offers for this user
        const { data: savedOffers } = await (supabase as any)
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
          savedOffers: savedOffers ? savedOffers.map((item: any) => item.offer_id) : []
        };
        
        setUser(updatedUser);
        
        // Save user to localStorage for offline access
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
      } else if (event === 'SIGNED_OUT') {
        // User signed out, revert to default user
        setUser({
          ...mockUser,
          location: 'India'
        });
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify({
          ...mockUser,
          location: 'India'
        }));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // save prevUser reference for the update closure
  const prevUser = React.useRef(user);
  
  useEffect(() => {
    prevUser.current = user;
  }, [user]);

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
      
      // Save to localStorage for offline access
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };

  // Function to save an offer to user's favorites in Supabase
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
        
        // Save to localStorage for offline access
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      });
      
      // If user is authenticated, save to Supabase
      if (authSession && authSession.user) {
        try {
          console.log('Saving to Supabase:', offerId, 'User ID:', authSession.user.id);
          const { error } = await (supabase as any)
            .from('saved_offers')
            .insert({
              user_id: authSession.user.id,
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
    } else {
      console.log('Offer already saved:', offerId);
    }
  };

  // Function to remove an offer from user's favorites in Supabase
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
    if (authSession && authSession.user) {
      try {
        console.log('Removing from Supabase:', offerId, 'User ID:', authSession.user.id);
        const { error } = await (supabase as any)
          .from('saved_offers')
          .delete()
          .eq('user_id', authSession.user.id)
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

  // Function to update user location and save to Supabase
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
    if (authSession && authSession.user) {
      try {
        const { error } = await (supabase as any)
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
