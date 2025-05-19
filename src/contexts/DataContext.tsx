
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers } from '@/services/supabaseService';

interface DataContextType {
  offers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetchOffers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    console.log('Starting to fetch data...');
    setIsLoading(true);
    setError(null);
    try {
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      setOffers(offersData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      // Fallback to mock data if there's an error
      console.log('Falling back to mock data');
      try {
        const { mockOffers, mockCategories } = await import('@/mockData');
        console.log('Mock data loaded:', mockOffers.length, 'offers,', mockCategories.length, 'categories');
        setOffers(mockOffers);
        setCategories(mockCategories);
      } catch (mockErr) {
        console.error('Error loading mock data:', mockErr);
      }
    } finally {
      setIsLoading(false);
      console.log('Data fetching complete');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetchOffers = async () => {
    console.log('Refetching offers...');
    setIsLoading(true);
    try {
      const offersData = await fetchOffers();
      console.log('Refetch successful:', offersData.length, 'offers');
      setOffers(offersData);
      setError(null);
    } catch (err) {
      console.error('Error refetching offers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider 
      value={{ 
        offers,
        categories,
        isLoading,
        error,
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
