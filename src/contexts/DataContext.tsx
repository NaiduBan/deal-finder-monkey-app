import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { 
  fetchCategories, 
  fetchOffers, 
  getUserPreferences,
  filterOffersByPreferences, 
  triggerLinkMyDealsSync, 
  getLinkMyDealsSyncStatus 
} from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { mockOffers, mockCategories } from '@/mockData';
import { useUser } from '@/contexts/UserContext';
import { supabase } from "@/integrations/supabase/client";

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
  reloadPreferences: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Try to get cached data from localStorage
const getCachedData = (key: string) => {
  try {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Check if cache is less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving ${key} from cache:`, error);
    return null;
  }
};

// Save data to localStorage with a timestamp
const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error(`Error saving ${key} to cache:`, error);
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>(() => {
    const cachedOffers = getCachedData('offers');
    return cachedOffers || [];
  });
  
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(() => {
    const cachedFilteredOffers = getCachedData('filteredOffers');
    return cachedFilteredOffers || [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const cachedCategories = getCachedData('categories');
    return cachedCategories || [];
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { user } = useUser();
  
  const [userPreferences, setUserPreferences] = useState<{
    brands: string[],
    stores: string[],
    banks: string[]
  }>({
    brands: [],
    stores: [],
    banks: []
  });
  
  const [lastSyncStatus, setLastSyncStatus] = useState<any>(null);

  // Function to load user preferences from Supabase
  const loadUserPreferences = async (userId: string) => {
    if (!userId) return;
    
    console.log('Loading preferences for user:', userId);
    
    try {
      // Fetch preferences for each type
      const [brandsPrefs, storesPrefs, banksPrefs] = await Promise.all([
        getUserPreferences(userId, 'brands'),
        getUserPreferences(userId, 'stores'),
        getUserPreferences(userId, 'banks')
      ]);
      
      console.log('Preferences loaded:', {
        brands: brandsPrefs.length,
        stores: storesPrefs.length,
        banks: banksPrefs.length
      });
      
      const newPreferences = {
        brands: brandsPrefs,
        stores: storesPrefs,
        banks: banksPrefs
      };
      
      setUserPreferences(newPreferences);
      saveToCache('userPreferences', newPreferences);
      
      // Apply preferences to filter offers if we have any
      if (offers.length > 0) {
        applyPreferences(offers, newPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Function to apply preferences to filter offers
  const applyPreferences = (offersToFilter: Offer[], prefs: typeof userPreferences) => {
    const hasPreferences = 
      prefs.brands.length > 0 || 
      prefs.stores.length > 0 || 
      prefs.banks.length > 0;
      
    if (hasPreferences) {
      console.log('Applying preferences to filter offers');
      const filtered = filterOffersByPreferences(offersToFilter, prefs);
      
      if (filtered.length > 0) {
        setFilteredOffers(filtered);
        saveToCache('filteredOffers', filtered);
      } else {
        // If no offers match preferences, show all offers
        console.log('No offers match preferences, showing all offers');
        setFilteredOffers(offersToFilter);
        saveToCache('filteredOffers', offersToFilter);
      }
    } else {
      // If no preferences, show all offers
      console.log('No preferences set, showing all offers');
      setFilteredOffers(offersToFilter);
      saveToCache('filteredOffers', offersToFilter);
    }
  };

  // Load preferences when user changes
  useEffect(() => {
    if (user && user.id) {
      loadUserPreferences(user.id);
    } else {
      // Reset preferences and filtered offers when user logs out
      setUserPreferences({
        brands: [],
        stores: [],
        banks: []
      });
      setFilteredOffers(offers);
      saveToCache('filteredOffers', offers);
    }
  }, [user?.id]);

  // Listen for preference changes in the user_preferences table
  useEffect(() => {
    if (!user || !user.id) return;

    console.log('Setting up realtime listener for preference changes');
    
    const channel = supabase
      .channel('public:user_preferences')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Preference change detected:', payload);
          // Reload preferences when changes occur
          loadUserPreferences(user.id);
        }
      )
      .subscribe();

    return () => {
      console.log('Removing preference changes listener');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Get the sync status
  const getSyncStatus = async () => {
    try {
      const status = await getLinkMyDealsSyncStatus();
      setLastSyncStatus(status);
      return status;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  };

  // Main function to fetch data
  const fetchData = async () => {
    console.log('Starting to fetch data...');
    setIsLoading(true);
    setError(null);
    
    // Check if we have recent cached data first
    const cachedOffers = getCachedData('offers');
    const cachedCategories = getCachedData('categories');
    
    if (cachedOffers && cachedCategories) {
      console.log('Using cached data');
      setOffers(cachedOffers);
      setCategories(cachedCategories);
      
      // Apply user preferences for filtering if user is logged in
      if (user && user.id) {
        await loadUserPreferences(user.id);
      } else {
        setFilteredOffers(cachedOffers);
        saveToCache('filteredOffers', cachedOffers);
      }
      
      setIsLoading(false);
      setIsUsingMockData(false);
      
      // Still fetch fresh data in the background
      fetchFreshData();
      return;
    }
    
    // No valid cached data, fetch from Supabase
    fetchFreshData(true);
  };
  
  // Function to fetch fresh data from Supabase
  const fetchFreshData = async (updateLoadingState = false) => {
    try {
      // Try to fetch data from Supabase
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      // Check if we got real data from the Data table
      if (offersData.length > 0) {
        console.log('Using real data from Supabase Data table');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply user preferences for filtering
        if (user && user.id) {
          await loadUserPreferences(user.id);
        } else {
          setFilteredOffers(offersData);
          saveToCache('filteredOffers', offersData);
        }
        
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
          description: "No offers found in the database. Showing sample offers instead.",
          variant: "default",
        });
      }
      
      // For categories, use what we got or fall back to mock
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        saveToCache('categories', categoriesData);
      } else {
        setCategories(mockCategories);
        saveToCache('categories', mockCategories);
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
      setCategories(mockCategories);
      saveToCache('categories', mockCategories);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Error",
        description: "Could not fetch data from the database. Using sample data instead.",
        variant: "destructive",
      });
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
      console.log('Data fetching complete');
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchData();
    getSyncStatus(); // Get initial sync status
  }, []);
  
  // Public function to reload preferences
  const reloadPreferences = async () => {
    if (user && user.id) {
      await loadUserPreferences(user.id);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been refreshed."
      });
    }
  };

  // Public function to refetch offers
  const refetchOffers = async () => {
    console.log('Refetching offers...');
    setIsLoading(true);
    
    try {
      const offersData = await fetchOffers();
      console.log('Refetch successful:', offersData.length, 'offers');
      
      if (offersData.length > 0) {
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply user preferences for filtering
        if (user && user.id) {
          await loadUserPreferences(user.id);
        } else {
          setFilteredOffers(offersData);
          saveToCache('filteredOffers', offersData);
        }
        
        setError(null);
        setIsUsingMockData(false);
        
        toast({
          title: "Data refreshed",
          description: "Successfully loaded latest offers.",
          variant: "default",
        });
      } else {
        // If no data found, keep using mock data
        console.log('No offers found in database, keeping mock data');
        setIsUsingMockData(true);
        
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

  // Function to manually trigger LinkMyDeals sync
  const syncFromLinkMyDeals = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Syncing offers",
        description: "Fetching latest offers from LinkMyDeals...",
        variant: "default",
      });
      
      const success = await triggerLinkMyDealsSync();
      
      if (success) {
        toast({
          title: "Sync completed",
          description: "Successfully synchronized offers from LinkMyDeals",
          variant: "default",
        });
        
        // Update sync status
        await getSyncStatus();
        
        // Refetch offers to show the new data
        await refetchOffers();
      } else {
        toast({
          title: "Sync failed",
          description: "Failed to synchronize offers from LinkMyDeals",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error syncing from LinkMyDeals:', err);
      toast({
        title: "Error syncing",
        description: "An error occurred while syncing offers",
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
        filteredOffers,
        categories,
        isLoading,
        error,
        refetchOffers,
        isUsingMockData,
        syncFromLinkMyDeals,
        lastSyncStatus,
        reloadPreferences
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
