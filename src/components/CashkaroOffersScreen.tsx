
import React, { useState } from 'react';
import { Search, Clock, Copy, Star, Gift } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const CashkaroOffersScreen = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const offerTypes = ['All', 'Coupon', 'Cashback', 'Deal', 'Sale'];

  const offers = [
    {
      id: 1,
      title: 'Flat ₹500 Off on Electronics',
      store: 'Amazon',
      type: 'Coupon',
      code: 'SAVE500',
      cashback: '2.5%',
      description: 'Valid on electronics above ₹5000',
      expiry: '2 days left',
      logo: '🛒',
      color: 'bg-orange-100',
      discount: '₹500 Off'
    },
    {
      id: 2,
      title: 'Up to 70% Off Fashion Sale',
      store: 'Flipkart',
      type: 'Sale',
      code: '',
      cashback: '3%',
      description: 'No minimum purchase required',
      expiry: '5 hours left',
      logo: '🛍️',
      color: 'bg-blue-100',
      discount: '70% Off'
    },
    {
      id: 3,
      title: 'Buy 1 Get 1 Free on Clothing',
      store: 'Myntra',
      type: 'Deal',
      code: 'BOGO',
      cashback: '4%',
      description: 'On selected brands only',
      expiry: '1 day left',
      logo: '👕',
      color: 'bg-pink-100',
      discount: 'BOGO'
    },
    {
      id: 4,
      title: 'Extra 25% Off Beauty Products',
      store: 'Nykaa',
      type: 'Coupon',
      code: 'BEAUTY25',
      cashback: '6%',
      description: 'Valid on makeup and skincare',
      expiry: '3 days left',
      logo: '💄',
      color: 'bg-rose-100',
      discount: '25% Off'
    },
    {
      id: 5,
      title: 'Free Delivery on All Orders',
      store: 'Swiggy',
      type: 'Deal',
      code: 'FREEDEL',
      cashback: '8%',
      description: 'No minimum order value',
      expiry: '7 days left',
      logo: '🍔',
      color: 'bg-orange-100',
      discount: 'Free Delivery'
    },
    {
      id: 6,
      title: 'Flat ₹200 Off on First Order',
      store: 'BookMyShow',
      type: 'Coupon',
      code: 'FIRST200',
      cashback: '4%',
      description: 'For new users only',
      expiry: '10 days left',
      logo: '🎬',
      color: 'bg-red-100',
      discount: '₹200 Off'
    }
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || offer.type === selectedType;
    return matchesSearch && matchesType;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: `${code} has been copied to clipboard`,
    });
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-6`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">All Offers & Coupons</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search offers, stores, codes..."
              className="pl-12 pr-4 py-3 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {offerTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="whitespace-nowrap"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-6`}>
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center space-x-6'}`}>
                  {/* Store Logo & Info */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className={`w-16 h-16 ${offer.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-3xl">{offer.logo}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{offer.title}</h3>
                      <p className="text-gray-600 text-sm">{offer.store}</p>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="destructive">{offer.type}</Badge>
                      <Badge className="bg-green-100 text-green-700">{offer.cashback} Cashback</Badge>
                      <Badge variant="outline">{offer.discount}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                    <div className="flex items-center text-orange-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {offer.expiry}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex ${isMobile ? 'justify-between' : 'flex-col'} space-x-2`}>
                    {offer.code && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(offer.code)}
                        className="flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{offer.code}</span>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashkaroOffersScreen;
