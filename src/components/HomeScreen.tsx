
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, MapPin, Filter, TrendingUp, Clock, Star, Gift } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';
import { fetchTodaysOffers, fetchUserPreferences, applyPreferencesToOffers } from '@/services/supabaseService';
import { Offer } from '@/types';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';
import BannerCarousel from './BannerCarousel';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user: authUser, userProfile } = useAuth();
  const { user: userContext } = useUser();
  const { categories, bannerItems } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [todaysOffers, setTodaysOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('India');

  useEffect(() => {
    setUserLocation(userProfile?.location || userContext.location || 'India');
  }, [userProfile, userContext]);

  useEffect(() => {
    const loadTodaysOffers = async () => {
      try {
        setLoading(true);
        console.log('Loading today\'s offers...');
        
        const offers = await fetchTodaysOffers();
        console.log('Fetched offers:', offers.length);
        
        let finalOffers = offers;
        
        // Apply user preferences if user is authenticated
        if (authUser) {
          try {
            console.log('Fetching user preferences for authenticated user:', authUser.id);
            const [storePrefs, brandPrefs, bankPrefs] = await Promise.all([
              fetchUserPreferences(authUser.id, 'stores'),
              fetchUserPreferences(authUser.id, 'brands'), 
              fetchUserPreferences(authUser.id, 'banks')
            ]);
            
            if (storePrefs.length > 0 || brandPrefs.length > 0 || bankPrefs.length > 0) {
              const preferences = {
                stores: storePrefs.map(p => p.preference_id),
                brands: brandPrefs.map(p => p.preference_id),
                banks: bankPrefs.map(p => p.preference_id)
              };
              
              console.log('Applying user preferences:', preferences);
              finalOffers = applyPreferencesToOffers(offers, preferences);
            }
          } catch (error) {
            console.error('Error fetching user preferences:', error);
          }
        }
        
        setTodaysOffers(finalOffers);
        setFilteredOffers(finalOffers);
      } catch (error) {
        console.error('Error loading today\'s offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysOffers();
  }, [authUser]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = todaysOffers.filter(offer =>
        offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.store?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(todaysOffers);
    }
  }, [searchQuery, todaysOffers]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const featuredOffers = filteredOffers.filter(offer => offer.featured).slice(0, 5);
  const regularOffers = filteredOffers.filter(offer => !offer.featured).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {getInitials(userProfile?.name || userContext.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-green-100">
                {getGreeting()}{authUser ? ', ' + (userProfile?.name || 'User') : '!'}
              </p>
              <div className="flex items-center gap-1 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{userLocation}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notifications')}
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-6 h-6" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white">
                3
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-white/20"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-bold">
                  {getInitials(userProfile?.name || userContext.name)}
                </span>
              </div>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for offers, brands, or stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-12 bg-white/95 border-0 text-gray-800 placeholder-gray-500 h-12 rounded-xl shadow-sm"
          />
          <Button
            onClick={handleSearch}
            size="icon"
            className="absolute right-1 top-1 h-10 w-10 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{userContext.points}</div>
            <div className="text-xs text-green-100">Points</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{userContext.savedOffers.length}</div>
            <div className="text-xs text-green-100">Saved</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{filteredOffers.length}</div>
            <div className="text-xs text-green-100">Today's Deals</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Banner Carousel */}
        {bannerItems.length > 0 && (
          <div className="mb-6">
            <BannerCarousel items={bannerItems} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-white border-green-200 hover:bg-green-50"
            onClick={() => navigate('/categories')}
          >
            <div className="text-2xl mb-1">🏷️</div>
            <span className="text-xs">Categories</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-white border-green-200 hover:bg-green-50"
            onClick={() => navigate('/saved')}
          >
            <div className="text-2xl mb-1">💾</div>
            <span className="text-xs">Saved</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-white border-green-200 hover:bg-green-50"
            onClick={() => navigate('/preferences')}
          >
            <div className="text-2xl mb-1">⚙️</div>
            <span className="text-xs">Preferences</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-white border-green-200 hover:bg-green-50"
            onClick={() => navigate('/chatbot')}
          >
            <div className="text-2xl mb-1">🤖</div>
            <span className="text-xs">AI Assistant</span>
          </Button>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <Link to="/categories" className="text-green-600 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.slice(0, 6).map((category) => (
              <div key={category.id} className="flex-shrink-0">
                <CategoryItem category={category} />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Offers */}
        {featuredOffers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Featured Offers</h2>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {featuredOffers.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {featuredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} featured />
              ))}
            </div>
          </div>
        )}

        {/* Today's Offers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Today's Offers</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {filteredOffers.length}
            </Badge>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="space-y-4">
              {regularOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-8 bg-white/50 border-dashed border-2 border-gray-300">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No offers found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new deals'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Clear Search
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Authentication CTA for guests */}
        {!authUser && (
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <CardTitle className="text-xl mb-2">Get Personalized Offers</CardTitle>
              <CardDescription className="text-green-100 mb-4">
                Sign up to save your preferences and get deals tailored just for you
              </CardDescription>
              <Button
                onClick={() => navigate('/login')}
                className="bg-white text-green-600 hover:bg-green-50 font-medium"
              >
                Sign Up Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
