
import React, { createContext, useContext } from 'react';
import { Offer, Category } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useOffersData } from '@/hooks/useOffersData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { usePreferences } from '@/hooks/usePreferences';
import { useSyncStatus } from '@/hooks/useSyncStatus';

interface DataContextType {
  offers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetchOffers: () => Promise<void>;
  isUsingMockData: boolean;
  filteredOffers: Offer[];
  syncFromLinkMyDeals: () => Promise<void>;
  lastSyncStatus: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  
  // Use our custom hooks to manage different aspects of data
  const { 
    offers, 
    filteredOffers, 
    setFilteredOffers,
    isLoading, 
    error, 
    isUsingMockData,
    refetchOffers 
  } = useOffersData();
  
  const { categories } = useCategoriesData();
  
  const { lastSyncStatus, syncFromLinkMyDeals } = useSyncStatus();
  
  // Use preferences hook to filter offers based on user preferences
  usePreferences(user?.id, offers, setFilteredOffers);

  return (
    <DataContext.Provider 
      value={{ 
        offers,
        filteredOffers,
        categories,
        isLoading,
        error,
        refetchOffers,
        isUsingMockData,
        syncFromLinkMyDeals,
        lastSyncStatus
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
