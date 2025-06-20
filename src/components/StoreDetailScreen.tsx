
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Share2, Tag, Calendar, TrendingUp, Star, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface StoreDetail {
  name: string;
  totalOffers: number;
  categories: string[];
  offers: Array<{
    lmd_id: number;
    title: string;
    description: string;
    offer_value: string;
    type: string;
    code: string;
    end_date: string;
    categories: string;
  }>;
}

const StoreDetailScreen = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  useEffect(() => {
    if (storeName) {
      fetchStoreDetail(decodeURIComponent(storeName));
      if (session?.user) {
        loadSavedOffers();
      }
    }
  }, [storeName, session]);

  const fetchStoreDetail = async (name: string) => {
    try {
      setIsLoading(true);
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('lmd_id, title, description, offer_value, type, code, end_date, categories')
        .eq('store', name);

      if (error) throw error;

      if (offers && offers.length > 0) {
        const categories = new Set<string>();
        offers.forEach(offer => {
          if (offer.categories) {
            offer.categories.split(',').forEach(cat => {
              const trimmed = cat.trim();
              if (trimmed) categories.add(trimmed);
            });
          }
        });

        setStoreDetail({
          name,
          totalOffers: offers.length,
          categories: Array.from(categories),
          offers: offers
        });
      }
    } catch (error) {
      console.error('Error fetching store detail:', error);
      toast({
        title: "Error",
        description: "Failed to load store details",
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
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center ${isMobile ? '' : 'pt-20'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!storeDetail) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center ${isMobile ? '' : 'pt-20'}`}>
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-3">Store not found</h3>
          <Link to="/stores" className="text-emerald-600 hover:text-emerald-700">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 sticky z-10 ${isMobile ? 'top-0' : 'top-20'}`}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/stores" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
                    {storeDetail.name}
                  </h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {storeDetail.totalOffers} offers available
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 max-w-7xl mx-auto space-y-8'}`}>
        {/* Store Overview */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{storeDetail.totalOffers}</p>
                  <p className="text-sm text-gray-600">Total Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{storeDetail.categories.length}</p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.5</p>
                  <p className="text-sm text-gray-600">Store Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        {storeDetail.categories.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {storeDetail.categories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offers */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>All Offers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {storeDetail.offers.map((offer) => (
                <Card
                  key={offer.lmd_id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-gray-200/60"
                  onClick={() => handleOfferClick(offer.lmd_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                          {offer.title}
                        </h3>
                        {offer.offer_value && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 mb-2">
                            {offer.offer_value}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveOffer(offer.lmd_id.toString());
                        }}
                        className="flex-shrink-0 ml-2"
                      >
                        <Bookmark 
                          className={`w-4 h-4 ${
                            savedOffers.includes(offer.lmd_id.toString()) 
                              ? 'fill-current text-emerald-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                    </div>

                    {offer.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {offer.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {offer.type && (
                          <Badge variant="outline" className="text-xs">
                            {offer.type}
                          </Badge>
                        )}
                        {offer.code && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Code: {offer.code}
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

export default StoreDetailScreen;
