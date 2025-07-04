
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Offer, Category } from '@/types';
import { fetchCategories, fetchOffers, applyPreferencesToOffers } from '@/services/supabaseService';
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      return finalOffers;
    } else {
      console.log('No preferences to apply or no offers, showing all offers');
      setFilteredOffers(currentOffers);
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
    }
  }, [offers]);

  const fetchData = async () => {
    console.log('Starting to fetch fresh data from Offers_data table...');
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchFreshData(true);
    } catch (error) {
      console.error('Error fetching fresh data:', error);
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
  };
  
  const fetchFreshData = async (updateLoadingState = false) => {
    try {
      console.log('Fetching fresh data from Offers_data table...');
      const [offersData, categoriesData] = await Promise.all([
        fetchOffers(),
        fetchCategories()
      ]);
      
      console.log('Fetch successful:', offersData.length, 'offers,', categoriesData.length, 'categories');
      
      if (offersData.length > 0) {
        console.log('Using real data from Supabase Offers_data table');
        setOffers(offersData);
        
        // Apply user preferences for filtering if user is authenticated
        if (currentUserId) {
          applyPreferencesToCurrentOffers(offersData, userPreferences);
        } else {
          setFilteredOffers(offersData);
        }
        
        setIsUsingMockData(false);
      } else {
        console.log('No data from Supabase Offers_data table');
        setOffers([]);
        setFilteredOffers([]);
        setIsUsingMockData(true);
      }
      
      // Set categories
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        setCategories([]);
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

  const refetchOffers = async () => {
    console.log('Refetching offers from Offers_data table...');
    setIsLoading(true);
    
    try {
      const offersData = await fetchOffers();
      console.log('Refetch successful:', offersData.length, 'offers');
      
      if (offersData.length > 0) {
        console.log('Using real data from refetch');
        setOffers(offersData);
        
        // Apply current user preferences
        if (currentUserId) {
          applyPreferencesToCurrentOffers(offersData, userPreferences);
        } else {
          setFilteredOffers(offersData);
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
