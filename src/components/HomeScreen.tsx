
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from './SearchBar';
import BannerCarousel from './BannerCarousel';
import OfferCard from './OfferCard';
import TrendingDeals from './TrendingDeals';
import PointsSystem from './PointsSystem';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Gift, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  const { offers, banners } = useData();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredOffers = offers.filter(offer => offer.featured).slice(0, 6);
  const recentOffers = offers.slice(0, 8);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to search results or filter offers here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-monkeyGreen mb-4">OffersMonkey</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Points System (if logged in) */}
        {session?.user && <PointsSystem />}

        {/* Banner Carousel */}
        <BannerCarousel banners={banners} />

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Link to="/search" className="flex flex-col items-center p-3 bg-white rounded-lg border">
            <Search className="w-6 h-6 text-monkeyGreen mb-1" />
            <span className="text-xs text-gray-600">Search</span>
          </Link>
          <Link to="/trending" className="flex flex-col items-center p-3 bg-white rounded-lg border">
            <TrendingUp className="w-6 h-6 text-orange-500 mb-1" />
            <span className="text-xs text-gray-600">Trending</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center p-3 bg-white rounded-lg border">
            <Gift className="w-6 h-6 text-purple-500 mb-1" />
            <span className="text-xs text-gray-600">Categories</span>
          </Link>
          {session?.user && (
            <Link to="/saved" className="flex flex-col items-center p-3 bg-white rounded-lg border">
              <Star className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="text-xs text-gray-600">Saved</span>
            </Link>
          )}
        </div>

        {/* Trending Deals */}
        <TrendingDeals />

        {/* Featured Offers */}
        {featuredOffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Featured Deals</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/featured">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Offers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Latest Deals</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/all-offers">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
