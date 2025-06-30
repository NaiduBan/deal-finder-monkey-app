import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { applyPreferencesToOffers } from '@/services/supabaseService';
import { fetchCuelinkOffers } from '@/services/cuelinkService';
import { Category, Offer, CuelinkOffer } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

// Import new components
import HomeHeader from './HomeHeader';
import SmartFeaturesSection from './SmartFeaturesSection';
import PersonalizationBanner from './PersonalizationBanner';
import SearchAndFilters from './SearchAndFilters';
import CategoriesSection from './CategoriesSection';
import OffersSection from './OffersSection';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const isMobile = useIsMobile();
  const { 
    offers, 
    filteredOffers,
    categories: allCategories, 
    isLoading: isDataLoading, 
    error, 
    refetchOffers, 
    isUsingMockData 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>({
    brands: [],
    stores: [],
    banks: []
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [localFilteredOffers, setLocalFilteredOffers] = useState(filteredOffers);
  const [cuelinkOffers, setCuelinkOffers] = useState<CuelinkOffer[]>([]);
  const [isCuelinkLoading, setIsCuelinkLoading] = useState(false);
  const [cuelinkCurrentPage, setCuelinkCurrentPage] = useState(1);
  const cuelinkItemsPerPage = 12;

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Update local filtered offers when context filtered offers change
  useEffect(() => {
    setLocalFilteredOffers(filteredOffers);
  }, [filteredOffers]);

  // Fetch Cuelink offers
  useEffect(() => {
    const loadCuelinkOffers = async () => {
      setIsCuelinkLoading(true);
      try {
        console.log('Loading Cuelink offers...');
        const cuelinkData = await fetchCuelinkOffers();
        console.log('Fetched Cuelink data:', cuelinkData);
        setCuelinkOffers(cuelinkData);
        console.log('Loaded Cuelink offers:', cuelinkData.length);
      } catch (error) {
        console.error('Error loading Cuelink offers:', error);
      } finally {
        setIsCuelinkLoading(false);
      }
    };

    loadCuelinkOffers();
  }, []);

  // Extract categories from today's offers and filter out categories with no offers
  useEffect(() => {
    if (offers && offers.length > 0) {
      const categoryCount = new Map<string, number>();
      
      // Count offers per category
      offers.forEach(offer => {
        if (offer.category) {
          const categories = offer.category.split(',').map(cat => cat.trim());
          categories.forEach(cat => {
            if (cat) {
              categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            }
          });
        }
      });

      // Get top categories by offer count, filter out those with few offers
      const topCategoryTuples = Array.from(categoryCount.entries())
        .filter(([, count]) => count >= 3) // Only include categories that have at least 3 offers
        .sort(([, countA], [, countB]) => countB - countA) // Sort by offer count descending
        .slice(0, 8); // Limit to 8 most "used" categories

      // Map to Category objects
      const categoryObjects: Category[] = topCategoryTuples.map(([categoryName]) => {
          const matchingCategory = allCategories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase() ||
            c.id.toLowerCase() === categoryName.toLowerCase().replace(/\s+/g, '-')
          );

          if (matchingCategory) {
            return matchingCategory;
          }

          return {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            icon: getCategoryIcon(categoryName),
          };
        });

      console.log('Generated dynamic categories (top 8 by usage):', categoryObjects);
      setDynamicCategories(categoryObjects);
    } else {
      setDynamicCategories([]);
    }
  }, [offers, allCategories]);

  // Helper function to determine an appropriate icon based on the category name
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('electronics') || name.includes('tech')) return 'laptop';
    if (name.includes('fashion') || name.includes('clothing') || name.includes('apparel')) return 'shirt';
    if (name.includes('food') || name.includes('drink') || name.includes('restaurant')) return 'utensils';
    if (name.includes('home') || name.includes('furniture')) return 'home';
    if (name.includes('travel') || name.includes('flight')) return 'plane';
    if (name.includes('beauty') || name.includes('cosmetic')) return 'sparkles';
    if (name.includes('health') || name.includes('fitness')) return 'heart';
    if (name.includes('toy') || name.includes('kid')) return 'gift';
    
    return 'shopping-bag';
  };

  // Fetch user preferences when component mounts and apply them immediately
  useEffect(() => {
    const fetchAndApplyUserPreferences = async () => {
      try {
        console.log("Fetching user preferences...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (error) {
            console.error('Error fetching user preferences:', error);
          } else if (data) {
            const preferences: {[key: string]: string[]} = {
              brands: data.filter(p => p.preference_type === 'brands').map(p => p.preference_id),
              stores: data.filter(p => p.preference_type === 'stores').map(p => p.preference_id),
              banks: data.filter(p => p.preference_type === 'banks').map(p => p.preference_id)
            };
            
            setUserPreferences(preferences);
            console.log('Loaded preferences:', preferences);

            // Apply preferences immediately if we have offers
            if (offers && offers.length > 0) {
              const hasPreferences = preferences.brands.length > 0 || 
                                   preferences.stores.length > 0 || 
                                   preferences.banks.length > 0;
              
              if (hasPreferences) {
                console.log('Applying preferences immediately to offers');
                const filtered = applyPreferencesToOffers(offers, preferences);
                const finalOffers = filtered.length > 0 ? filtered : offers;
                setLocalFilteredOffers(finalOffers);
                console.log('Applied preferences - showing', finalOffers.length, 'offers');
              } else {
                setLocalFilteredOffers(offers);
              }
            }

            if (preferences.brands.length > 0 || preferences.stores.length > 0 || preferences.banks.length > 0) {
              console.log('User has personalization preferences applied');
            }
          }
          
          setHasLoadedPreferences(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setHasLoadedPreferences(true);
      }
    };
    
    fetchAndApplyUserPreferences();
  }, [offers]); // Re-run when offers change

  // Listen for real-time preference changes and update immediately
  useEffect(() => {
    const setupRealtimeListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      console.log('Setting up real-time preference listener for home screen');

      const channel = supabase
        .channel('home-preference-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_preferences',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            console.log('Home screen detected preference change:', payload);
            
            // Refetch all preferences immediately
            try {
              const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', session.user.id);
                
              if (!error && data) {
                const newPreferences: {[key: string]: string[]} = {
                  brands: data.filter(p => p.preference_type === 'brands').map(p => p.preference_id),
                  stores: data.filter(p => p.preference_type === 'stores').map(p => p.preference_id),
                  banks: data.filter(p => p.preference_type === 'banks').map(p => p.preference_id)
                };
                
                setUserPreferences(newPreferences);
                console.log('Updated preferences in home screen:', newPreferences);
                
                // Apply new preferences immediately
                if (offers && offers.length > 0) {
                  const hasPreferences = newPreferences.brands.length > 0 || 
                                       newPreferences.stores.length > 0 || 
                                       newPreferences.banks.length > 0;
                  
                  if (hasPreferences) {
                    console.log('Applying new preferences to offers');
                    const filtered = applyPreferencesToOffers(offers, newPreferences);
                    const finalOffers = filtered.length > 0 ? filtered : offers;
                    setLocalFilteredOffers(finalOffers);
                    console.log('Applied new preferences - showing', finalOffers.length, 'offers');
                  } else {
                    console.log('No preferences, showing all offers');
                    setLocalFilteredOffers(offers);
                  }
                }
              }
            } catch (error) {
              console.error('Error refetching preferences:', error);
            }
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up home screen preference listener');
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeListener();
  }, [offers]);

  useEffect(() => {
    console.log("Home Screen Rendered");
    console.log("Offers loaded:", offers ? offers.length : 0);
    console.log("Filtered offers loaded:", localFilteredOffers ? localFilteredOffers.length : 0);
    console.log("Categories loaded:", dynamicCategories ? dynamicCategories.length : 0);
    console.log("Is loading:", isDataLoading);
    console.log("Error:", error);
    console.log("Using mock data:", isUsingMockData);
    console.log("User preferences:", userPreferences);
    console.log("Selected category:", selectedCategory);
    console.log("Has loaded preferences:", hasLoadedPreferences);
  }, [offers, localFilteredOffers, dynamicCategories, isDataLoading, error, isUsingMockData, userPreferences, selectedCategory, hasLoadedPreferences]);

  const loadMoreOffers = () => {
    setIsLoading(true);
    refetchOffers().then(() => {
      setIsLoading(false);
    });
  };
  
  // Enhanced search functionality with category filtering on top of already filtered offers
  const displayedOffers = localFilteredOffers.filter(offer => {
    if (selectedCategory && offer.category) {
      const categoryMatch = offer.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                           selectedCategory.toLowerCase().includes(offer.category.toLowerCase());
      if (!categoryMatch) return false;
    }
    
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.title && offer.title.toLowerCase().includes(searchTermLower)) ||
        (offer.store && offer.store.toLowerCase().includes(searchTermLower)) ||
        (offer.description && offer.description.toLowerCase().includes(searchTermLower)) ||
        (offer.category && offer.category.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Filter Amazon offers specifically
  const amazonOffers = localFilteredOffers.filter(offer => {
    // Check if the offer is from Amazon by looking at the store name
    const isAmazonOffer = offer.store && offer.store.toLowerCase().includes('amazon');
    
    if (!isAmazonOffer) return false;
    
    // Apply search filter if present
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.title && offer.title.toLowerCase().includes(searchTermLower)) ||
        (offer.store && offer.store.toLowerCase().includes(searchTermLower)) ||
        (offer.description && offer.description.toLowerCase().includes(searchTermLower)) ||
        (offer.category && offer.category.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Filter Cuelink offers for Flash Deals tab
  const displayedCuelinkOffers = cuelinkOffers.filter(offer => {
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.Title && offer.Title.toLowerCase().includes(searchTermLower)) ||
        (offer.Merchant && offer.Merchant.toLowerCase().includes(searchTermLower)) ||
        (offer.Description && offer.Description.toLowerCase().includes(searchTermLower)) ||
        (offer.Categories && offer.Categories.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Pagination calculations for Cuelink offers
  const totalCuelinkPages = Math.ceil(displayedCuelinkOffers.length / cuelinkItemsPerPage);
  const paginatedCuelinkOffers = displayedCuelinkOffers.slice(
    (cuelinkCurrentPage - 1) * cuelinkItemsPerPage,
    cuelinkCurrentPage * cuelinkItemsPerPage
  );

  const handleCuelinkPageChange = (page: number) => {
    setCuelinkCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    console.log("Category clicked:", categoryId);
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Updated search handler with debouncing
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Searching for:", e.target.value);
  };

  // Handler functions for SearchAndFilters component
  const handleClearCategory = () => setSelectedCategory(null);
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchTerm('');
  };
  const handleClearAll = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setDebouncedSearchTerm('');
  };

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      <HomeHeader />
      
      {/* Main content - desktop with max-width container */}
      <div className={`space-y-6 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          <SmartFeaturesSection />
          
          {/* Data source alert */}
          {isUsingMockData && (
            <Alert className="bg-amber-50 border-amber-200 mb-6">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                No real offers found in the Offers_data table. Please check your database.
              </AlertDescription>
            </Alert>
          )}
          
          <PersonalizationBanner 
            hasLoadedPreferences={hasLoadedPreferences}
            userPreferences={userPreferences}
          />
          
          <SearchAndFilters
            searchQuery={searchQuery}
            debouncedSearchTerm={debouncedSearchTerm}
            selectedCategory={selectedCategory}
            dynamicCategories={dynamicCategories}
            onSearchChange={handleSearch}
            onClearCategory={handleClearCategory}
            onClearSearch={handleClearSearch}
            onClearAll={handleClearAll}
          />
          
          <CategoriesSection
            isDataLoading={isDataLoading}
            dynamicCategories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />
          
          <OffersSection
            isDataLoading={isDataLoading}
            isLoading={isLoading}
            error={error}
            displayedOffers={displayedOffers}
            amazonOffers={amazonOffers}
            displayedCuelinkOffers={displayedCuelinkOffers}
            paginatedCuelinkOffers={paginatedCuelinkOffers}
            isCuelinkLoading={isCuelinkLoading}
            cuelinkCurrentPage={cuelinkCurrentPage}
            totalCuelinkPages={totalCuelinkPages}
            cuelinkOffers={cuelinkOffers}
            debouncedSearchTerm={debouncedSearchTerm}
            offers={offers}
            onLoadMore={loadMoreOffers}
            onRefetchOffers={refetchOffers}
            onCuelinkPageChange={handleCuelinkPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
