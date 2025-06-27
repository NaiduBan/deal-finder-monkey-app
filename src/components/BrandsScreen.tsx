
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Search, TrendingUp, ExternalLink, Grid, List, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrandData {
  name: string;
  offerCount: number;
  categories: string[];
  popularOffers: string[];
  latestOffer: string;
  discountRange: string;
}

const BrandsScreen = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'offers'>('offers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('store, categories, title, offer_value, start_date')
        .not('store', 'is', null);

      if (error) throw error;

      const brandsMap = new Map<string, BrandData>();

      offers?.forEach(offer => {
        if (offer.store && offer.store.trim() !== '') {
          const storeName = offer.store.trim();
          const existing = brandsMap.get(storeName);
          
          if (existing) {
            existing.offerCount++;
            if (offer.categories) {
              const categories = offer.categories.split(',').map(c => c.trim());
              categories.forEach(category => {
                if (category && !existing.categories.includes(category)) {
                  existing.categories.push(category);
                }
              });
            }
            if (offer.title && existing.popularOffers.length < 3) {
              existing.popularOffers.push(offer.title);
            }
            // Update latest offer if this one is newer
            if (offer.start_date && offer.title) {
              existing.latestOffer = offer.title;
            }
          } else {
            const categories = offer.categories ? offer.categories.split(',').map(c => c.trim()).filter(Boolean) : [];
            brandsMap.set(storeName, {
              name: storeName,
              offerCount: 1,
              categories: categories,
              popularOffers: offer.title ? [offer.title] : [],
              latestOffer: offer.title || '',
              discountRange: offer.offer_value || 'Varies'
            });
          }
        }
      });

      const brandsArray = Array.from(brandsMap.values());
      setBrands(brandsArray);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedBrands = useMemo(() => {
    let filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.offerCount - a.offerCount;
      }
    });

    return filtered;
  }, [brands, searchTerm, sortBy]);

  const handleBrandClick = (brandName: string) => {
    navigate(`/brand/${encodeURIComponent(brandName)}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
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
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>Popular Brands</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Discover amazing deals from {brands.length} top brands
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
              placeholder="Search brands..."
              className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white ${isMobile ? 'text-base' : 'text-lg'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{filteredAndSortedBrands.length} brands available</span>
            </div>

            <Select value={sortBy} onValueChange={(value: 'name' | 'offers') => setSortBy(value)}>
              <SelectTrigger className="w-[200px] bg-white rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offers">Most Offers</SelectItem>
                <SelectItem value="name">Brand Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Brands Section */}
        {!searchTerm && !isLoading && brands.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              Top Performing Brands
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brands.slice(0, 3).map((brand, index) => (
                <div key={brand.name} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                      <p className="text-sm text-gray-600">{brand.offerCount} active offers</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' 
            ? `grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}` 
            : 'space-y-4'
          }`}>
            {filteredAndSortedBrands.map((brand) => (
              <Card
                key={brand.name}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-purple-200/60"
                onClick={() => handleBrandClick(brand.name)}
              >
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                          {brand.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{brand.offerCount} offers</span>
                          {brand.discountRange !== 'Varies' && (
                            <>
                              <span>•</span>
                              <span>Up to {brand.discountRange}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>

                  {brand.categories.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Available in:</p>
                      <div className="flex flex-wrap gap-1">
                        {brand.categories.slice(0, 3).map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {category}
                          </Badge>
                        ))}
                        {brand.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                            +{brand.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {brand.latestOffer && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Latest Offer:</p>
                      <p className="text-xs text-gray-600 truncate bg-purple-50 p-2 rounded">
                        {brand.latestOffer}
                      </p>
                    </div>
                  )}

                  {brand.popularOffers.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">More Deals:</p>
                      <div className="space-y-1">
                        {brand.popularOffers.slice(1, 3).map((offer, index) => (
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
        {!isLoading && filteredAndSortedBrands.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl text-center shadow-sm border border-gray-100/80 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Star className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No brands found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? `No brands found matching "${searchTerm}"` : 'No brands available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsScreen;
