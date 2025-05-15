
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Filter } from 'lucide-react';
import { mockCategories, mockOffers } from '@/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfferCard from './OfferCard';

const CategoryScreen = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeFilter, setActiveFilter] = useState('latest');
  const [isLoading, setIsLoading] = useState(false);
  
  const category = mockCategories.find(cat => cat.id === categoryId);
  const offers = mockOffers.filter(offer => offer.category === categoryId);
  
  const loadMoreOffers = () => {
    setIsLoading(true);
    // Simulate loading more offers
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-monkeyBackground flex justify-center items-center">
        <p>Category not found</p>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Link to="/home">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">{category.name}</h1>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="p-4">
        {/* Subcategory tabs if available */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {category.subcategories.map((subcategory, index) => (
                <button
                  key={index}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    index === 0
                      ? 'bg-monkeyGreen text-white'
                      : 'bg-white text-monkeyGreen border border-monkeyGreen'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <Tabs defaultValue="latest">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="nearme">Near Me</TabsTrigger>
              <TabsTrigger value="topdeals">Top Deals</TabsTrigger>
            </TabsList>
            
            <button className="bg-white p-2 rounded-md shadow-sm">
              <Filter className="w-5 h-5 text-monkeyGreen" />
            </button>
          </div>
          
          {['latest', 'nearme', 'topdeals'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
              
              {/* Load more button */}
              <button 
                onClick={loadMoreOffers}
                className="w-full py-3 text-center text-monkeyGreen border border-monkeyGreen rounded-lg mt-4 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-monkeyGreen border-t-transparent animate-spin"></div>
                    <span>Loading more...</span>
                  </div>
                ) : (
                  <span>Load more</span>
                )}
              </button>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CategoryScreen;
