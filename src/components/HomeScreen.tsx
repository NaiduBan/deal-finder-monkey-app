
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCategories, mockOffers } from '@/mockData';
import { useUser } from '@/contexts/UserContext';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const loadMoreOffers = () => {
    setIsLoading(true);
    // Simulate loading more offers
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Get saved offers
  const savedOffers = mockOffers.filter(offer => 
    user.savedOffers.includes(offer.id)
  );

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
        {/* Categories carousel */}
        <div>
          <h2 className="font-bold mb-3 text-lg">For You</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {mockCategories
              .filter(category => category.id !== "supermarket")
              .map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
          </div>
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
