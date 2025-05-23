import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers, fetchUserPreferences, applyPreferencesToOffers } from '@/services/supabaseService';
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
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>(() => {
    const cachedPreferences = getCachedData('userPreferences');
    return cachedPreferences || {
      brands: [],
      stores: [],
      banks: []
    };
  });

  // Enhanced function to fetch user preferences
  const getUserPreferences = async (userId: string) => {
    try {
      if (!userId) return;
      
      console.log('Fetching preferences for user:', userId);
      
      // Fetch preferences from Supabase
      const { data: preferencesData, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user preferences:', error);
        return;
      }
      
      console.log('Received preferences data:', preferencesData?.length || 0, 'items');
      
      // Organize preferences by type
      const preferences = {
        brands: [] as string[],
        stores: [] as string[],
        banks: [] as string[]
      };
      
      preferencesData?.forEach(pref => {
        if (preferences[pref.preference_type as keyof typeof preferences]) {
          preferences[pref.preference_type as keyof typeof preferences].push(pref.preference_id);
        }
      });
      
      console.log('Organized preferences:', preferences);
      
      // Only update if we actually have preferences (avoid overwriting with empty arrays)
      if (preferencesData && preferencesData.length > 0) {
        setUserPreferences(preferences);
        saveToCache('userPreferences', preferences);
        
        toast({
          title: "Preferences loaded",
          description: "Your offer preferences have been applied",
        });
      } else {
        console.log('No preferences found for user');
      }
      
      // Filter offers based on preferences if we have offers
      if (offers.length > 0) {
        const hasPreferences = preferences.brands.length > 0 || 
                               preferences.stores.length > 0 || 
                               preferences.banks.length > 0;
        
        if (hasPreferences) {
          console.log('Applying preferences to filter offers');
          const filtered = applyPreferencesToOffers(offers, preferences);
          setFilteredOffers(filtered.length > 0 ? filtered : offers);
          saveToCache('filteredOffers', filtered.length > 0 ? filtered : offers);
        } else {
          console.log('No preferences to apply, showing all offers');
          setFilteredOffers(offers);
          saveToCache('filteredOffers', offers);
        }
      }
    } catch (err) {
      console.error('Error getting user preferences:', err);
    }
  };

  // Listen for auth changes to update preferences
  useEffect(() => {
    if (user && user.id) {
      console.log('User authenticated, fetching preferences');
      getUserPreferences(user.id);
    } else {
      console.log('User not authenticated or missing ID, resetting preferences');
      // Reset preferences and filtered offers when user logs out
      setUserPreferences({
        brands: [],
        stores: [],
        banks: []
      });
      setFilteredOffers(offers);
      saveToCache('filteredOffers', offers);
    }
  }, [user, user?.id]);

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
          // Refresh preferences when changes occur
          getUserPreferences(user.id);
        }
      )
      .subscribe();

    return () => {
      console.log('Removing preference changes listener');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchData = async () => {
    console.log('Starting to fetch data...');
    setIsLoading(true);
    setError(null);
    let usingMockData = false;
    
    // Check if we have recent cached data first
    const cachedOffers = getCachedData('offers');
    const cachedCategories = getCachedData('categories');
    
    if (cachedOffers && cachedCategories) {
      console.log('Using cached data');
      setOffers(cachedOffers);
      setCategories(cachedCategories);
      
      // Apply user preferences for filtering if user is logged in
      if (user && user.id) {
        getUserPreferences(user.id);
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
  
  const fetchFreshData = async (updateLoadingState = false) => {
    let usingMockData = false;
    
    try {
      // Try to fetch data from Supabase (specifically the Data table)
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      // Check if we got real data from the Data table
      if (offersData.length > 0 && offersData[0].id.startsWith('data-')) {
        console.log('Using real data from Supabase Data table');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply user preferences for filtering
        if (user && user.id) {
          const hasPreferences = userPreferences.brands.length > 0 || 
                                userPreferences.stores.length > 0 || 
                                userPreferences.banks.length > 0;
                                
          if (hasPreferences) {
            console.log('Applying preferences to offers');
            const filtered = applyPreferencesToOffers(offersData, userPreferences);
            console.log(`Filtered ${offersData.length} offers down to ${filtered.length} based on preferences`);
            setFilteredOffers(filtered.length > 0 ? filtered : offersData);
            saveToCache('filteredOffers', filtered.length > 0 ? filtered : offersData);
          } else {
            console.log('No preferences set, showing all offers');
            setFilteredOffers(offersData);
            saveToCache('filteredOffers', offersData);
          }
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
        usingMockData = true;
      }
      
      // For categories, use what we got or fall back to mock
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        saveToCache('categories', categoriesData);
      } else {
        setCategories(mockCategories);
        saveToCache('categories', mockCategories);
        usingMockData = true;
      }
      
      // Show toast if using mock data
      if (usingMockData) {
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
      setCategories(mockCategories);
      saveToCache('categories', mockCategories);
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

  useEffect(() => {
    fetchData();
  }, []);

  // Update filtered offers when offers or preferences change
  useEffect(() => {
    if (offers.length > 0) {
      const hasPreferences = userPreferences.brands.length > 0 || 
                             userPreferences.stores.length > 0 || 
                             userPreferences.banks.length > 0;
                             
      if (hasPreferences) {
        console.log('Preferences changed, refiltering offers');
        const filtered = applyPreferencesToOffers(offers, userPreferences);
        setFilteredOffers(filtered.length > 0 ? filtered : offers);
        saveToCache('filteredOffers', filtered.length > 0 ? filtered : offers);
      } else {
        console.log('No filtering preferences, showing all offers');
        setFilteredOffers(offers);
        saveToCache('filteredOffers', offers);
      }
    }
  }, [offers, userPreferences]);

  const refetchOffers = async () => {
    console.log('Refetching offers...');
    setIsLoading(true);
    try {
      const offersData = await fetchOffers();
      console.log('Refetch successful:', offersData.length, 'offers');
      
      if (offersData.length > 0 && offersData[0].id.startsWith('data-')) {
        console.log('Using real data from refetch');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply user preferences for filtering
        const hasPreferences = userPreferences.brands.length > 0 || 
                              userPreferences.stores.length > 0 || 
                              userPreferences.banks.length > 0;
                              
        if (user && user.id && hasPreferences) {
          const filtered = applyPreferencesToOffers(offersData, userPreferences);
          setFilteredOffers(filtered.length > 0 ? filtered : offersData);
          saveToCache('filteredOffers', filtered.length > 0 ? filtered : offersData);
        } else {
          setFilteredOffers(offersData);
          saveToCache('filteredOffers', offersData);
        }
        
        setError(null);
        setIsUsingMockData(false);
        
        toast({
          title: "Data refreshed",
          description: "Successfully loaded offers from the Data table.",
          variant: "default",
        });
      } else {
        // If no real data was found, keep using mock data
        console.log('No real data found in Data table on refetch, keeping mock data');
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
      }
    } catch (err) {
      console.error('Error refetching offers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error refreshing",
        description: "Could not refresh offers from the Data table. Please try again later.",
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
