
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers, applyPreferencesToOffers } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
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

// Cache management with shorter expiration time (10 minutes)
const getCachedData = (key: string) => {
  try {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < 600000) {  // 10 minutes in milliseconds
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving ${key} from cache:`, error);
    return null;
  }
};

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
      
      const { data: preferencesData, error } = await (supabase as any)
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user preferences:', error);
        return;
      }
      
      console.log('Received preferences data:', preferencesData?.length || 0, 'items');
      
      const preferences = {
        brands: [] as string[],
        stores: [] as string[],
        banks: [] as string[]
      };
      
      preferencesData?.forEach((pref: any) => {
        if (preferences[pref.preference_type as keyof typeof preferences]) {
          preferences[pref.preference_type as keyof typeof preferences].push(pref.preference_id);
        }
      });
      
      console.log('Organized preferences:', preferences);
      
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
    console.log('Starting to fetch fresh data from Offers_data table...');
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchFreshData(true);
    } catch (error) {
      console.error('Error fetching fresh data:', error);
      
      // Check if we have cached data as fallback
      const cachedOffers = getCachedData('offers');
      const cachedCategories = getCachedData('categories');
      
      if (cachedOffers && cachedCategories) {
        console.log('Using cached data as fallback');
        setOffers(cachedOffers);
        setCategories(cachedCategories);
        
        if (user && user.id) {
          getUserPreferences(user.id);
        } else {
          setFilteredOffers(cachedOffers);
          saveToCache('filteredOffers', cachedOffers);
        }
        
        setIsLoading(false);
        setIsUsingMockData(false);
      } else {
        // No data available at all
        console.log('No data available from Offers_data table');
        setOffers([]);
        setFilteredOffers([]);
        setCategories([]);
        setIsUsingMockData(true);
        setIsLoading(false);
        
        toast({
          title: "No data available",
          description: "Could not find data in the Offers_data table.",
          variant: "default",
        });
      }
    }
  };
  
  const fetchFreshData = async (updateLoadingState = false) => {
    try {
      console.log('Fetching data from Offers_data table...');
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      if (offersData.length > 0) {
        console.log('Using real data from Supabase Offers_data table');
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
        console.log('No data from Supabase Offers_data table');
        setOffers([]);
        setFilteredOffers([]);
        saveToCache('offers', []);
        saveToCache('filteredOffers', []);
        setIsUsingMockData(true);
      }
      
      // Set categories
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        saveToCache('categories', categoriesData);
      } else {
        setCategories([]);
        saveToCache('categories', []);
      }
      
      if (offersData.length === 0) {
        toast({
          title: "No offers found",
          description: "No data available in the Offers_data table.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      setOffers([]);
      setFilteredOffers([]);
      setCategories([]);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Error",
        description: "Could not fetch data from the Offers_data table.",
        variant: "destructive",
      });
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
      console.log('Data fetching complete');
    }
  };

  // Initialize and load data
  useEffect(() => {
    fetchData();
    
    // Set up a refresh interval to get new data every 30 minutes
    const refreshInterval = setInterval(() => {
      console.log('Automatic refresh triggered');
      fetchFreshData(false);
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(refreshInterval);
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
    console.log('Refetching offers from Offers_data table...');
    setIsLoading(true);
    
    try {
      localStorage.removeItem('offers');
      localStorage.removeItem('filteredOffers');
      console.log('Cache cleared for refresh');
    } catch (err) {
      console.warn('Error clearing cache:', err);
    }
    
    try {
      const offersData = await fetchOffers();
      console.log('Refetch successful:', offersData.length, 'offers');
      
      if (offersData.length > 0) {
        console.log('Using real data from refetch');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
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
          description: "Successfully loaded offers from the Offers_data table.",
          variant: "default",
        });
      } else {
        console.log('No real data found in Offers_data table on refetch');
        setOffers([]);
        setFilteredOffers([]);
        saveToCache('offers', []);
        saveToCache('filteredOffers', []);
        setIsUsingMockData(true);
        
        toast({
          title: "No offers found",
          description: "Could not find any offers in the Offers_data table.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error refetching offers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error refreshing",
        description: "Could not refresh offers from the Offers_data table. Please try again later.",
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
