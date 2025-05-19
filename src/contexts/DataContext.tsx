
import React, { createContext, useContext } from 'react';
import { Offer, Category } from '@/types';
import { mockCategories, mockOffers } from '@/mockData';

interface DataContextType {
  offers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetchOffers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use mock data directly
  const offers = mockOffers;
  const categories = mockCategories;
  
  // Mock refetch function that resolves immediately
  const refetchOffers = async () => {
    console.log('Refetching offers (mock implementation)');
    return Promise.resolve();
  };

  return (
    <DataContext.Provider 
      value={{ 
        offers,
        categories,
        isLoading: false,
        error: null,
        refetchOffers
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
