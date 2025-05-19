
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { offers, categories, isLoading: isDataLoading, refetchOffers } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const loadMoreOffers = () => {
    setIsLoading(true);
    refetchOffers().then(() => {
      setIsLoading(false);
    });
  };

  // Get saved offers
  const savedOffers = offers.filter(offer => 
    user.savedOffers.includes(offer.id)
  );
  
  // Filter offers based on search query
  const filteredOffers = offers.filter(offer => 
    searchQuery === '' || 
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format price in Indian Rupees
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header with location */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Link to="/notifications" className="flex items-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute translate-x-3 -translate-y-2">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            placeholder="Search for offers, stores, categories..."
            className="pl-10 pr-4 py-2 w-full border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Categories carousel */}
        <div>
          <h2 className="font-bold mb-3 text-lg">For You</h2>
          {isDataLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-monkeyGreen"></div>
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories
                .filter(category => category.id !== "supermarket")
                .map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
            </div>
          )}
        </div>
        
        {/* Favorites section */}
        <div>
          <h2 className="font-bold mb-3 text-lg">Your Favorites</h2>
          {savedOffers.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {savedOffers.map((offer) => (
                <Link key={offer.id} to={`/offer/${offer.id}`}>
                  <OfferCard offer={offer} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <p className="text-gray-500">No saved offers yet</p>
              <p className="text-sm text-gray-400 mt-2">Save offers to see them here</p>
            </div>
          )}
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
              {isDataLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-monkeyGreen"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredOffers.map((offer) => (
                    <Link key={offer.id} to={`/offer/${offer.id}`}>
                      <OfferCard offer={offer} />
                    </Link>
                  ))}
                </div>
              )}
              
              {!isDataLoading && filteredOffers.length === 0 && (
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <p className="text-gray-500">No offers found</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              )}
              
              {!isDataLoading && filteredOffers.length > 0 && (
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
              )}
            </TabsContent>
            
            <TabsContent value="nearby" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {filteredOffers.filter(offer => !offer.isAmazon).map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="amazon" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {filteredOffers.filter(offer => offer.isAmazon).map((offer) => (
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
