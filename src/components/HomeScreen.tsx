import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, AlertCircle, Bot, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import SearchBar from './SearchBar'; // New search bar

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
    <div className={`min-h-screen ${isMobile ? 'pb-16' : 'py-8'}`}>
      <div className="container mx-auto px-4 space-y-8">
        {/* New Welcome Header */}
        <header className="py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user?.name?.split(' ')[0] || 'friend'}!
              </h1>
              <p className="text-gray-500">Let's find you some great deals today.</p>
            </div>
            <Link to="/notifications" className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs text-white absolute -top-1 -right-1">
                3
              </span>
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
        />

        {/* New Features Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Smart Shopping</h2>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <Link to="/ai-assistant" className="block">
              <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <div className="p-3 bg-blue-200 rounded-full">
                  <Bot className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">AI Assistant</h3>
                  <p className="text-sm text-blue-700">Voice search & recommendations</p>
                </div>
              </Card>
            </Link>
            <Link to="/local-deals" className="block">
              <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <div className="p-3 bg-green-200 rounded-full">
                  <MapPin className="w-6 h-6 text-green-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Local Deals</h3>
                  <p className="text-sm text-green-700">Explore deals in your area</p>
                </div>
              </Card>
            </Link>
            <Link to="/social-shopping" className="block">
              <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
                <div className="p-3 bg-purple-200 rounded-full">
                  <Users className="w-6 h-6 text-purple-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Social Shopping</h3>
                  <p className="text-sm text-purple-700">Group buys & community deals</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
          
        {/* Data source alert */}
        {isUsingMockData && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              You're viewing mock data. Please check your database connection for live offers.
            </AlertDescription>
          </Alert>
        )}
          
        {/* Personalization badge */}
        {hasLoadedPreferences && (
          userPreferences.brands.length > 0 || 
          userPreferences.stores.length > 0 || 
          userPreferences.banks.length > 0
        ) && (
          <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-medium text-primary">Personalized for You</h3>
              <p className="text-xs text-gray-600">Offers are filtered based on your preferences</p>
            </div>
            <Link 
              to="/preferences/brands" 
              className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-semibold"
            >
              Edit
            </Link>
          </div>
        )}
          
        {/* Categories carousel */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-xl">Top Categories</h2>
            <Link to="/preferences/brands" className="text-primary font-medium text-sm hover:underline">
              Set preferences
            </Link>
          </div>
            
          {isDataLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {dynamicCategories.length > 0 ? (
                dynamicCategories.map((category) => (
                  <div 
                    key={category.id} 
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-shrink-0 ${selectedCategory === category.id ? 'scale-105 transform transition-transform' : ''}`}
                  >
                    <CategoryItem key={category.id} category={category} />
                    {selectedCategory === category.id && (
                      <div className="h-1 w-3/4 mx-auto bg-primary rounded-full mt-1.5"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 py-2 w-full text-center">No categories with sufficient offers available</div>
              )}
            </div>
          )}
        </div>
          
        {/* Active filters */}
        {(selectedCategory || debouncedSearchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium mr-2">Active Filters:</h3>
            {selectedCategory && (
              <div className="bg-primary/10 text-primary pl-3 pr-2 py-1 rounded-full text-sm flex items-center gap-1">
                {dynamicCategories.find(c => c.id === selectedCategory)?.name}
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary/70 hover:text-primary"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            {debouncedSearchTerm && (
              <div className="bg-primary/10 text-primary pl-3 pr-2 py-1 rounded-full text-sm flex items-center gap-1">
                "{debouncedSearchTerm}"
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearchTerm('');
                  }}
                  className="text-primary/70 hover:text-primary"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setDebouncedSearchTerm('');
              }}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
          
        {/* Offers section */}
        <div>
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl">Today's Deals</h2>
              <TabsList className="bg-gray-200/50 p-1 rounded-full">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-full px-4">All</TabsTrigger>
                <TabsTrigger value="nearby" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-full px-4">Nearby</TabsTrigger>
                <TabsTrigger value="flash" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-full px-4">Flash</TabsTrigger>
                <TabsTrigger value="amazon" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-full px-4">Amazon</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-4 mt-2">
              {isDataLoading || isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
                          <OfferCard offer={offer} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    !error && (
                      <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                        <h3 className="font-bold text-lg text-gray-700">No Offers Found</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          {offers.length === 0 
                            ? "We couldn't find any offers right now. Please check back later." 
                            : "Try adjusting your search or preferences to see more results."
                          }
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                          <button
                            onClick={refetchOffers}
                            className="bg-primary text-white px-5 py-2.5 rounded-full w-full font-semibold"
                          >
                            Refresh Data
                          </button>
                          
                          {offers.length > 0 && (
                            <Link 
                              to="/preferences/brands" 
                              className="border border-primary text-primary px-5 py-2.5 rounded-full text-center font-semibold"
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
                  className="w-full py-3 text-center text-primary border border-primary rounded-lg mt-4 flex items-center justify-center font-semibold hover:bg-primary/5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <span>Load More Deals</span>
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
            
            <TabsContent value="flash" className="space-y-4">
              {isCuelinkLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-monkeyGreen"></div>
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
