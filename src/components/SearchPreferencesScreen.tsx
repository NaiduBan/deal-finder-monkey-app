
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { searchOffers } from '@/services/supabaseService';

// Define preference types to match those in PreferenceScreen
type PreferenceType = 'brands' | 'stores' | 'banks';

const SearchPreferencesScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { offers } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'preferences'>('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Preferences settings
  const [preferences, setPreferences] = useState({
    location: true,
    personalizedOffers: true,
    newDeals: true,
  });

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    // Show toast notification
    toast({
      title: "Preference updated",
      description: `${key} preference has been ${!preferences[key] ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      const updatedSearches = [searchQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
    }
    
    try {
      setIsSearching(true);
      console.log('Searching for:', searchQuery);
      
      // Use the searchOffers function from supabaseService
      const results = await searchOffers(searchQuery);
      console.log('Search results:', results.length);
      setSearchResults(results);
    } catch (err) {
      console.error('Error during search:', err);
      setSearchResults([]);
      
      toast({
        title: "Search Error",
        description: "Something went wrong with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter(item => item !== search));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    toast({
      title: "Recent searches cleared",
      description: "All your recent searches have been removed.",
    });
  };

  const navigateToPreference = (type: PreferenceType) => {
    navigate(`/preferences/${type}`);
  };

  // Extract unique categories from offers for popular categories section
  const getPopularCategories = () => {
    if (!offers || offers.length === 0) {
      // Default categories if no offers available
      return [
        { name: 'Food & Drinks', id: 'food-drinks' },
        { name: 'Fashion', id: 'fashion' },
        { name: 'Electronics', id: 'electronics' },
        { name: 'Travel', id: 'travel' },
        { name: 'Home', id: 'home' }
      ];
    }
    
    // Extract categories from actual offers
    const categories = new Set<string>();
    offers.forEach(offer => {
      if (offer.category) {
        const cats = offer.category.split(',');
        cats.forEach(cat => {
          const trimmedCat = cat.trim();
          if (trimmedCat) categories.add(trimmedCat);
        });
      }
    });
    
    return Array.from(categories).slice(0, 6).map(cat => ({
      name: cat,
      id: cat.toLowerCase().replace(/\s+/g, '-')
    }));
  };

  const popularCategories = getPopularCategories();

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex space-x-4">
          <Button 
            variant={activeTab === 'search' ? "default" : "ghost"} 
            onClick={() => setActiveTab('search')}
            className={activeTab === 'search' ? "bg-monkeyYellow text-black" : "text-white"}
          >
            Search
          </Button>
          <Button 
            variant={activeTab === 'preferences' ? "default" : "ghost"} 
            onClick={() => setActiveTab('preferences')}
            className={activeTab === 'preferences' ? "bg-monkeyYellow text-black" : "text-white"}
          >
            Preferences
          </Button>
        </div>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {activeTab === 'search' ? (
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search offers, stores, brands..."
                className="pl-10 pr-10 py-2 w-full border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="hidden">Search</button>
          </form>

          {/* Recent searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Recent Searches</h3>
                {recentSearches.length > 1 && (
                  <button 
                    onClick={clearAllRecentSearches}
                    className="text-xs text-monkeyGreen"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <div key={`recent-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <button 
                      onClick={() => {
                        setSearchQuery(search);
                        setTimeout(() => {
                          handleSearch(new Event('submit') as any);
                        }, 100);
                      }}
                      className="flex items-center flex-grow text-left"
                    >
                      <Search className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{search}</span>
                    </button>
                    <button onClick={() => clearRecentSearch(search)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Search results */}
          {searchQuery && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Results for "{searchQuery}"</h3>
              
              {isSearching ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <Link 
                      key={`result-${result.id}`} 
                      to={`/offer/${result.id}`} 
                      className="block p-3 bg-white rounded-lg"
                    >
                      <div className="font-medium">{result.title || "Untitled Offer"}</div>
                      <div className="text-sm text-gray-500">
                        {result.store ? `${result.store} • ` : ""}
                        {result.expiryDate ? `Valid until ${result.expiryDate}` : "Limited time offer"}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {/* Preferences Navigation */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-4 flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-monkeyGreen" />
              Preference Categories
            </h3>
            
            <div className="w-full flex justify-between">
              <div className="flex-1">
                <Link to="/preferences/brands" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                  <span className="text-2xl">🏷️</span>
                  <p className="text-xs mt-1">Brands</p>
                </Link>
              </div>
              <div className="flex-1">
                <Link to="/preferences/stores" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                  <span className="text-2xl">🏬</span>
                  <p className="text-xs mt-1">Stores</p>
                </Link>
              </div>
              <div className="flex-1">
                <Link to="/preferences/banks" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                  <span className="text-2xl">🏦</span>
                  <p className="text-xs mt-1">Banks</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Quick Filters</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Location-Based Offers</p>
                  <p className="text-sm text-gray-600">Show nearby deals</p>
                </div>
                <Switch 
                  checked={preferences.location} 
                  onCheckedChange={() => handlePreferenceChange('location')}
                  className="data-[state=checked]:bg-monkeyGreen" 
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Personalized Offers</p>
                  <p className="text-sm text-gray-600">Based on your interests</p>
                </div>
                <Switch 
                  checked={preferences.personalizedOffers} 
                  onCheckedChange={() => handlePreferenceChange('personalizedOffers')}
                  className="data-[state=checked]:bg-monkeyGreen" 
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">New Deals Alert</p>
                  <p className="text-sm text-gray-600">Get notified about new offers</p>
                </div>
                <Switch 
                  checked={preferences.newDeals} 
                  onCheckedChange={() => handlePreferenceChange('newDeals')}
                  className="data-[state=checked]:bg-monkeyGreen" 
                />
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold mb-3">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {popularCategories.length > 0 ? (
                popularCategories.map((category, index) => (
                  <Button 
                    key={`popular-${index}`}
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => navigate(`/category/${category.id}`)}
                  >
                    {category.name}
                  </Button>
                ))
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => navigate('/category/food-drinks')}
                  >
                    Food & Drinks
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => navigate('/category/fashion')}
                  >
                    Fashion
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => navigate('/category/electronics')}
                  >
                    Electronics
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPreferencesScreen;
