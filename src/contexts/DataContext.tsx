
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
  refetchOffers: () => Promise<Offer[]>;
  isUsingMockData: boolean;
  filteredOffers: Offer[];
  syncFromLinkMyDeals: () => Promise<boolean>;
  lastSyncStatus: any;
  dailyApiLimitInfo?: {
    used: number;
    remaining: number;
    resetDate: string;
  };
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

  // Calculate API limit information
  const dailyApiLimitInfo = lastSyncStatus ? {
    used: lastSyncStatus.daily_extracts || 0,
    remaining: 25 - (lastSyncStatus.daily_extracts || 0),
    resetDate: lastSyncStatus.daily_extracts_reset_date || new Date().toISOString().split('T')[0]
  } : undefined;

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
        lastSyncStatus,
        dailyApiLimitInfo
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
