
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Bell, TrendingUp, Star, Gift } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import BannerCarousel from './BannerCarousel';
import CategoryItem from './CategoryItem';
import OfferCard from './OfferCard';
import SearchBar from './SearchBar';
import TrendingDeals from './TrendingDeals';
import PointsSystem from './PointsSystem';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const categories = [
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'books', name: 'Books', icon: '📚' },
];

const HomeScreen = () => {
  const { offers, loading: dataLoading } = useData();
  const { session } = useAuth();
  const isMobile = useIsMobile();

  // Filter offers
  const featuredOffers = offers.filter(offer => offer.featured).slice(0, 6);
  const recentOffers = offers.slice(0, 8);
  const amazonOffers = offers.filter(offer => offer.isAmazon).slice(0, 6);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-monkeyGreen mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${isMobile ? 'pb-20' : 'pb-8'}`}>
      {/* Header */}
      <div className="bg-monkeyGreen text-white">
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Welcome to OffersMonkey! 🐵
              </h1>
              <p className={`text-white/90 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {session?.user ? 'Find amazing deals just for you' : 'Discover the best deals and offers'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {session?.user && (
                <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for deals, stores, or categories..."
          />
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'space-y-6' : 'space-y-8'} ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/search" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <Search className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
            <span className="text-sm font-medium">Advanced Search</span>
          </Link>
          <Link to="/trending" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Trending</span>
          </Link>
          {session?.user && (
            <Link to="/saved" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <span className="text-sm font-medium">Saved Deals</span>
            </Link>
          )}
          <Link to="/challenges" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Challenges</span>
          </Link>
        </div>

        {/* Points System - Only for logged in users */}
        {session?.user && (
          <PointsSystem />
        )}

        {/* Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Shop by Category</h2>
            <Link to="/categories" className="text-monkeyGreen text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-8'} gap-4`}>
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Trending Deals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <TrendingDeals />
        </div>

        {/* Featured Offers */}
        {featuredOffers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Featured Deals
              </h2>
              <Link to="/featured" className="text-monkeyGreen text-sm font-medium hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {featuredOffers.map((offer) => (
                <Link key={offer.id} to={`/offer/${offer.id}`}>
                  <OfferCard offer={offer} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Amazon Deals */}
        {amazonOffers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Amazon Deals</h2>
              <Link to="/amazon" className="text-monkeyGreen text-sm font-medium hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {amazonOffers.map((offer) => (
                <Link key={offer.id} to={`/offer/${offer.id}`}>
                  <OfferCard offer={offer} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Offers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Latest Deals</h2>
            <Link to="/latest" className="text-monkeyGreen text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-4`}>
            {recentOffers.map((offer) => (
              <Link key={offer.id} to={`/offer/${offer.id}`}>
                <OfferCard offer={offer} />
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action for Non-logged Users */}
        {!session?.user && (
          <div className="bg-gradient-to-r from-monkeyGreen to-green-600 rounded-xl p-6 text-white text-center">
            <h2 className="text-xl font-bold mb-2">Join OffersMonkey Today!</h2>
            <p className="mb-4 opacity-90">
              Save your favorite deals, earn points, and get personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
