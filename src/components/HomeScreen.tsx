
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCategories, mockOffers, mockBanners } from '@/mockData';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';
import BannerCarousel from './BannerCarousel';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search offers
    console.log('Searching for:', searchQuery);
  };

  const loadMoreOffers = () => {
    setIsLoading(true);
    // Simulate loading more offers
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header with location */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">San Francisco, CA</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs bg-monkeyYellow text-black px-2 py-0.5 rounded-full">250 pts</span>
          </div>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search offers, stores, products..."
              className="pl-10 pr-4 py-2 w-full bg-white/90 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
      
      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Categories carousel */}
        <div>
          <h2 className="font-bold mb-3 text-lg">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {mockCategories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        </div>
        
        {/* Banners carousel */}
        <div>
          <h2 className="font-bold mb-3 text-lg">Featured Deals</h2>
          <BannerCarousel banners={mockBanners} />
        </div>
        
        {/* Offers section */}
        <div>
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Today's Offers</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
                <TabsTrigger value="amazon">Amazon</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                {mockOffers.map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
              
              {/* Load more button */}
              <button 
                onClick={loadMoreOffers}
                className="w-full py-3 text-center text-monkeyGreen border border-monkeyGreen rounded-lg mt-4 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-monkeyGreen border-t-transparent animate-spin"></div>
                    <span>Loading more...</span>
                  </div>
                ) : (
                  <span>Load more</span>
                )}
              </button>
            </TabsContent>
            
            <TabsContent value="nearby" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {mockOffers.filter(offer => !offer.isAmazon).map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="amazon" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {mockOffers.filter(offer => offer.isAmazon).map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
