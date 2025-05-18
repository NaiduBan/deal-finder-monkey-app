
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bookmark, Share2, Filter } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { mockOffers } from '@/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfferCard from './OfferCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SavedOffersScreen = () => {
  const { user, unsaveOffer } = useUser();
  const { toast } = useToast();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Get saved offers
  const savedOffers = mockOffers.filter(offer => 
    user.savedOffers.includes(offer.id)
  );

  // Function to handle removing an offer from saved
  const handleUnsave = (offerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveOffer(offerId);
    toast({
      title: "Offer removed",
      description: "The offer has been removed from your saved items.",
    });
  };

  // Function to handle sharing an offer
  const handleShare = (offerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Share feature",
      description: "Sharing functionality will be available soon.",
    });
  };

  // Sort the offers based on selection
  const sortedOffers = [...savedOffers].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'expiring') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    return 0; // default/newest
  });

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/home">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-medium">Saved Offers</h1>
          </div>
          <Button 
            variant="ghost" 
            className="text-white p-1 h-auto"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter/Sort options */}
        {filterOpen && (
          <div className="mt-3 bg-white text-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Sort by:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={sortBy === 'newest' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSortBy('newest')}
                className="text-xs"
              >
                Newest
              </Button>
              <Button 
                variant={sortBy === 'price-low' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSortBy('price-low')}
                className="text-xs"
              >
                Price: Low to High
              </Button>
              <Button 
                variant={sortBy === 'price-high' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSortBy('price-high')}
                className="text-xs"
              >
                Price: High to Low
              </Button>
              <Button 
                variant={sortBy === 'expiring' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSortBy('expiring')}
                className="text-xs"
              >
                Expiring Soon
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All Saved</TabsTrigger>
            <TabsTrigger value="local" className="flex-1">Local</TabsTrigger>
            <TabsTrigger value="online" className="flex-1">Online</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {sortedOffers.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {sortedOffers.map((offer) => (
                  <div key={offer.id} className="relative">
                    <Link to={`/offer/${offer.id}`}>
                      <OfferCard offer={offer} />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-7 w-7 bg-white/80 hover:bg-white"
                          onClick={(e) => handleShare(offer.id, e)}
                        >
                          <Share2 className="w-4 h-4 text-gray-700" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-7 w-7 bg-white/80 hover:bg-white"
                          onClick={(e) => handleUnsave(offer.id, e)}
                        >
                          <Bookmark className="w-4 h-4 text-gray-700 fill-gray-700" />
                        </Button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Bookmark className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved offers</h3>
                <p className="text-gray-500 mb-4">You haven't saved any offers yet.</p>
                <Link to="/home">
                  <Button>Discover offers</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="local" className="mt-4">
            {sortedOffers.filter(offer => !offer.isAmazon).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {sortedOffers
                  .filter(offer => !offer.isAmazon)
                  .map((offer) => (
                    <div key={offer.id} className="relative">
                      <Link to={`/offer/${offer.id}`}>
                        <OfferCard offer={offer} />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 bg-white/80 hover:bg-white"
                            onClick={(e) => handleShare(offer.id, e)}
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 bg-white/80 hover:bg-white"
                            onClick={(e) => handleUnsave(offer.id, e)}
                          >
                            <Bookmark className="w-4 h-4 text-gray-700 fill-gray-700" />
                          </Button>
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No local saved offers</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            {sortedOffers.filter(offer => offer.isAmazon).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {sortedOffers
                  .filter(offer => offer.isAmazon)
                  .map((offer) => (
                    <div key={offer.id} className="relative">
                      <Link to={`/offer/${offer.id}`}>
                        <OfferCard offer={offer} />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 bg-white/80 hover:bg-white"
                            onClick={(e) => handleShare(offer.id, e)}
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 bg-white/80 hover:bg-white"
                            onClick={(e) => handleUnsave(offer.id, e)}
                          >
                            <Bookmark className="w-4 h-4 text-gray-700 fill-gray-700" />
                          </Button>
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No online saved offers</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SavedOffersScreen;
