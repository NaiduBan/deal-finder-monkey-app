import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import BannerCarousel from './BannerCarousel';
import Categories from './Categories';
import Offers from './Offers';
import PreferenceStatusBanner from './PreferenceStatusBanner';

const HomeScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Discover Best Offers
        </h1>
        <p className="text-sm">
          Explore top deals and exclusive offers tailored for you.
        </p>
      </div>

      {/* Preference Status Banner */}
      <PreferenceStatusBanner />

      {/* Search Bar */}
      <div className="container mx-auto mt-4 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search for offers, stores, and more..."
            className="pl-10 pr-4 py-3 w-full rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="mt-6">
        <BannerCarousel />
      </div>

      {/* Categories */}
      <div className="container mx-auto mt-8 px-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <Categories />
      </div>

      {/* Offers Section */}
      <div className="container mx-auto mt-8 px-4">
        <h2 className="text-xl font-semibold mb-4">Today's Best Offers</h2>
        <Offers />
      </div>
    </div>
  );
};

export default HomeScreen;
