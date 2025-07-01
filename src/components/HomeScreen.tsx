import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, AlertCircle, Bot, Users, TrendingUp, Zap, Star, Crown, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className={`bg-gradient-to-br from-spring-green-50 via-white to-spring-green-100 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Mobile Header with location - only show on mobile */}
      {isMobile && (
        <div className="bg-gradient-to-r from-spring-green-600 to-spring-green-700 text-white py-4 px-4 fixed top-0 left-0 right-0 z-30 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{user.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/notifications" className="flex items-center relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute -translate-y-2 translate-x-3 font-bold">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className={`space-y-6 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* Desktop welcome section */}
          {!isMobile && (
            <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-600 via-spring-green-700 to-green-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-monkeyYellow" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold">Welcome back, Saver!</h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-white/80" />
                        <span className="text-white/90">{user.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-white/90">
                    🎉 Discover amazing deals and save money on your favorite brands!
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-monkeyYellow">{offers.length}+</div>
                    <div className="text-sm text-white/80">Live Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-monkeyYellow">{cuelinkOffers.length}+</div>
                    <div className="text-sm text-white/80">Flash Deals</div>
                  </div>
                  <Link to="/notifications" className="flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                    <Bell className="w-5 h-5 mr-2" />
                    <span>Notifications</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-monkeyYellow text-xs text-black ml-2 font-bold">
                      3
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats Cards */}
          <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-900">{displayedOffers.length}</div>
                    <div className="text-sm text-blue-600">Today's Deals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-900">{cuelinkOffers.length}</div>
                    <div className="text-sm text-purple-600">Flash Deals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-900">{dynamicCategories.length}</div>
                    <div className="text-sm text-green-600">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-900">₹10K+</div>
                    <div className="text-sm text-yellow-600">Avg. Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Smart Features Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-gray-900">🚀 Smart Shopping Features</h2>
              <Badge variant="secondary" className="bg-spring-green-100 text-spring-green-700">
                New Features
              </Badge>
            </div>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <Link to="/ai-assistant" className="block">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900 text-lg">AI Assistant</h3>
                        <p className="text-sm text-blue-600">Voice search & smart recommendations</p>
                        <Badge className="mt-2 bg-blue-500 text-white text-xs">Try Now</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/local-deals" className="block">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 text-lg">Local Deals</h3>
                        <p className="text-sm text-green-600">Nearby stores & restaurants</p>
                        <Badge className="mt-2 bg-green-500 text-white text-xs">Explore</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/social-shopping" className="block">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-900 text-lg">Social Shopping</h3>
                        <p className="text-sm text-purple-600">Group buys & community deals</p>
                        <Badge className="mt-2 bg-purple-500 text-white text-xs">Join Now</Badge>
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
          
          {/* Personalization banner */}
          {hasLoadedPreferences && (
            userPreferences.brands.length > 0 || 
            userPreferences.stores.length > 0 || 
            userPreferences.banks.length > 0
          ) && (
            <div className="bg-gradient-to-r from-spring-green-50 to-green-50 p-4 rounded-xl border border-spring-green-200 mb-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-spring-green-100 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-spring-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-spring-green-800 text-lg">✨ Personalized for You</h3>
                    <p className="text-sm text-spring-green-600">Offers curated based on your preferences</p>
                  </div>
                </div>
                <Link 
                  to="/preferences/brands" 
                  className="bg-spring-green-600 hover:bg-spring-green-700 text-white text-sm px-4 py-2 rounded-full transition-colors font-medium"
                >
                  Customize
                </Link>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="🔍 Search for offers, stores, categories..."
              className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-xl text-lg shadow-sm focus:shadow-md transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Categories carousel */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-gray-900">🎯 Popular Categories</h2>
              <Link to="/preferences/brands" className="text-spring-green-600 text-sm font-medium hover:text-spring-green-700">
                Customize preferences →
              </Link>
            </div>
            
            {isDataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spring-green-600"></div>
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {dynamicCategories.length > 0 ? (
                  dynamicCategories.map((category) => (
                    <div 
                      key={category.id} 
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedCategory === category.id 
                          ? 'scale-110 ring-2 ring-spring-green-500 ring-offset-2' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <CategoryItem category={category} />
                      {selectedCategory === category.id && (
                        <div className="h-1 w-full bg-spring-green-600 rounded-full mt-2 animate-pulse"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 py-4 text-center w-full">No categories with sufficient offers available</div>
                )}
              </div>
            )}
          </div>
          
          {/* Active filters */}
          {(selectedCategory || debouncedSearchTerm) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <div className="bg-spring-green-100 text-spring-green-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
                  🏷️ {dynamicCategories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-spring-green-700 hover:text-spring-green-900 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
              {debouncedSearchTerm && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
                  🔍 "{debouncedSearchTerm}"
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchTerm('');
                    }}
                    className="ml-2 text-blue-700 hover:text-blue-900 font-bold"
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
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
          
          {/* Enhanced Offers section with better tabs */}
          <div>
            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl text-gray-900">🔥 Today's Hottest Deals</h2>
                <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="all" className="text-sm font-medium">All Deals</TabsTrigger>
                  <TabsTrigger value="nearby" className="text-sm font-medium">Nearby</TabsTrigger>
                  <TabsTrigger value="flash" className="text-sm font-medium">Flash</TabsTrigger>
                  <TabsTrigger value="amazon" className="text-sm font-medium">Amazon</TabsTrigger>
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
                    
                    {!error && amazonOffers.length > 0 ? (
                      <>
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {amazonOffers.length} Amazon offers
                        </div>
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-2' 
                            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                        }`}>
                          {amazonOffers.map((offer) => (
                            <Link key={offer.id} to={`/offer/${offer.id}`}>
                              <OfferCard offer={offer} isMobile={isMobile} />
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      !error && (
                        <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                          <p className="text-gray-500">No Amazon offers found</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {offers.length === 0 
                              ? "No offers available in the database" 
                              : debouncedSearchTerm 
                                ? `No Amazon offers match "${debouncedSearchTerm}"`
                                : "Check back later for Amazon deals"
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
                                to="/preferences/stores" 
                                className="border border-spring-green-600 text-spring-green-600 px-4 py-2 rounded-lg text-center"
                              >
                                Adjust Store Preferences
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
                
                {!isDataLoading && !error && amazonOffers.length > 0 && (
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
                      <span>Load more Amazon offers</span>
                    )}
                  </button>
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
