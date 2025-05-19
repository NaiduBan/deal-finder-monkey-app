import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { mockOffers, mockCategories } from '@/mockData';

interface DataContextType {
  offers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetchOffers: () => Promise<void>;
  isUsingMockData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchData = async () => {
    console.log('Starting to fetch data...');
    setIsLoading(true);
    setError(null);
    let usingMockData = false;
    
    try {
      // Try to fetch data from Supabase
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      // Check if we got real data or if the service fell back to mock data
      if (offersData.length > 0 && offersData[0].id.startsWith('data-')) {
        console.log('Using real data from Supabase');
        setOffers(offersData);
        setIsUsingMockData(false);
      } else {
        console.log('No data from Supabase, using mock offers');
        setOffers(mockOffers);
        setIsUsingMockData(true);
        usingMockData = true;
      }
      
      // For categories, use what we got or fall back to mock
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        setCategories(mockCategories);
        usingMockData = true;
      }
      
      // Show toast if using mock data
      if (usingMockData) {
        toast({
          title: "Using sample data",
          description: "Could not connect to the database. Showing sample offers instead.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Fall back to mock data if there's an error
      console.log('Falling back to mock data due to error');
      setOffers(mockOffers);
      setCategories(mockCategories);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Error",
        description: "Could not fetch real offers. Using sample data instead.",
        variant: "destructive",
      });
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
      
      if (offersData.length > 0) {
        setOffers(offersData);
        setError(null);
        setIsUsingMockData(false);
      } else {
        // If no real data was found, keep using mock data
        console.log('No real data found on refetch, keeping mock data');
        toast({
          title: "No offers found",
          description: "Could not find any offers in the database.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error refetching offers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error refreshing",
        description: "Could not refresh offers. Please try again later.",
        variant: "destructive",
      });
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
        refetchOffers,
        isUsingMockData
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
