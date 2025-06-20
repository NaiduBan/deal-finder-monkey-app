
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, AlertCircle, Bot, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import CuelinkOfferCard from './CuelinkOfferCard';
import CategoryItem from './CategoryItem';
import { supabase } from '@/integrations/supabase/client';
import { applyPreferencesToOffers } from '@/services/supabaseService';
import { fetchCuelinkOffers } from '@/services/cuelinkService';
import { Category, Offer, CuelinkOffer } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import CuelinkPagination from './CuelinkPagination';

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

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Mobile Header with location - only show on mobile */}
      {isMobile && (
        <div className="bg-spring-green-600 text-white py-4 px-4 fixed top-0 left-0 right-0 z-30">
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
      )}
      
      {/* Main content - desktop with max-width container */}
      <div className={`space-y-6 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* Desktop welcome section */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{user.location}</span>
                </div>
              </div>
              <Link to="/notifications" className="flex items-center bg-spring-green-600 text-white px-4 py-2 rounded-lg hover:bg-spring-green-700 transition-colors">
                <Bell className="w-5 h-5 mr-2" />
                <span>Notifications</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-monkeyYellow text-xs text-black ml-2">
                  3
                </span>
              </Link>
            </div>
          )}
          
          {/* New Features Section */}
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3">Smart Shopping Features</h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <Link to="/ai-assistant" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">AI Assistant</h3>
                        <p className="text-sm text-blue-600">Voice search & smart recommendations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/local-deals" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Local Deals</h3>
                        <p className="text-sm text-green-600">Nearby stores & restaurants</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/social-shopping" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900">Social Shopping</h3>
                        <p className="text-sm text-purple-600">Group buys & community deals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
          
          {/* Data source alert */}
          {isUsingMockData && (
            <Alert className="bg-amber-50 border-amber-200 mb-6">
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
            <div className="bg-spring-green-50 p-3 rounded-lg flex justify-between items-center mb-6">
              <div>
                <h3 className="font-medium text-spring-green-700">Personalized for You</h3>
                <p className="text-xs text-gray-600">Offers are filtered based on your preferences</p>
              </div>
              <Link 
                to="/preferences/brands" 
                className="bg-spring-green-600 text-white text-sm px-3 py-1 rounded-full"
              >
                Edit
              </Link>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="relative mb-6">
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Categories For You</h2>
              <Link to="/preferences/brands" className="text-spring-green-600 text-sm">
                Set preferences
              </Link>
            </div>
            
            {isDataLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spring-green-600"></div>
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {dynamicCategories.length > 0 ? (
                  dynamicCategories.map((category) => (
                    <div 
                      key={category.id} 
                      onClick={() => handleCategoryClick(category.id)}
                      className={`cursor-pointer transition-transform duration-200 ${selectedCategory === category.id ? 'scale-110' : 'hover:scale-105'}`}
                    >
                      <CategoryItem category={category} />
                      {selectedCategory === category.id && (
                        <div className="h-1 w-full bg-spring-green-600 rounded-full mt-1"></div>
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
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <div className="bg-spring-green-50 text-spring-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {dynamicCategories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 text-spring-green-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              {debouncedSearchTerm && (
                <div className="bg-spring-green-50 text-spring-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                  "{debouncedSearchTerm}"
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchTerm('');
                    }}
                    className="ml-1 text-spring-green-700"
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
                  <TabsTrigger value="flash">Flash Deals</TabsTrigger>
                  <TabsTrigger value="amazon">Amazon</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-2">
                {isDataLoading || isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-600">Error loading offers: {error.message}</p>
                      </div>
                    )}
                    
                    {!error && displayedOffers.length > 0 ? (
                      <div className={`grid gap-4 ${
                        isMobile 
                          ? 'grid-cols-2' 
                          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                      }`}>
                        {displayedOffers.map((offer) => (
                          <Link key={offer.id} to={`/offer/${offer.id}`}>
                            <OfferCard offer={offer} isMobile={isMobile} />
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
                              className="bg-spring-green-600 text-white px-4 py-2 rounded-lg w-full"
                            >
                              Refresh Data
                            </button>
                            
                            {offers.length > 0 && (
                              <Link 
                                to="/preferences/brands" 
                                className="border border-spring-green-600 text-spring-green-600 px-4 py-2 rounded-lg text-center"
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
                    className="w-full py-3 text-center text-spring-green-600 border border-spring-green-600 rounded-lg mt-4 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-spring-green-600 border-t-transparent animate-spin"></div>
                        <span>Loading more...</span>
                      </div>
                    ) : (
                      <span>Load more</span>
                    )}
                  </button>
                )}
              </TabsContent>
              
              <TabsContent value="nearby" className="space-y-4">
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                  {displayedOffers.filter(offer => !offer.isAmazon).map((offer) => (
                    <Link key={offer.id} to={`/offer/${offer.id}`}>
                      <OfferCard offer={offer} isMobile={isMobile} />
                    </Link>
                  ))}
                </div>
                
                {displayedOffers.filter(offer => !offer.isAmazon).length === 0 && (
                  <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                    <p className="text-gray-500">No nearby offers found</p>
                    {offers.length > 0 && (
                      <Link 
                        to="/preferences/stores" 
                        className="mt-4 text-spring-green-600 block underline"
                      >
                        Adjust store preferences
                      </Link>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="flash" className="space-y-4">
                {isCuelinkLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
                  </div>
                ) : (
                  <>
                    {paginatedCuelinkOffers.length > 0 ? (
                      <>
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {((cuelinkCurrentPage - 1) * cuelinkItemsPerPage) + 1}-{Math.min(cuelinkCurrentPage * cuelinkItemsPerPage, displayedCuelinkOffers.length)} of {displayedCuelinkOffers.length} flash deals
                        </div>
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-1 sm:grid-cols-2' 
                            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        }`}>
                          {paginatedCuelinkOffers.map((offer) => (
                            <CuelinkOfferCard key={offer.Id} offer={offer} />
                          ))}
                        </div>
                        <CuelinkPagination 
                          currentPage={cuelinkCurrentPage}
                          totalPages={totalCuelinkPages}
                          onPageChange={handleCuelinkPageChange}
                        />
                      </>
                    ) : (
                      <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                        <p className="text-gray-500">No flash deals found</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {cuelinkOffers.length === 0 
                            ? "No flash deals available in the Cuelink_data table" 
                            : "Try a different search term or check back later"
                          }
                        </p>
                        <div className="mt-4">
                          <p className="text-xs text-gray-400">
                            Total Cuelink offers loaded: {cuelinkOffers.length}
                          </p>
                          {debouncedSearchTerm && (
                            <p className="text-xs text-gray-400">
                              Search term: "{debouncedSearchTerm}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="amazon" className="space-y-4">
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                  {displayedOffers.filter(offer => offer.isAmazon).map((offer) => (
                    <Link key={offer.id} to={`/offer/${offer.id}`}>
                      <OfferCard offer={offer} isMobile={isMobile} />
                    </Link>
                  ))}
                </div>
                
                {displayedOffers.filter(offer => offer.isAmazon).length === 0 && (
                  <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                    <p className="text-gray-500">No Amazon offers found</p>
                    {offers.length > 0 && (
                      <Link 
                        to="/preferences/stores" 
                        className="mt-4 text-spring-green-600 block underline"
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
    </div>
  );
};

export default HomeScreen;
