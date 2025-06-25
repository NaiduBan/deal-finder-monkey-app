import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers, applyPreferencesToOffers } from '@/services/mysqlService';
import { toast } from '@/components/ui/use-toast';
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>({
    brands: [],
    stores: [],
    banks: []
  });

  // Get current user session
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        console.log('Current user ID set:', session.user.id);
      } else {
        setCurrentUserId(null);
        console.log('No current user found');
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setCurrentUserId(session.user.id);
      } else {
        setCurrentUserId(null);
        // Reset preferences when user logs out
        setUserPreferences({
          brands: [],
          stores: [],
          banks: []
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced function to fetch user preferences
  const getUserPreferences = async (userId: string) => {
    try {
      if (!userId) {
        console.log('No user ID provided for preferences');
        return;
      }
      
      console.log('Fetching preferences for user:', userId);
      
      const { data: preferencesData, error } = await supabase
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
      setUserPreferences(preferences);
      saveToCache('userPreferences', preferences);
      
      if (preferencesData && preferencesData.length > 0) {
        console.log('User has personalization preferences applied');
        
        toast({
          title: "Preferences loaded",
          description: "Your offer preferences have been applied",
        });
      } else {
        console.log('No preferences found for user');
      }
      
      return preferences;
    } catch (err) {
      console.error('Error getting user preferences:', err);
      return null;
    }
  };

  // Apply preferences to offers
  const applyPreferencesToCurrentOffers = (currentOffers: Offer[], preferences: {[key: string]: string[]}) => {
    const hasPreferences = preferences.brands.length > 0 || 
                           preferences.stores.length > 0 || 
                           preferences.banks.length > 0;
    
    if (hasPreferences && currentOffers.length > 0) {
      console.log('Applying preferences to filter offers');
      const filtered = applyPreferencesToOffers(currentOffers, preferences);
      const finalOffers = filtered.length > 0 ? filtered : currentOffers;
      setFilteredOffers(finalOffers);
      saveToCache('filteredOffers', finalOffers);
      return finalOffers;
    } else {
      console.log('No preferences to apply or no offers, showing all offers');
      setFilteredOffers(currentOffers);
      saveToCache('filteredOffers', currentOffers);
      return currentOffers;
    }
  };

  // Load user preferences when user changes
  useEffect(() => {
    if (currentUserId) {
      console.log('User authenticated, fetching preferences for:', currentUserId);
      getUserPreferences(currentUserId).then((preferences) => {
        if (preferences && offers.length > 0) {
          // Apply preferences immediately when both are available
          applyPreferencesToCurrentOffers(offers, preferences);
        }
      });
    } else {
      console.log('User not authenticated, resetting preferences');
      const resetPreferences = {
        brands: [],
        stores: [],
        banks: []
      };
      setUserPreferences(resetPreferences);
      
      // Show all offers when no user
      if (offers.length > 0) {
        setFilteredOffers(offers);
        saveToCache('filteredOffers', offers);
      }
    }
  }, [currentUserId]);

  // Listen for preference changes in the user_preferences table
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up realtime listener for preference changes');
    
    const channel = supabase
      .channel('public:user_preferences')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_preferences',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('Preference change detected:', payload);
          getUserPreferences(currentUserId).then((preferences) => {
            if (preferences && offers.length > 0) {
              applyPreferencesToCurrentOffers(offers, preferences);
            }
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Removing preference changes listener');
      supabase.removeChannel(channel);
    };
  }, [currentUserId, offers]);

  // Update filtered offers when offers change and we have preferences
  useEffect(() => {
    if (offers.length > 0 && currentUserId) {
      console.log('Offers loaded, applying current preferences');
      applyPreferencesToCurrentOffers(offers, userPreferences);
    } else if (offers.length > 0) {
      console.log('Offers loaded, no user preferences to apply');
      setFilteredOffers(offers);
      saveToCache('filteredOffers', offers);
    }
  }, [offers]);

  const fetchData = async () => {
    console.log('🚀 Starting to fetch fresh data from MySQL offers_data table...');
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchFreshData(true);
    } catch (error) {
      console.error('❌ Error fetching fresh data from MySQL:', error);
      
      // Check if we have cached data as fallback
      const cachedOffers = getCachedData('offers');
      const cachedCategories = getCachedData('categories');
      
      if (cachedOffers && cachedCategories) {
        console.log('📦 Using cached data as fallback');
        setOffers(cachedOffers);
        setCategories(cachedCategories);
        
        // Apply preferences if user is authenticated
        if (currentUserId) {
          const cachedPreferences = getCachedData('userPreferences') || userPreferences;
          applyPreferencesToCurrentOffers(cachedOffers, cachedPreferences);
        } else {
          setFilteredOffers(cachedOffers);
          saveToCache('filteredOffers', cachedOffers);
        }
        
        setIsLoading(false);
        setIsUsingMockData(false);
      } else {
        // No data available at all
        console.log('❌ No data available from MySQL offers_data table');
        setOffers([]);
        setFilteredOffers([]);
        setCategories([]);
        setIsUsingMockData(true);
        setIsLoading(false);
        
        toast({
          title: "Connection Error",
          description: "Could not connect to MySQL database. Please check your connection.",
          variant: "destructive",
        });
      }
    }
  };
  
  const fetchFreshData = async (updateLoadingState = false) => {
    try {
      console.log('📊 Fetching data from MySQL offers_data table...');
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('✅ MySQL fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      if (offersData.length > 0) {
        console.log('🎉 Using real data from MySQL offers_data table');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply user preferences for filtering if user is authenticated
        if (currentUserId) {
          const currentPreferences = userPreferences.brands.length > 0 || 
                                   userPreferences.stores.length > 0 || 
                                   userPreferences.banks.length > 0 
                                   ? userPreferences 
                                   : getCachedData('userPreferences') || userPreferences;
          
          applyPreferencesToCurrentOffers(offersData, currentPreferences);
        } else {
          setFilteredOffers(offersData);
          saveToCache('filteredOffers', offersData);
        }
        
        setIsUsingMockData(false);
        
        toast({
          title: "✅ MySQL Connected",
          description: `Successfully loaded ${offersData.length} offers from MySQL database`,
        });
      } else {
        console.log('⚠️ No data from MySQL offers_data table');
        setOffers([]);
        setFilteredOffers([]);
        saveToCache('offers', []);
        saveToCache('filteredOffers', []);
        setIsUsingMockData(true);
        
        toast({
          title: "No Data",
          description: "No offers found in MySQL database",
          variant: "default",
        });
      }
      
      // Set categories
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        saveToCache('categories', categoriesData);
      } else {
        setCategories([]);
        saveToCache('categories', []);
      }
    } catch (err) {
      console.error('❌ Error fetching data from MySQL:', err);
      setError(err instanceof Error ? err : new Error('MySQL connection failed'));
      
      setOffers([]);
      setFilteredOffers([]);
      setCategories([]);
      setIsUsingMockData(true);
      
      toast({
        title: "MySQL Connection Error",
        description: "Could not fetch data from MySQL database. Please check connection.",
        variant: "destructive",
      });
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
      console.log('✅ MySQL data fetching complete');
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

  const refetchOffers = async () => {
    console.log('🔄 Refetching offers from MySQL offers_data table...');
    setIsLoading(true);
    
    try {
      localStorage.removeItem('offers');
      localStorage.removeItem('filteredOffers');
      console.log('🗑️ Cache cleared for refresh');
    } catch (err) {
      console.warn('⚠️ Error clearing cache:', err);
    }
    
    try {
      const offersData = await fetchOffers();
      console.log('✅ MySQL refetch successful:', offersData.length, 'offers');
      
      if (offersData.length > 0) {
        console.log('🎉 Using real data from MySQL refetch');
        setOffers(offersData);
        saveToCache('offers', offersData);
        
        // Apply current user preferences
        if (currentUserId) {
          applyPreferencesToCurrentOffers(offersData, userPreferences);
        } else {
          setFilteredOffers(offersData);
          saveToCache('filteredOffers', offersData);
        }
        
        setError(null);
        setIsUsingMockData(false);
        
        toast({
          title: "✅ Data Refreshed",
          description: `Successfully refreshed ${offersData.length} offers from MySQL`,
        });
      } else {
        console.log('⚠️ No real data found in MySQL offers_data table on refetch');
        setOffers([]);
        setFilteredOffers([]);
        saveToCache('offers', []);
        saveToCache('filteredOffers', []);
        setIsUsingMockData(true);
        
        toast({
          title: "No Data",
          description: "Could not find any offers in MySQL database",
        });
      }
    } catch (err) {
      console.error('❌ Error refetching offers from MySQL:', err);
      setError(err instanceof Error ? err : new Error('MySQL refetch failed'));
      
      toast({
        title: "Refresh Error",
        description: "Could not refresh offers from MySQL database. Please try again.",
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
