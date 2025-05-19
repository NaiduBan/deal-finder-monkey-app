
import React, { createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Offer, Category } from '@/types';
import { apiService } from '@/services/api';
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
  // Use React Query to fetch and cache offers
  const { 
    data: offers = [], 
    isLoading: isLoadingOffers,
    error: offersError,
    refetch: refetchOffersQuery
  } = useQuery({
    queryKey: ['offers'],
    queryFn: apiService.getOffers,
    // Fall back to mock data if the API fails
    onError: (error) => {
      console.error('Failed to fetch offers from API, using mock data', error);
    }
  });

  // For categories, we'll use the mock data for now
  // In a real app, you might want to extract categories from the offers or have a separate API endpoint
  const categories = mockCategories;

  // Helper function to refetch data
  const refetchOffers = async () => {
    try {
      await refetchOffersQuery();
    } catch (error) {
      console.error('Error refetching offers:', error);
    }
  };

  // Use either API data or fallback to mock data if API fails
  const finalOffers = offers.length > 0 ? offers : mockOffers;

  return (
    <DataContext.Provider 
      value={{ 
        offers: finalOffers, 
        categories,
        isLoading: isLoadingOffers,
        error: offersError as Error | null,
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
