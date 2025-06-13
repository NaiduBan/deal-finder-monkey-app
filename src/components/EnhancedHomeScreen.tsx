
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  Users, 
  Crown, 
  TrendingUp, 
  MapPin,
  Bell,
  Filter
} from 'lucide-react';
import AIShoppingAssistant from './AIShoppingAssistant';
import SocialShoppingFeatures from './SocialShoppingFeatures';
import PremiumFeatures from './PremiumFeatures';
import BannerCarousel from './BannerCarousel';
import CategoryItem from './CategoryItem';
import OfferCard from './OfferCard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/use-mobile';

const EnhancedHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const { session } = useAuth();
  const { offers, categories, isLoading } = useData();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user has granted location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false)
      );
    }
  }, []);

  const enableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true);
          // Here you would typically save the location to user preferences
          console.log('Location enabled:', position.coords);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const featuredOffers = offers.filter(offer => offer.featured).slice(0, 6);
  const trendingOffers = offers.slice(0, 8);

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-16' : ''}`}>
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐵</span>
              <h1 className="text-xl font-bold text-gray-900">OffersMonkey</h1>
              <Badge variant="secondary" className="bg-monkeyGreen/10 text-monkeyGreen">
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {!locationEnabled && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={enableLocation}
                  className="hidden md:flex items-center space-x-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Enable Location</span>
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for deals, brands, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-monkeyGreen hover:bg-green-700"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="deals" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Premium</span>
            </TabsTrigger>
          </TabsList>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            {/* Banner Carousel */}
            <BannerCarousel />
            
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 12).map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            </div>

            {/* Location-based deals */}
            {locationEnabled && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-monkeyGreen" />
                  <h3 className="text-lg font-semibold">Deals Near You</h3>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Local
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredOffers.slice(0, 4).map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Deals */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Featured Deals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>

            {/* Trending Deals */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Trending Now</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  Hot
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai">
            <AIShoppingAssistant />
          </TabsContent>

          {/* Social Shopping Tab */}
          <TabsContent value="social">
            <SocialShoppingFeatures />
          </TabsContent>

          {/* Premium Features Tab */}
          <TabsContent value="premium">
            <PremiumFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedHomeScreen;
