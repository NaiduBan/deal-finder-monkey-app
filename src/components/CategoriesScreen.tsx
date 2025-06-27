
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FolderOpen, Search, TrendingUp, ExternalLink, Grid, List, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryData {
  name: string;
  offerCount: number;
  stores: string[];
  popularOffers: string[];
  averageDiscount: string;
  topBrands: string[];
}

const CategoriesScreen = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'offers'>('offers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('categories, store, title, offer_value');

      if (error) throw error;

      const categoriesMap = new Map<string, CategoryData>();

      offers?.forEach(offer => {
        if (offer.categories) {
          const categories = offer.categories.split(',').map(c => c.trim());
          categories.forEach(category => {
            if (category) {
              const existing = categoriesMap.get(category);
              
              if (existing) {
                existing.offerCount++;
                if (offer.store && !existing.stores.includes(offer.store)) {
                  existing.stores.push(offer.store);
                  if (existing.topBrands.length < 5) {
                    existing.topBrands.push(offer.store);
                  }
                }
                if (offer.title && existing.popularOffers.length < 3) {
                  existing.popularOffers.push(offer.title);
                }
              } else {
                categoriesMap.set(category, {
                  name: category,
                  offerCount: 1,
                  stores: offer.store ? [offer.store] : [],
                  popularOffers: offer.title ? [offer.title] : [],
                  averageDiscount: offer.offer_value || 'Varies',
                  topBrands: offer.store ? [offer.store] : []
                });
              }
            }
          });
        }
      });

      const categoriesArray = Array.from(categoriesMap.values());
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.offerCount - a.offerCount;
      }
    });

    return filtered;
  }, [categories, searchTerm, sortBy]);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
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
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>Shop by Category</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Browse {categories.length} categories with amazing deals
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
              placeholder="Search categories..."
              className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white ${isMobile ? 'text-base' : 'text-lg'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{filteredAndSortedCategories.length} categories available</span>
            </div>

            <Select value={sortBy} onValueChange={(value: 'name' | 'offers') => setSortBy(value)}>
              <SelectTrigger className="w-[200px] bg-white rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offers">Most Offers</SelectItem>
                <SelectItem value="name">Category Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Popular Categories Section */}
        {!searchTerm && !isLoading && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-green-600" />
              Most Popular Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category, index) => (
                <div 
                  key={category.name} 
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.offerCount} offers</p>
                    <p className="text-xs text-green-600 mt-1">{category.stores.length} stores</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' 
            ? `grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}` 
            : 'space-y-4'
          }`}>
            {filteredAndSortedCategories.map((category) => (
              <Card
                key={category.name}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-green-200/60"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                        <FolderOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{category.offerCount} offers</span>
                          {category.stores.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{category.stores.length} stores</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>

                  {category.topBrands.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Top Brands:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.topBrands.slice(0, 3).map((brand, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {brand}
                          </Badge>
                        ))}
                        {category.topBrands.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                            +{category.topBrands.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {category.popularOffers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Featured Deals:</p>
                      <div className="space-y-1">
                        {category.popularOffers.slice(0, 2).map((offer, index) => (
                          <p key={index} className="text-xs text-gray-600 truncate bg-green-50 p-2 rounded">
                            • {offer}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {category.averageDiscount !== 'Varies' && (
                    <div className="text-center">
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        Up to {category.averageDiscount} off
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedCategories.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl text-center shadow-sm border border-gray-100/80 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No categories found</h3>
            <p className="text-gray-500 text-lg">
              {searchTerm ? `No categories found matching "${searchTerm}"` : 'No categories available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesScreen;
