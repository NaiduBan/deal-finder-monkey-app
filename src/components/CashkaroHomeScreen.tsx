
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gift, Percent, Star, TrendingUp, Clock, Tag, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useData } from '@/contexts/DataContext';

const CashkaroHomeScreen = () => {
  const isMobile = useIsMobile();
  const { offers, categories } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const topStores = [
    { name: 'Amazon', cashback: '2.5%', logo: '🛒', color: 'bg-orange-100' },
    { name: 'Flipkart', cashback: '3%', logo: '🛍️', color: 'bg-blue-100' },
    { name: 'Myntra', cashback: '4%', logo: '👕', logo: '🛍️', color: 'bg-pink-100' },
    { name: 'Ajio', cashback: '5%', logo: '👗', color: 'bg-purple-100' },
    { name: 'Nykaa', cashback: '6%', logo: '💄', color: 'bg-rose-100' },
    { name: 'Swiggy', cashback: '8%', logo: '🍔', color: 'bg-orange-100' },
  ];

  const hotDeals = [
    { title: 'Flat ₹500 Off', store: 'Amazon', category: 'Electronics', cashback: '2.5%', expires: '2 days left' },
    { title: 'Up to 70% Off', store: 'Flipkart', category: 'Fashion', cashback: '3%', expires: '5 hours left' },
    { title: 'Buy 1 Get 1', store: 'Myntra', category: 'Clothing', cashback: '4%', expires: '1 day left' },
    { title: 'Extra 25% Off', store: 'Nykaa', category: 'Beauty', cashback: '6%', expires: '3 days left' },
  ];

  const categories_data = [
    { name: 'Fashion', icon: '👕', deals: '2000+', color: 'bg-pink-50 text-pink-600' },
    { name: 'Electronics', icon: '📱', deals: '1500+', color: 'bg-blue-50 text-blue-600' },
    { name: 'Beauty', icon: '💄', deals: '800+', color: 'bg-purple-50 text-purple-600' },
    { name: 'Food', icon: '🍔', deals: '1200+', color: 'bg-orange-50 text-orange-600' },
    { name: 'Travel', icon: '✈️', deals: '500+', color: 'bg-green-50 text-green-600' },
    { name: 'Books', icon: '📚', deals: '300+', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className={`bg-gray-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header Banner - CashKaro Style */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <div className={`${isMobile ? 'p-4' : 'max-w-7xl mx-auto px-6 py-6'}`}>
          <div className="text-center space-y-2">
            <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}>
              💰 Earn Cashback on Every Purchase
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} opacity-90`}>
              Shop from 1000+ stores and get up to 20% cashback
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`bg-white shadow-sm ${isMobile ? 'p-4' : 'py-4'}`}>
        <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search stores, offers, coupons..."
              className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6 py-8' : 'p-4'} space-y-8`}>
        {/* Stats Banner */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">₹10,000+</div>
              <div className="text-sm text-gray-600">Cashback Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">1000+</div>
              <div className="text-sm text-gray-600">Partner Stores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">5L+</div>
              <div className="text-sm text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">20%</div>
              <div className="text-sm text-gray-600">Max Cashback</div>
            </div>
          </div>
        </div>

        {/* Top Stores */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🏪 Top Stores</h2>
            <Link to="/stores" className="text-red-500 text-sm font-medium">View All</Link>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-6'}`}>
            {topStores.map((store, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${store.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{store.logo}</span>
                  </div>
                  <h3 className="font-semibold text-sm">{store.name}</h3>
                  <div className="text-green-600 font-bold text-xs">
                    Up to {store.cashback}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hot Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🔥 Hot Deals</h2>
            <Link to="/deals" className="text-red-500 text-sm font-medium">View All</Link>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {hotDeals.map((deal, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="destructive" className="text-xs">HOT</Badge>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-sm">{deal.cashback}</div>
                      <div className="text-xs text-gray-500">Cashback</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{deal.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{deal.store} • {deal.category}</p>
                  <div className="flex items-center text-orange-500 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {deal.expires}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🗂️ Shop by Category</h2>
            <Link to="/categories" className="text-red-500 text-sm font-medium">View All</Link>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-6'}`}>
            {categories_data.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${category.color.split(' ')[0]} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className={`font-semibold text-sm ${category.color.split(' ')[1]}`}>{category.name}</h3>
                  <div className="text-gray-500 text-xs">{category.deals} deals</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Offers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">⭐ Featured Offers</h2>
            <Link to="/offers" className="text-red-500 text-sm font-medium">View All</Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-lg">Amazon Prime Day</h3>
                <p className="text-gray-600 text-sm mb-2">Up to 70% off on electronics</p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">2.5% Cashback</Badge>
                  <Badge variant="outline">Limited Time</Badge>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-lg">Flipkart Big Sale</h3>
                <p className="text-gray-600 text-sm mb-2">Fashion & lifestyle deals</p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">3% Cashback</Badge>
                  <Badge variant="outline">Trending</Badge>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-lg">Myntra EORS</h3>
                <p className="text-gray-600 text-sm mb-2">End of reason sale</p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">4% Cashback</Badge>
                  <Badge variant="outline">Popular</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">How CashKaro Works</h2>
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold mb-2">Shop</h3>
              <p className="text-sm text-gray-600">Choose from 1000+ stores and click to shop</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Earn</h3>
              <p className="text-sm text-gray-600">Get cashback credited to your account</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="font-semibold mb-2">Withdraw</h3>
              <p className="text-sm text-gray-600">Transfer to bank or Paytm wallet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashkaroHomeScreen;
