
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';
import { fetchUserSavedOffers, saveOfferForUser, unsaveOfferForUser } from '@/services/mockApiService';

interface UserContextType {
  user: User;
  saveOffer: (offerId: string) => void;
  unsaveOffer: (offerId: string) => void;
  isOfferSaved: (offerId: string) => boolean;
  updateLocation: (location: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialUser = (): User => {
  // Always start with clean mock user
  return {
    ...mockUser,
    location: 'India',
    savedOffers: [],
    points: 0
  };
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user from mock auth
  useEffect(() => {
    const getCurrentUser = () => {
      const mockSession = localStorage.getItem('mock_session');
      if (mockSession) {
        const session = JSON.parse(mockSession);
        if (session.user) {
          console.log('UserContext: Syncing with authenticated user', session.user.id);
          setCurrentUserId(session.user.id);
          setUser(prevUser => ({
            ...prevUser,
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            location: 'India',
            points: 0
          }));
          
          // Fetch saved offers for authenticated user
          fetchUserSavedOffers(session.user.id).then(savedOffers => {
            setUser(prevUser => ({
              ...prevUser,
              savedOffers: savedOffers
            }));
          }).catch(error => {
            console.error('Error fetching saved offers:', error);
          });
        }
      } else {
        console.log('UserContext: No session, using guest user');
        setCurrentUserId(null);
        const guestUser = {
          ...mockUser,
          location: 'India',
          savedOffers: [],
          points: 0
        };
        setUser(guestUser);
      }
    };

    getCurrentUser();

    // Listen for storage changes to detect auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mock_session') {
        getCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mock real-time subscription for saved offers
  useEffect(() => {
    if (!currentUserId) return;

    // Mock real-time updates by periodically checking saved offers
    const interval = setInterval(() => {
      fetchUserSavedOffers(currentUserId).then(savedOffers => {
        setUser(prevUser => ({
          ...prevUser,
          savedOffers: savedOffers
        }));
      }).catch(error => {
        console.error('Error fetching saved offers:', error);
      });
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId]);

  const saveOffer = async (offerId: string) => {
    console.log('Saving offer:', offerId);
    
    if (!user.savedOffers.includes(offerId)) {
      // Update local state first for responsiveness
      setUser(prevUser => ({
        ...prevUser,
        savedOffers: [...prevUser.savedOffers, offerId]
      }));
      
      // If user is authenticated, save using mock API
      if (currentUserId) {
        try {
          console.log('Saving to mock API:', offerId, 'User ID:', currentUserId);
          const success = await saveOfferForUser(currentUserId, offerId);
            
          if (!success) {
            // Revert local state if mock API update fails
            setUser(prevUser => ({
              ...prevUser,
              savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
            }));
            
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
    setUser(prevUser => ({
      ...prevUser,
      savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
    }));
    
    // If user is authenticated, remove using mock API
    if (currentUserId) {
      try {
        console.log('Removing from mock API:', offerId, 'User ID:', currentUserId);
        const success = await unsaveOfferForUser(currentUserId, offerId);
          
        if (!success) {
          // Revert local state if mock API update fails
          setUser(prevUser => ({
            ...prevUser,
            savedOffers: [...prevUser.savedOffers, offerId]
          }));
          
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
    setUser(prevUser => ({
      ...prevUser,
      location
    }));
    
    // If user is authenticated, update location in mock storage
    if (currentUserId) {
      try {
        // In a real app, this would update the user profile via mock API
        console.log('Location updated in mock storage for user:', currentUserId);
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
