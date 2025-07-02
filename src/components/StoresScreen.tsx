import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Search, TrendingUp, MapPin, Star, ExternalLink, Filter, Grid, List, ArrowRight } from 'lucide-react';
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
  logo?: string;
  rating?: number;
  cashback?: string;
  distance?: string;
  isOpen?: boolean;
  featured?: boolean;
}

// Mock store logos and additional data
const storeEnrichments: { [key: string]: Partial<StoreData> } = {
  'Amazon': {
    logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200',
    rating: 4.5,
    cashback: '2-5%',
    distance: 'Delivers nationwide',
    isOpen: true,
    featured: true
  },
  'Flipkart': {
    logo: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200',
    rating: 4.3,
    cashback: '1-3%',
    distance: 'Pan India delivery',
    isOpen: true,
    featured: true
  },
  'Myntra': {
    logo: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=200',
    rating: 4.2,
    cashback: '3-7%',
    distance: 'Free delivery',
    isOpen: true,
    featured: false
  },
  'Zomato': {
    logo: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=200',
    rating: 4.1,
    cashback: '5-10%',
    distance: '2.3 km',
    isOpen: true,
    featured: false
  }
};

const StoresScreen = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'offers'>('offers');

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
            const enrichment = storeEnrichments[storeName] || {
              logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200',
              rating: 4.0 + Math.random(),
              cashback: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 5) + 5}%`,
              distance: 'Online delivery',
              isOpen: true,
              featured: false
            };

            storesMap.set(storeName, {
              name: storeName,
              offerCount: 1,
              categories: categories,
              popularOffers: offer.title ? [offer.title] : [],
              ...enrichment
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
    <div className={`min-h-screen bg-gradient-to-br from-background via-muted/30 to-background ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm shadow-lg border-b sticky top-0 z-10" style={{ top: isMobile ? '0' : '80px' }}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Link to="/home" className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg">
                  <Store className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-1`}>🏪 Partner Stores</h1>
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Discover amazing deals from {stores.length} partner stores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 max-w-7xl mx-auto space-y-8'}`}>
        {/* Search and Filters */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="🔍 Search stores..."
                className="pl-12 pr-4 py-3 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>{filteredAndSortedStores.length} stores found</span>
              </div>

              <Select value={sortBy} onValueChange={(value: 'name' | 'offers') => setSortBy(value)}>
                <SelectTrigger className="w-[200px] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offers">Most Offers</SelectItem>
                  <SelectItem value="name">Store Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stores List - Horizontal Cards Line by Line */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedStores.map((store) => (
              <div
                key={store.name}
                className="bg-card rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
                onClick={() => handleStoreClick(store.name)}
              >
                {/* Horizontal Layout */}
                <div className="flex items-center gap-6">
                  {/* Store Logo */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <img 
                        src={store.logo || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200'} 
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {store.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-accent text-black border-none text-xs px-2 py-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Store Info - Takes remaining space */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                            {store.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                            <span className={`text-xs font-medium ${store.isOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                              {store.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Store Categories */}
                        {store.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {store.categories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {store.categories.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{store.categories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Store Metrics */}
                        <div className="flex items-center gap-6 text-sm">
                          {store.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-accent fill-current" />
                              <span className="font-medium">{store.rating.toFixed(1)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Store className="w-4 h-4 text-primary" />
                            <span className="font-medium">{store.offerCount} offers</span>
                          </div>
                          
                          {store.distance && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{store.distance}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Cashback & Actions */}
                      <div className="flex flex-col items-end gap-3 ml-4">
                        {store.cashback && (
                          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {store.cashback} Cashback
                          </div>
                        )}
                        
                        <div className="flex items-center text-primary group-hover:text-accent transition-colors">
                          <span className="text-sm font-medium mr-2">View Store</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Popular Offers */}
                    {store.popularOffers.length > 0 && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Popular Offers:</p>
                        <div className="flex flex-wrap gap-2">
                          {store.popularOffers.slice(0, 2).map((offer, index) => (
                            <span key={index} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              {offer.length > 50 ? `${offer.substring(0, 50)}...` : offer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedStores.length === 0 && (
          <div className="bg-card/70 backdrop-blur-sm p-12 rounded-3xl text-center shadow-sm border max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Store className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-3">No stores found</h3>
            <p className="text-muted-foreground text-lg">
              {searchTerm ? `No stores found matching "${searchTerm}" with active offers` : 'No stores with active offers available at the moment'}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stores.length}+</div>
            <div className="text-sm text-muted-foreground">Partner Stores</div>
          </div>
          <div className="bg-accent/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {stores.reduce((sum, store) => sum + store.offerCount, 0).toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground">Active Offers</div>
          </div>
          <div className="bg-orange-500/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">Up to 10%</div>
            <div className="text-sm text-muted-foreground">Cashback Rewards</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoresScreen;
