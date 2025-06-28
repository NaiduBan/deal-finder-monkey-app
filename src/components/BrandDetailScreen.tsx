import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ExternalLink, Share2, Tag, Calendar, TrendingUp, Store, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrandDetail {
  name: string;
  totalOffers: number;
  stores: string[];
  offers: Array<{
    lmd_id: number;
    title: string;
    description: string;
    image_url: string;
    offer_value: string;
    type: string;
    code: string;
    end_date: string;
    store: string;
  }>;
}

const BrandDetailScreen = () => {
  const { brandName } = useParams<{ brandName: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [brandDetail, setBrandDetail] = useState<BrandDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  useEffect(() => {
    if (brandName) {
      fetchBrandDetail(decodeURIComponent(brandName));
      if (session?.user) {
        loadSavedOffers();
      }
    }
  }, [brandName, session]);

  const isOfferActive = (endDate: string | null) => {
    if (!endDate) return true;
    const today = new Date();
    const offerEndDate = new Date(endDate);
    return offerEndDate >= today;
  };

  const fetchBrandDetail = async (name: string) => {
    try {
      setIsLoading(true);
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('lmd_id, title, description, image_url, offer_value, type, code, end_date, store, categories')
        .ilike('categories', `%${name}%`);

      if (error) throw error;

      if (offers && offers.length > 0) {
        const stores = new Set<string>();
        const filteredOffers = offers.filter(offer => {
          if (offer.categories && isOfferActive(offer.end_date)) {
            const categories = offer.categories.split(',').map(c => c.trim());
            const hasCategory = categories.some(cat => 
              cat.toLowerCase() === name.toLowerCase()
            );
            if (hasCategory && offer.store) {
              stores.add(offer.store);
            }
            return hasCategory;
          }
          return false;
        });

        setBrandDetail({
          name,
          totalOffers: filteredOffers.length,
          stores: Array.from(stores),
          offers: filteredOffers
        });
      }
    } catch (error) {
      console.error('Error fetching brand detail:', error);
      toast({
        title: "Error",
        description: "Failed to load brand details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedOffers = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('saved_offers')
        .select('offer_id')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setSavedOffers(data?.map(item => item.offer_id) || []);
    } catch (error) {
      console.error('Error loading saved offers:', error);
    }
  };

  const handleSaveOffer = async (offerId: string) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to save offers",
        variant: "destructive"
      });
      return;
    }

    try {
      const isSaved = savedOffers.includes(offerId);

      if (isSaved) {
        const { error } = await supabase
          .from('saved_offers')
          .delete()
          .eq('user_id', session.user.id)
          .eq('offer_id', offerId);

        if (error) throw error;
        setSavedOffers(prev => prev.filter(id => id !== offerId));
        toast({
          title: "Offer removed",
          description: "Offer removed from saved list",
        });
      } else {
        const { error } = await supabase
          .from('saved_offers')
          .insert({
            user_id: session.user.id,
            offer_id: offerId
          });

        if (error) throw error;
        setSavedOffers(prev => [...prev, offerId]);
        toast({
          title: "Offer saved",
          description: "Offer added to your saved list",
        });
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive"
      });
    }
  };

  const handleOfferClick = (offerId: number) => {
    navigate(`/offer/${offerId}`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 flex items-center justify-center ${isMobile ? '' : 'pt-20'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!brandDetail) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 flex items-center justify-center ${isMobile ? '' : 'pt-20'}`}>
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-3">Brand not found</h3>
          <Link to="/brands" className="text-purple-600 hover:text-purple-700">
            Back to brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 sticky z-10 ${isMobile ? 'top-0' : 'top-20'}`}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/brands" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
                    {brandDetail.name}
                  </h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {brandDetail.totalOffers} active offers
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 max-w-7xl mx-auto space-y-8'}`}>
        {/* Brand Overview */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{brandDetail.totalOffers}</p>
                  <p className="text-sm text-gray-600">Active Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Store className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{brandDetail.stores.length}</p>
                  <p className="text-sm text-gray-600">Partner Stores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600">Brand Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Stores */}
        {brandDetail.stores.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-purple-600" />
                <span>Partner Stores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {brandDetail.stores.map((store, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 cursor-pointer"
                    onClick={() => navigate(`/store/${encodeURIComponent(store)}`)}
                  >
                    {store}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offers Grid */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span>All Offers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {brandDetail.offers.map((offer) => (
                <Card
                  key={offer.lmd_id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border-gray-200/60 overflow-hidden"
                  onClick={() => handleOfferClick(offer.lmd_id)}
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={offer.image_url || "/placeholder.svg"}
                      alt={offer.title || "Offer"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Save Button */}
                    {session?.user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveOffer(`${offer.lmd_id}`);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                      >
                        <Bookmark 
                          className={`w-4 h-4 ${
                            savedOffers.includes(`${offer.lmd_id}`) 
                              ? 'fill-current text-purple-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    )}

                    {/* Badges */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {offer.offer_value && (
                        <Badge className="bg-purple-600 text-white shadow-lg">
                          {offer.offer_value}
                        </Badge>
                      )}
                      {offer.code && (
                        <Badge className="bg-blue-600 text-white shadow-lg">
                          <Tag className="w-3 h-3 mr-1" />
                          CODE
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                        {offer.title}
                      </h3>

                      {offer.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {offer.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {offer.store && (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              {offer.store}
                            </Badge>
                          )}
                          {offer.type && (
                            <Badge variant="outline" className="text-xs">
                              {offer.type}
                            </Badge>
                          )}
                        </div>
                        
                        {offer.end_date && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Ends {new Date(offer.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandDetailScreen;
