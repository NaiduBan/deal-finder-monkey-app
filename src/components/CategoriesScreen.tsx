import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FolderOpen, Search, TrendingUp, ExternalLink, Tag, Calendar, Store, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface OfferData {
  lmd_id: number;
  title: string;
  description: string;
  image_url: string;
  offer_value: string;
  type: string;
  code: string;
  end_date: string;
  store: string;
  categories: string;
}

interface CategoryGroup {
  name: string;
  offers: OfferData[];
  offerCount: number;
}

const CategoriesScreen = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  useEffect(() => {
    fetchCategoriesWithOffers();
    if (session?.user) {
      loadSavedOffers();
    }
  }, [session]);

  const isOfferActive = (endDate: string | null) => {
    if (!endDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offerEndDate = new Date(endDate);
    offerEndDate.setHours(0, 0, 0, 0);
    return offerEndDate >= today;
  };

  const fetchCategoriesWithOffers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching fresh offers grouped by categories...');
      
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('lmd_id, title, description, image_url, offer_value, type, code, end_date, store, categories, status')
        .not('categories', 'is', null)
        .neq('categories', '')
        .in('status', ['active', 'Active', 'ACTIVE']);

      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }

      console.log('Raw offers data:', offers?.length || 0, 'records');

      const categoriesMap = new Map<string, OfferData[]>();

      offers?.forEach(offer => {
        if (offer.categories && offer.categories.trim() !== '' && isOfferActive(offer.end_date)) {
          const categoryList = offer.categories.split(',')
            .map(c => c.trim())
            .filter(Boolean)
            .filter(cat => cat.length > 0);
          
          categoryList.forEach(categoryName => {
            if (!categoriesMap.has(categoryName)) {
              categoriesMap.set(categoryName, []);
            }
            categoriesMap.get(categoryName)?.push(offer);
          });
        }
      });

      const categoryGroupsArray = Array.from(categoriesMap.entries()).map(([name, offers]) => ({
        name,
        offers,
        offerCount: offers.length
      }));

      // Sort by offer count (most offers first)
      categoryGroupsArray.sort((a, b) => b.offerCount - a.offerCount);

      console.log('Processed category groups with active offers:', categoryGroupsArray.length);
      setCategoryGroups(categoryGroupsArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories from database",
        variant: "destructive"
      });
      setCategoryGroups([]);
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

  const filteredCategoryGroups = useMemo(() => {
    if (!searchTerm) return categoryGroups;
    
    return categoryGroups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.offers.some(offer => 
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.store?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).map(group => ({
      ...group,
      offers: group.offers.filter(offer =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.store?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.offers.length > 0);
  }, [categoryGroups, searchTerm]);

  const totalOffers = categoryGroups.reduce((sum, group) => sum + group.offerCount, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 sticky top-0 z-10" style={{ top: isMobile ? '0' : '80px' }}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Link to="/home" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>All Categories</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Explore {totalOffers} deals from {categoryGroups.length} categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 space-y-8'}`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search categories and offers..."
            className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white ${isMobile ? 'text-base' : 'text-lg'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Category Groups */}
            {filteredCategoryGroups.map((group) => (
              <div key={group.name} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {group.offerCount} offers
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/category/${encodeURIComponent(group.name)}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>

                {/* Offers Grid */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {group.offers.slice(0, isMobile ? 4 : 8).map((offer) => (
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
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
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
                                  <Store className="w-3 h-3 mr-1" />
                                  {offer.store}
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
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCategoryGroups.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl text-center shadow-sm border border-gray-100/80 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No categories found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? `No categories found matching "${searchTerm}" with active offers` : 'No categories with active offers available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesScreen;
