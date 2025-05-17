
import React, { createContext, useState, useContext } from 'react';
import { User } from '@/types';
import { mockUser } from '@/mockData';

interface UserContextType {
  user: User;
  updatePoints: (amount: number) => void;
  saveOffer: (offerId: string) => void;
  unsaveOffer: (offerId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(mockUser);

  const updatePoints = (amount: number) => {
    setUser(prevUser => ({
      ...prevUser,
      points: prevUser.points + amount
    }));
  };

  const saveOffer = (offerId: string) => {
    if (!user.savedOffers.includes(offerId)) {
      setUser(prevUser => ({
        ...prevUser,
        savedOffers: [...prevUser.savedOffers, offerId],
        points: prevUser.points + 5 // Add 5 points for saving an offer
      }));
    }
  };

  const unsaveOffer = (offerId: string) => {
    setUser(prevUser => ({
      ...prevUser,
      savedOffers: prevUser.savedOffers.filter(id => id !== offerId)
    }));
  };

  return (
    <UserContext.Provider value={{ user, updatePoints, saveOffer, unsaveOffer }}>
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
