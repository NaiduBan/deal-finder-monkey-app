
import { useState, useEffect } from 'react';
import { Offer } from '@/types';
import { fetchOffers } from '@/services/supabaseService';
import { mockOffers } from '@/mockData';
import { toast } from '@/components/ui/use-toast';
import { getCachedData, saveToCache } from '@/utils/cacheUtils';

/**
 * Hook for managing offers data
 */
export const useOffersData = () => {
  const [offers, setOffers] = useState<Offer[]>(() => {
    const cachedOffers = getCachedData('offers');
    return cachedOffers || [];
  });
  
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(() => {
    const cachedFilteredOffers = getCachedData('filteredOffers');
    return cachedFilteredOffers || [];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Function to fetch offers data from the API
  const fetchData = async (updateLoadingState = true) => {
    if (updateLoadingState) {
      setIsLoading(true);
    }

    try {
      const offersData = await fetchOffers();
      
      if (offersData.length > 0 && offersData[0].id.startsWith('data-')) {
        console.log('Using real data from Supabase Data table');
        setOffers(offersData);
        saveToCache('offers', offersData);
        setFilteredOffers(offersData);
        saveToCache('filteredOffers', offersData);
        setIsUsingMockData(false);
      } else {
        console.log('No data from Supabase Data table, using mock offers');
        setOffers(mockOffers);
        setFilteredOffers(mockOffers);
        saveToCache('offers', mockOffers);
        saveToCache('filteredOffers', mockOffers);
        setIsUsingMockData(true);
        
        toast({
          title: "Using sample data",
          description: "Could not find data in the Data table. Showing sample offers instead.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Fall back to mock data if there's an error
      console.log('Falling back to mock data due to error');
      setOffers(mockOffers);
      setFilteredOffers(mockOffers);
      saveToCache('offers', mockOffers);
      saveToCache('filteredOffers', mockOffers);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Error",
        description: "Could not fetch data from the Data table. Using sample data instead.",
        variant: "destructive",
      });
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
      console.log('Data fetching complete');
    }
  };

  // Function to manually refetch offers
  const refetchOffers = async (): Promise<Offer[]> => {
    console.log('Refetching offers...');
    setIsLoading(true);

    try {
      const offersData = await fetchOffers();
      
      if (offersData.length > 0 && offersData[0].id.startsWith('data-')) {
        setOffers(offersData);
        saveToCache('offers', offersData);
        setFilteredOffers(offersData);
        saveToCache('filteredOffers', offersData);
        setError(null);
        setIsUsingMockData(false);
        
        toast({
          title: "Data refreshed",
          description: "Successfully loaded offers from the Data table.",
          variant: "default",
        });
        
        return offersData;
      } else {
        setOffers(mockOffers);
        setFilteredOffers(mockOffers);
        saveToCache('offers', mockOffers);
        saveToCache('filteredOffers', mockOffers);
        setIsUsingMockData(true);
        
        toast({
          title: "No offers found",
          description: "Could not find any offers in the Data table.",
          variant: "default",
        });
        
        return mockOffers;
      }
    } catch (err) {
      console.error('Error refetching offers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error refreshing",
        description: "Could not refresh offers from the Data table. Please try again later.",
        variant: "destructive",
      });
      
      return offers;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize by fetching data
  useEffect(() => {
    const cachedOffers = getCachedData('offers');
    const cachedFilteredOffers = getCachedData('filteredOffers');
    
    if (cachedOffers && cachedFilteredOffers) {
      console.log('Using cached offers data');
      setOffers(cachedOffers);
      setFilteredOffers(cachedFilteredOffers);
      setIsLoading(false);
      
      // Still fetch fresh data in the background
      fetchData(false);
    } else {
      // No valid cached data, fetch from API
      fetchData(true);
    }
  }, []);

  return {
    offers,
    filteredOffers,
    setFilteredOffers,
    isLoading,
    error,
    isUsingMockData,
    refetchOffers
  };
};
