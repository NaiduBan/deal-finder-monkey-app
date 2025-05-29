
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Offer, Category } from '@/types';
import { fetchOffers, fetchCategories } from '@/services/supabaseService';
import { useAuth } from './AuthContext';

interface DataContextType {
  offers: Offer[];
  categories: Category[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading data...');
      
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);

      console.log('Loaded offers:', offersData.length);
      console.log('Loaded categories:', categoriesData.length);

      setOffers(offersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const value = {
    offers,
    categories,
    isLoading,
    refreshData
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
