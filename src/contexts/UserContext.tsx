
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';
import { useToast } from '@/hooks/use-toast';

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
    return savedUser ? JSON.parse(savedUser) : mockUser;
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return mockUser;
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const { toast } = useToast();

  // Save user to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

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

  const saveOffer = (offerId: string) => {
    if (!user.savedOffers.includes(offerId)) {
      setUser(prevUser => ({
        ...prevUser,
        savedOffers: [...prevUser.savedOffers, offerId],
        points: prevUser.points + 5 // Add 5 points for saving an offer
      }));
      toast({
        title: "Offer saved!",
        description: "The offer has been added to your saved items and you've earned 5 points!",
      });
    }
  };

  const unsaveOffer = (offerId: string) => {
    setUser(prevUser => ({
      ...prevUser,
      savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
    }));
  };

  const isOfferSaved = (offerId: string) => {
    return user.savedOffers.includes(offerId);
  };

  const updateLocation = (location: string) => {
    setUser(prevUser => ({
      ...prevUser,
      location
    }));
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
