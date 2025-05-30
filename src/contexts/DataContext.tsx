import React, { createContext, useState, useEffect, useContext } from 'react';
import { Offer, Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getMockOffers } from '@/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface DataContextType {
  offers: Offer[];
  filteredOffers: Offer[];
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetchOffers: () => Promise<Offer[]>;
  isUsingMockData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>({
    brands: [],
    stores: [],
    banks: []
  });

  const { session } = useAuth();

  // Fetch user preferences
  const fetchUserPreferences = async () => {
    if (!session?.user) {
      setUserPreferences({ brands: [], stores: [], banks: [] });
      return;
    }

    try {
      console.log("Fetching preferences for user:", session.user.id);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) {
        console.error('Error fetching user preferences:', error);
        return;
      }

      if (data) {
        console.log("Received preferences data:", data.length, "items");
        const preferences: {[key: string]: string[]} = {
          brands: data.filter(p => p.preference_type === 'brands').map(p => p.preference_id),
          stores: data.filter(p => p.preference_type === 'stores').map(p => p.preference_id),
          banks: data.filter(p => p.preference_type === 'banks').map(p => p.preference_id)
        };
        
        console.log("Organized preferences:", preferences);
        setUserPreferences(preferences);
        return preferences;
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    
    return { brands: [], stores: [], banks: [] };
  };

  // Apply preferences to filter offers
  const applyPreferencesToOffers = (offersToFilter: Offer[], preferences: {[key: string]: string[]}) => {
    // If no preferences are set, return all offers
    if (preferences.brands.length === 0 && preferences.stores.length === 0 && preferences.banks.length === 0) {
      console.log("No preferences set, returning all offers");
      return offersToFilter;
    }

    console.log("Applying preferences to filter offers");
    console.log(`Filtering ${offersToFilter.length} offers with preferences:`, 
      `stores: ${preferences.stores.length}, brands: ${preferences.brands.length}, banks: ${preferences.banks.length}`);
    
    const filtered = offersToFilter.filter(offer => {
      let matches = false;
      
      // Check store preferences
      if (preferences.stores.length > 0 && offer.store) {
        const storeMatch = preferences.stores.some(prefStore => 
          offer.store?.toLowerCase().includes(prefStore.toLowerCase()) ||
          prefStore.toLowerCase().includes(offer.store?.toLowerCase() || '')
        );
        if (storeMatch) matches = true;
      }
      
      // Check brand/category preferences
      if (preferences.brands.length > 0 && offer.categories) {
        const brandMatch = preferences.brands.some(prefBrand => 
          offer.categories?.toLowerCase().includes(prefBrand.toLowerCase()) ||
          prefBrand.toLowerCase().includes(offer.categories?.toLowerCase() || '')
        );
        if (brandMatch) matches = true;
      }
      
      // Check bank preferences (in description, terms, etc.)
      if (preferences.banks.length > 0) {
        const fullText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
        const bankMatch = preferences.banks.some(prefBank => 
          fullText.includes(prefBank.toLowerCase())
        );
        if (bankMatch) matches = true;
      }
      
      return matches;
    });
    
    console.log(`Filtered down to ${filtered.length} offers matching preferences`);
    return filtered;
  };

  // Set up real-time subscription for user preferences
  useEffect(() => {
    if (!session?.user) return;

    console.log("Setting up real-time preferences subscription for user:", session.user.id);

    const channel = supabase
      .channel('user-preferences-data-context')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Preferences changed, refiltering offers');
          fetchUserPreferences().then(newPreferences => {
            if (newPreferences) {
              const newFiltered = applyPreferencesToOffers(offers, newPreferences);
              setFilteredOffers(newFiltered);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, offers]);

  const fetchOffers = async (): Promise<Offer[]> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching offers from Offers_data table...");
      
      const { data, error } = await supabase
        .from('Offers_data')
        .select('*')
        .limit(200);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("No data found in Offers_data table, using mock data");
        setIsUsingMockData(true);
        const mockOffers = getMockOffers();
        setOffers(mockOffers);
        
        // Apply preferences to mock data too
        const currentPreferences = await fetchUserPreferences();
        const filtered = applyPreferencesToOffers(mockOffers, currentPreferences);
        setFilteredOffers(filtered);
        
        return mockOffers;
      }
      
      console.log(`Found ${data.length} offers in database`);
      setIsUsingMockData(false);
      
      const transformedOffers: Offer[] = data.map(offer => ({
        id: offer.lmd_id?.toString() || Math.random().toString(),
        title: offer.title || offer.description || 'Special Offer',
        description: offer.description || offer.long_offer || '',
        imageUrl: offer.image_url || '/placeholder.svg',
        store: offer.store || 'Online Store',
        category: offer.categories || 'General',
        price: 0,
        originalPrice: 0,
        expiryDate: offer.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isAmazon: offer.store?.toLowerCase().includes('amazon') || false,
        savings: offer.offer_value || 'Special Deal',
        lmdId: offer.lmd_id || 0,
        merchantHomepage: offer.merchant_homepage,
        longOffer: offer.long_offer,
        code: offer.code,
        termsAndConditions: offer.terms_and_conditions,
        featured: offer.featured === 'true' || offer.featured === true,
        publisherExclusive: offer.publisher_exclusive === 'true' || offer.publisher_exclusive === true,
        url: offer.url,
        smartlink: offer.smartlink,
        offerType: offer.type,
        offerValue: offer.offer_value,
        status: offer.status,
        startDate: offer.start_date,
        endDate: offer.end_date,
        categories: offer.categories,
        affiliateLink: offer.smartlink || offer.url
      }));
      
      setOffers(transformedOffers);
      
      // Apply user preferences to filter offers
      const currentPreferences = await fetchUserPreferences();
      const filtered = applyPreferencesToOffers(transformedOffers, currentPreferences);
      setFilteredOffers(filtered);
      
      return transformedOffers;
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError(error as Error);
      
      // Fallback to mock data on error
      setIsUsingMockData(true);
      const mockOffers = getMockOffers();
      setOffers(mockOffers);
      setFilteredOffers(mockOffers);
      return mockOffers;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchOffers();
  }, [session]);

  // Refetch function
  const refetchOffers = async () => {
    return await fetchOffers();
  };

  const value = {
    offers,
    filteredOffers,
    categories,
    isLoading,
    error,
    refetchOffers,
    isUsingMockData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
