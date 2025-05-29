
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserSavedOffers, saveOfferForUser, unsaveOfferForUser } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  savedOffers: string[];
}

interface UserContextType {
  user: User;
  isLoading: boolean;
  saveOffer: (offerId: string) => Promise<void>;
  unsaveOffer: (offerId: string) => Promise<void>;
  isOfferSaved: (offerId: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User>({
    id: '',
    email: '',
    savedOffers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('User authenticated, fetching saved offers');
      
      const savedOffers = await fetchUserSavedOffers(session.user.id);
      
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || '',
        avatar: session.user.user_metadata?.avatar_url || '',
        savedOffers
      });

      console.log('User data loaded:', {
        savedOffers: savedOffers.length
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const saveOffer = useCallback(async (offerId: string) => {
    if (!session?.user) return;

    try {
      const success = await saveOfferForUser(session.user.id, offerId);
      if (success) {
        setUser(prev => ({
          ...prev,
          savedOffers: [...prev.savedOffers, offerId]
        }));
        toast({
          title: "Offer saved!",
          description: "Offer has been added to your saved list",
        });
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive"
      });
    }
  }, [session, toast]);

  const unsaveOffer = useCallback(async (offerId: string) => {
    if (!session?.user) return;

    try {
      const success = await unsaveOfferForUser(session.user.id, offerId);
      if (success) {
        setUser(prev => ({
          ...prev,
          savedOffers: prev.savedOffers.filter(id => id !== offerId)
        }));
        toast({
          title: "Offer removed",
          description: "Offer has been removed from your saved list",
        });
      }
    } catch (error) {
      console.error('Error unsaving offer:', error);
      toast({
        title: "Error",
        description: "Failed to remove offer",
        variant: "destructive"
      });
    }
  }, [session, toast]);

  const isOfferSaved = useCallback((offerId: string) => {
    return user.savedOffers.includes(offerId);
  }, [user.savedOffers]);

  const refreshUserData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  const value = {
    user,
    isLoading,
    saveOffer,
    unsaveOffer,
    isOfferSaved,
    refreshUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
