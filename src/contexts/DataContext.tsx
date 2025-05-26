import React, { createContext, useState, useContext, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchOffers, fetchCategories, searchOffers } from '@/services/supabaseService';
import { useUser } from './UserContext';
import { filterOffersByPreferences } from '@/utils/preferenceFilter';

interface DataContextType {
  offers: Offer[];
  allOffers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  searchOffers: (query: string) => Promise<Offer[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userPreferences, hasPreferences } = useUser();

  // Apply preference filtering whenever offers or preferences change
  useEffect(() => {
    if (allOffers.length > 0) {
      const filtered = filterOffersByPreferences(allOffers, userPreferences);
      console.log('Applying preference filter:', {
        total: allOffers.length,
        filtered: filtered.length,
        hasPreferences
      });
      setOffers(filtered);
    }
  }, [allOffers, userPreferences, hasPreferences]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const fetchedOffers = await fetchOffers();
      setAllOffers(fetchedOffers);
      
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    offers,
    allOffers,
    categories,
    isLoading,
    error,
    refreshData,
    searchOffers: async (query: string) => {
      const results = await searchOffers(query);
      // Apply preference filtering to search results as well
      return filterOffersByPreferences(results, userPreferences);
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
