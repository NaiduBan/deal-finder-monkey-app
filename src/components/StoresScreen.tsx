import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Search, TrendingUp, MapPin, Star, ExternalLink, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoreData {
  name: string;
  offerCount: number;
  categories: string[];
  popularOffers: string[];
}

const StoresScreen = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'offers'>('offers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchStores();
  }, []);

  const isOfferActive = (endDate: string | null) => {
    if (!endDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offerEndDate = new Date(endDate);
    offerEndDate.setHours(0, 0, 0, 0);
    return offerEndDate >= today;
  };

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching fresh stores data from Offers_data table...');
      
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('store, categories, title, end_date, status')
        .not('store', 'is', null)
        .neq('store', '')
        .in('status', ['active', 'Active', 'ACTIVE']);

      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }

      console.log('Raw offers data:', offers?.length || 0, 'records');

      const storesMap = new Map<string, StoreData>();

      offers?.forEach(offer => {
        if (offer.store && offer.store.trim() !== '' && isOfferActive(offer.end_date)) {
          const storeName = offer.store.trim();
          const existing = storesMap.get(storeName);
          const categories = offer.categories ? 
            offer.categories.split(',')
              .map(c => c.trim())
              .filter(Boolean)
              .filter(cat => cat.length > 0) : [];
          
          if (existing) {
            existing.offerCount++;
            categories.forEach(cat => {
              if (!existing.categories.includes(cat)) {
                existing.categories.push(cat);
              }
            });
            if (offer.title && existing.popularOffers.length < 3 && !existing.popularOffers.includes(offer.title)) {
              existing.popularOffers.push(offer.title);
            }
          } else {
            storesMap.set(storeName, {
              name: storeName,
              offerCount: 1,
              categories: categories,
              popularOffers: offer.title ? [offer.title] : []
            });
          }
        }
      });

      const storesArray = Array.from(storesMap.values()).filter(store => store.offerCount > 0);
      console.log('Processed stores with active offers:', storesArray.length);
      setStores(storesArray);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Error",
        description: "Failed to load stores from database",
        variant: "destructive"
      });
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.offerCount - a.offerCount;
      }
    });

    return filtered;
  }, [stores, searchTerm, sortBy]);

  const handleStoreClick = (storeName: string) => {
    navigate(`/store/${encodeURIComponent(storeName)}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 sticky top-0 z-10" style={{ top: isMobile ? '0' : '80px' }}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Link to="/home" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>All Stores</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Discover amazing deals from {stores.length} stores
                  </p>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 max-w-7xl mx-auto space-y-8'}`}>
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search stores..."
              className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white ${isMobile ? 'text-base' : 'text-lg'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{filteredAndSortedStores.length} stores found</span>
            </div>

            <Select value={sortBy} onValueChange={(value: 'name' | 'offers') => setSortBy(value)}>
              <SelectTrigger className="w-[200px] bg-white rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offers">Most Offers</SelectItem>
                <SelectItem value="name">Store Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' 
            ? `grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}` 
            : 'space-y-4'
          }`}>
            {filteredAndSortedStores.map((store) => (
              <Card
                key={store.name}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-emerald-200/60"
                onClick={() => handleStoreClick(store.name)}
              >
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                          {store.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{store.offerCount} active offers</span>
                          {store.categories.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{store.categories.length} categories</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  {store.categories.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {store.categories.slice(0, 3).map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {category}
                          </Badge>
                        ))}
                        {store.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                            +{store.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {store.popularOffers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Offers:</p>
                      <div className="space-y-1">
                        {store.popularOffers.slice(0, 2).map((offer, index) => (
                          <p key={index} className="text-xs text-gray-600 truncate">
                            • {offer}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedStores.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl text-center shadow-sm border border-gray-100/80 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Store className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No stores found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? `No stores found matching "${searchTerm}" with active offers` : 'No stores with active offers available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresScreen;
