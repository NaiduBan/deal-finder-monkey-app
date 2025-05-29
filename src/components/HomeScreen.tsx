import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';
import { supabase } from '@/integrations/supabase/client';
import { applyPreferencesToOffers } from '@/services/supabaseService';
import { Category } from '@/types';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
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

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

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

      // Only include categories that have at least 3 offers
      const categoryObjects: Category[] = Array.from(categoryCount.entries())
        .filter(([_, count]) => count >= 3) // Filter out categories with less than 3 offers
        .map(([categoryName, _]) => {
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
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 12); // Limit to 12 categories to avoid clutter

      console.log('Generated dynamic categories with offer counts:', categoryObjects);
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

  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
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
    
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    console.log("Home Screen Rendered");
    console.log("Offers loaded:", offers ? offers.length : 0);
    console.log("Filtered offers loaded:", filteredOffers ? filteredOffers.length : 0);
    console.log("Categories loaded:", dynamicCategories ? dynamicCategories.length : 0);
    console.log("Is loading:", isDataLoading);
    console.log("Error:", error);
    console.log("Using mock data:", isUsingMockData);
    console.log("User preferences:", userPreferences);
    console.log("Selected category:", selectedCategory);
    console.log("Has loaded preferences:", hasLoadedPreferences);
  }, [offers, filteredOffers, dynamicCategories, isDataLoading, error, isUsingMockData, userPreferences, selectedCategory, hasLoadedPreferences]);

  const loadMoreOffers = () => {
    setIsLoading(true);
    refetchOffers().then(() => {
      setIsLoading(false);
    });
  };
  
  // Enhanced search functionality with category filtering on top of already filtered offers
  const displayedOffers = filteredOffers.filter(offer => {
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

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header with location */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/notifications" className="flex items-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute translate-x-3 -translate-y-2">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Data source alert */}
        {isUsingMockData && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              No real offers found in the Offers_data table. Please check your database.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Personalization badge */}
        {hasLoadedPreferences && (
          userPreferences.brands.length > 0 || 
          userPreferences.stores.length > 0 || 
          userPreferences.banks.length > 0
        ) && (
          <div className="bg-monkeyGreen/10 p-3 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-medium text-monkeyGreen">Personalized for You</h3>
              <p className="text-xs text-gray-600">Offers are filtered based on your preferences</p>
            </div>
            <Link 
              to="/preferences/brands" 
              className="bg-monkeyGreen text-white text-sm px-3 py-1 rounded-full"
            >
              Edit
            </Link>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            placeholder="Search for offers, stores, categories..."
            className="pl-10 pr-4 py-2 w-full border-gray-200"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {/* Categories carousel with active state */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">For You</h2>
            <Link to="/preferences/brands" className="text-monkeyGreen text-sm">
              Set preferences
            </Link>
          </div>
          
          {isDataLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-monkeyGreen"></div>
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {dynamicCategories.length > 0 ? (
                dynamicCategories.map((category) => (
                  <div 
                    key={category.id} 
                    onClick={() => handleCategoryClick(category.id)}
                    className={`cursor-pointer ${selectedCategory === category.id ? 'scale-110 transform transition-transform' : ''}`}
                  >
                    <CategoryItem key={category.id} category={category} />
                    {selectedCategory === category.id && (
                      <div className="h-1 w-full bg-monkeyGreen rounded-full mt-1"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 py-2">No categories with sufficient offers available</div>
              )}
            </div>
          )}
        </div>
        
        {/* Active filters */}
        {(selectedCategory || debouncedSearchTerm) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <div className="bg-monkeyGreen/10 text-monkeyGreen px-3 py-1 rounded-full text-sm flex items-center">
                {dynamicCategories.find(c => c.id === selectedCategory)?.name}
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 text-monkeyGreen"
                >
                  ✕
                </button>
              </div>
            )}
            {debouncedSearchTerm && (
              <div className="bg-monkeyGreen/10 text-monkeyGreen px-3 py-1 rounded-full text-sm flex items-center">
                "{debouncedSearchTerm}"
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearchTerm('');
                  }}
                  className="ml-1 text-monkeyGreen"
                >
                  ✕
                </button>
              </div>
            )}
            {(selectedCategory || debouncedSearchTerm) && (
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setDebouncedSearchTerm('');
                }}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
              >
                Clear all
              </button>
            )}
          </div>
        )}
        
        {/* Offers section */}
        <div>
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Today's Offers</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
                <TabsTrigger value="amazon">Amazon</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-4 mt-2">
              {isDataLoading || isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-monkeyGreen"></div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-600">Error loading offers: {error.message}</p>
                    </div>
                  )}
                  
                  {!error && displayedOffers.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {displayedOffers.map((offer) => (
                        <Link key={offer.id} to={`/offer/${offer.id}`}>
                          <OfferCard offer={offer} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    !error && (
                      <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                        <p className="text-gray-500">No offers found</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {offers.length === 0 
                            ? "No offers available in the Offers_data table" 
                            : "Try a different search term or check back later"
                          }
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={refetchOffers}
                            className="bg-monkeyGreen text-white px-4 py-2 rounded-lg w-full"
                          >
                            Refresh Data
                          </button>
                          
                          {offers.length > 0 && (
                            <Link 
                              to="/preferences/brands" 
                              className="border border-monkeyGreen text-monkeyGreen px-4 py-2 rounded-lg text-center"
                            >
                              Adjust Preferences
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}
              
              {!isDataLoading && !error && displayedOffers.length > 0 && (
                <button 
                  onClick={loadMoreOffers}
                  className="w-full py-3 text-center text-monkeyGreen border border-monkeyGreen rounded-lg mt-4 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full border-2 border-monkeyGreen border-t-transparent animate-spin"></div>
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <span>Load more</span>
                  )}
                </button>
              )}
            </TabsContent>
            
            <TabsContent value="nearby" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedOffers.filter(offer => !offer.isAmazon).map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
              
              {displayedOffers.filter(offer => !offer.isAmazon).length === 0 && (
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <p className="text-gray-500">No nearby offers found</p>
                  {offers.length > 0 && (
                    <Link 
                      to="/preferences/stores" 
                      className="mt-4 text-monkeyGreen block underline"
                    >
                      Adjust store preferences
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="amazon" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedOffers.filter(offer => offer.isAmazon).map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
              
              {displayedOffers.filter(offer => offer.isAmazon).length === 0 && (
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <p className="text-gray-500">No Amazon offers found</p>
                  {offers.length > 0 && (
                    <Link 
                      to="/preferences/stores" 
                      className="mt-4 text-monkeyGreen block underline"
                    >
                      Adjust store preferences
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
