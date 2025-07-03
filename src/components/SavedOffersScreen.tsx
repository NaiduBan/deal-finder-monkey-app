
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bookmark, Share2, Filter } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfferCard from './OfferCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Offer } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

const SavedOffersScreen = () => {
  const { user, unsaveOffer } = useUser();
  const { session } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [savedOffers, setSavedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved offers from database
  useEffect(() => {
    const fetchSavedOffers = async () => {
      if (!session?.user) {
        setSavedOffers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user's saved offer IDs
        const { data: savedOfferIds, error: savedError } = await supabase
          .from('saved_offers')
          .select('offer_id')
          .eq('user_id', session.user.id);

        if (savedError) throw savedError;

        if (!savedOfferIds || savedOfferIds.length === 0) {
          setSavedOffers([]);
          setIsLoading(false);
          return;
        }

        // Get offer details for saved offers
        const offerIds = savedOfferIds.map(item => item.offer_id.replace('offer-', ''));
        
        const { data: offersData, error: offersError } = await supabase
          .from('Offers_data')
          .select('*')
          .in('lmd_id', offerIds);

        if (offersError) throw offersError;

        // Transform the data to match our Offer type
        const transformedOffers: Offer[] = (offersData || []).map((item: any, index: number) => {
          // Calculate price and savings
          let price = 0;
          let originalPrice = 0;
          let savings = '';
          
          if (item.offer_value) {
            const offerValue = item.offer_value;
            if (offerValue.includes('%')) {
              const percent = parseInt(offerValue.replace(/[^0-9]/g, ''));
              originalPrice = Math.floor(1000 + Math.random() * 9000);
              price = Math.floor(originalPrice * (1 - percent / 100));
              savings = `${percent}%`;
            } else if (offerValue.match(/\d+/)) {
              const amount = parseInt(offerValue.replace(/[^0-9]/g, ''));
              price = amount;
              originalPrice = price + Math.floor(Math.random() * 500) + 100;
              savings = `₹${originalPrice - price}`;
            } else {
              price = Math.floor(Math.random() * 1000) + 100;
              originalPrice = price + Math.floor(Math.random() * 500) + 100;
              savings = `₹${originalPrice - price}`;
            }
          } else {
            price = Math.floor(Math.random() * 1000) + 100;
            originalPrice = price + Math.floor(Math.random() * 500) + 100;
            savings = `₹${originalPrice - price}`;
          }

          const isAmazon = (item.store && item.store.toLowerCase().includes('amazon')) || 
                          (item.merchant_homepage && item.merchant_homepage.toLowerCase().includes('amazon'));
          
          return {
            id: `offer-${item.lmd_id}`,
            title: item.title || "",
            description: item.description || item.long_offer || item.offer || "",
            imageUrl: item.image_url || "",
            store: item.store || "",
            category: item.categories || "",
            price: price,
            originalPrice: originalPrice,
            expiryDate: item.end_date || "",
            isAmazon: isAmazon,
            savings: savings,
            lmdId: Number(item.lmd_id) || 0,
            merchantHomepage: item.merchant_homepage || "",
            longOffer: item.long_offer || "",
            code: item.code || "",
            termsAndConditions: item.terms_and_conditions || "",
            featured: item.featured === "true" || item.featured === "1",
            publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
            sponsored: item.sponsored || false,
            banner: item.banner || false,
            url: item.url || "",
            smartlink: item.smartlink || "",
            offerType: item.type || "",
            offerValue: item.offer_value || "",
            status: item.status || "",
            startDate: item.start_date || "",
            endDate: item.end_date || "",
            categories: item.categories || ""
          };
        });

        setSavedOffers(transformedOffers);
      } catch (error) {
        console.error('Error fetching saved offers:', error);
        toast({
          title: "Error",
          description: "Failed to load saved offers",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedOffers();
  }, [session, toast]);

  // Real-time subscription for saved offers changes
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('saved-offers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_offers',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Saved offers change detected:', payload);
          // Refetch saved offers when changes occur
          // This ensures we always have the latest data
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            // Re-fetch offers after a small delay to ensure DB consistency
            setTimeout(() => {
              fetchSavedOffers();
            }, 100);
          }
        }
      )
      .subscribe();

    // Helper function to refetch (for the timeout above)
    const fetchSavedOffers = async () => {
      try {
        const { data: savedOfferIds } = await supabase
          .from('saved_offers')
          .select('offer_id')
          .eq('user_id', session.user.id);

        if (!savedOfferIds || savedOfferIds.length === 0) {
          setSavedOffers([]);
          return;
        }

        const offerIds = savedOfferIds.map(item => item.offer_id.replace('offer-', ''));
        
        const { data: offersData } = await supabase
          .from('Offers_data')
          .select('*')
          .in('lmd_id', offerIds);

        if (offersData) {
          // Same transformation logic as above
          const transformedOffers: Offer[] = offersData.map((item: any) => ({
            id: `offer-${item.lmd_id}`,
            title: item.title || "",
            description: item.description || item.long_offer || item.offer || "",
            imageUrl: item.image_url || "",
            store: item.store || "",
            category: item.categories || "",
            price: Math.floor(Math.random() * 1000) + 100,
            originalPrice: Math.floor(Math.random() * 1500) + 200,
            expiryDate: item.end_date || "",
            isAmazon: (item.store && item.store.toLowerCase().includes('amazon')),
            savings: "20%",
            lmdId: Number(item.lmd_id) || 0,
            merchantHomepage: item.merchant_homepage || "",
            longOffer: item.long_offer || "",
            code: item.code || "",
            termsAndConditions: item.terms_and_conditions || "",
            featured: item.featured === "true",
            publisherExclusive: item.publisher_exclusive === "true",
            sponsored: item.sponsored || false,
            banner: item.banner || false,
            url: item.url || "",
            smartlink: item.smartlink || "",
            offerType: item.type || "",
            offerValue: item.offer_value || "",
            status: item.status || "",
            startDate: item.start_date || "",
            endDate: item.end_date || "",
            categories: item.categories || ""
          }));

          setSavedOffers(transformedOffers);
        }
      } catch (error) {
        console.error('Error in real-time refetch:', error);
      }
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleUnsave = (offerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveOffer(offerId);
  };

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
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Mobile Header - only show on mobile */}
      {isMobile && (
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
      )}

      {/* Main content - desktop with max-width container */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* Desktop header */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Saved Offers</h1>
                  <p className="text-gray-600 mt-1">Your bookmarked deals and offers</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter & Sort</span>
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Filter/Sort options */}
          {!isMobile && filterOpen && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h3 className="font-semibold mb-4 text-gray-900">Sort by:</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={sortBy === 'newest' ? 'default' : 'outline'} 
                  onClick={() => setSortBy('newest')}
                >
                  Newest First
                </Button>
                <Button 
                  variant={sortBy === 'price-low' ? 'default' : 'outline'} 
                  onClick={() => setSortBy('price-low')}
                >
                  Price: Low to High
                </Button>
                <Button 
                  variant={sortBy === 'price-high' ? 'default' : 'outline'} 
                  onClick={() => setSortBy('price-high')}
                >
                  Price: High to Low
                </Button>
                <Button 
                  variant={sortBy === 'expiring' ? 'default' : 'outline'} 
                  onClick={() => setSortBy('expiring')}
                >
                  Expiring Soon
                </Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className={`${isMobile ? 'w-full' : 'w-fit'} bg-white`}>
              <TabsTrigger value="all" className={isMobile ? 'flex-1' : ''}>All Saved</TabsTrigger>
              <TabsTrigger value="local" className={isMobile ? 'flex-1' : ''}>Local</TabsTrigger>
              <TabsTrigger value="online" className={isMobile ? 'flex-1' : ''}>Online</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-monkeyGreen"></div>
                </div>
              ) : sortedOffers.length > 0 ? (
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
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
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <Bookmark className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">No saved offers</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't saved any offers yet. Start exploring and bookmark your favorite deals!</p>
                  <Link to="/home">
                    <Button size="lg">Discover Offers</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="local" className="mt-6">
              {sortedOffers.filter(offer => !offer.isAmazon).length > 0 ? (
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
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
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500 text-lg">No local saved offers</p>
                  <p className="text-gray-400 mt-2">Save some local store offers to see them here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="online" className="mt-6">
              {sortedOffers.filter(offer => offer.isAmazon).length > 0 ? (
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
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
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500 text-lg">No online saved offers</p>
                  <p className="text-gray-400 mt-2">Save some online offers to see them here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SavedOffersScreen;
