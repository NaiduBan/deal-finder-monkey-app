
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { mockBrands, mockStores, mockBanks } from '@/mockData';

// Define preference types to match those in PreferenceScreen
type PreferenceType = 'brands' | 'stores' | 'banks';

const SearchPreferencesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'preferences'>('search');

  // Preferences settings
  const [preferences, setPreferences] = useState({
    location: true,
    personalizedOffers: true,
    newDeals: true,
  });

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const navigateToPreference = (type: PreferenceType) => {
    // Navigation would happen here through react-router
    console.log(`Navigate to ${type} preferences`);
  };

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
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Recent searches (placeholder) */}
          {!searchQuery && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Coffee discount</span>
                  </div>
                  <X className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Electronics sale</span>
                  </div>
                  <X className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Fast food deals</span>
                  </div>
                  <X className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </>
          )}

          {/* Search results (placeholder) */}
          {searchQuery && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Results for "{searchQuery}"</h3>
              <div className="space-y-2">
                <Link to="/offer/1" className="block p-3 bg-white rounded-lg">
                  <div className="font-medium">30% Off at Starbucks</div>
                  <div className="text-sm text-gray-500">Valid until May 30, 2025</div>
                </Link>
                <Link to="/offer/2" className="block p-3 bg-white rounded-lg">
                  <div className="font-medium">Buy 1 Get 1 Free at Pizza Hut</div>
                  <div className="text-sm text-gray-500">Valid until June 15, 2025</div>
                </Link>
              </div>
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
            
            <NavigationMenu className="w-full">
              <NavigationMenuList className="w-full flex justify-between">
                <NavigationMenuItem className="flex-1">
                  <Link to="/preferences/brands" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                    <span className="text-2xl">🏷️</span>
                    <p className="text-xs mt-1">Brands</p>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="flex-1">
                  <Link to="/preferences/stores" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                    <span className="text-2xl">🏬</span>
                    <p className="text-xs mt-1">Stores</p>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="flex-1">
                  <Link to="/preferences/banks" className="block w-full text-center py-2 px-1 hover:bg-gray-50 rounded">
                    <span className="text-2xl">🏦</span>
                    <p className="text-xs mt-1">Banks</p>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
              <Button variant="outline" size="sm" className="rounded-full">
                Food & Drinks
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Fashion
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Electronics
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Travel
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Entertainment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPreferencesScreen;
