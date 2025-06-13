
import React, { useState } from 'react';
import { Search, Star, Gift, Percent } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const CashkaroStoresScreen = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fashion', 'Electronics', 'Beauty', 'Food', 'Travel', 'Books'];

  const stores = [
    { 
      name: 'Amazon', 
      logo: '🛒', 
      cashback: '2.5%', 
      rating: 4.5, 
      category: 'Electronics',
      color: 'bg-orange-100',
      description: 'Everything store with millions of products',
      offers: 450
    },
    { 
      name: 'Flipkart', 
      logo: '🛍️', 
      cashback: '3%', 
      rating: 4.3, 
      category: 'Electronics',
      color: 'bg-blue-100',
      description: 'India\'s leading e-commerce platform',
      offers: 320
    },
    { 
      name: 'Myntra', 
      logo: '👕', 
      cashback: '4%', 
      rating: 4.4, 
      category: 'Fashion',
      color: 'bg-pink-100',
      description: 'Fashion and lifestyle destination',
      offers: 280
    },
    { 
      name: 'Ajio', 
      logo: '👗', 
      cashback: '5%', 
      rating: 4.2, 
      category: 'Fashion',
      color: 'bg-purple-100',
      description: 'Trendy fashion for every occasion',
      offers: 190
    },
    { 
      name: 'Nykaa', 
      logo: '💄', 
      cashback: '6%', 
      rating: 4.6, 
      category: 'Beauty',
      color: 'bg-rose-100',
      description: 'Beauty and wellness products',
      offers: 150
    },
    { 
      name: 'Swiggy', 
      logo: '🍔', 
      cashback: '8%', 
      rating: 4.1, 
      category: 'Food',
      color: 'bg-orange-100',
      description: 'Food delivery and dining',
      offers: 120
    },
    { 
      name: 'BookMyShow', 
      logo: '🎬', 
      cashback: '4%', 
      rating: 4.0, 
      category: 'Entertainment',
      color: 'bg-red-100',
      description: 'Movie tickets and events',
      offers: 85
    },
    { 
      name: 'MakeMyTrip', 
      logo: '✈️', 
      cashback: '3.5%', 
      rating: 4.2, 
      category: 'Travel',
      color: 'bg-green-100',
      description: 'Travel bookings and holidays',
      offers: 200
    }
  ];

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`bg-gray-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-6`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">All Stores</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search stores..."
              className="pl-12 pr-4 py-3 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-6`}>
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {filteredStores.map((store, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 ${store.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-3xl">{store.logo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">{store.cashback}</div>
                        <div className="text-xs text-gray-500">Cashback</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{store.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{store.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {store.offers} offers
                        </Badge>
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashkaroStoresScreen;
