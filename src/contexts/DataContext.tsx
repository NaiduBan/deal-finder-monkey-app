
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Offer, Category } from '@/types';
import { fetchOffers, fetchCategories } from '@/services/supabaseService';
import { useAuth } from './AuthContext';

interface DataContextType {
  offers: Offer[];
  filteredOffers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  refetchOffers: () => Promise<void>;
  isUsingMockData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { session } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading data...');
      
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);

      console.log('Loaded offers:', offersData.length);
      console.log('Loaded categories:', categoriesData.length);

      setOffers(offersData);
      setCategories(categoriesData);
      setIsUsingMockData(offersData.length === 0);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error as Error);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const refetchOffers = useCallback(async () => {
    try {
      const offersData = await fetchOffers();
      setOffers(offersData);
      setIsUsingMockData(offersData.length === 0);
    } catch (error) {
      console.error('Error refetching offers:', error);
      setError(error as Error);
    }
  }, []);

  const value = {
    offers,
    filteredOffers: offers, // For now, filteredOffers is the same as offers since we removed preferences
    categories,
    isLoading,
    error,
    refreshData,
    refetchOffers,
    isUsingMockData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
