
import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Bookmark, Share2 } from 'lucide-react';
import { getTrendingDeals } from '@/services/analyticsService';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import OfferCard from './OfferCard';

const TrendingDeals = () => {
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { offers } = useData();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await getTrendingDeals();
        setTrendingData(trending);
      } catch (error) {
        console.error('Error fetching trending deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-monkeyGreen mr-2" />
          <h2 className="text-lg font-semibold">Trending Deals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="bg-gray-200 aspect-square rounded mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get trending offers based on popularity data
  const trendingOffers = trendingData
    .map(trend => offers.find(offer => offer.id === trend.offer_id))
    .filter(Boolean)
    .slice(0, 6);

  if (trendingOffers.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-monkeyGreen mr-2" />
          <h2 className="text-lg font-semibold">Trending Deals</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No trending deals available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-monkeyGreen mr-2" />
          <h2 className="text-lg font-semibold">Trending Deals</h2>
        </div>
        <Link to="/trending" className="text-monkeyGreen text-sm font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingOffers.map((offer, index) => {
          const trendData = trendingData.find(t => t.offer_id === offer.id);
          return (
            <Link key={offer.id} to={`/offer/${offer.id}`} className="block">
              <div className="relative">
                <OfferCard offer={offer} />
                
                {/* Trending Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  #{index + 1}
                </div>

                {/* Stats */}
                {trendData && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 flex items-center space-x-2">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {trendData.view_count || 0}
                    </div>
                    <div className="flex items-center">
                      <Bookmark className="w-3 h-3 mr-1" />
                      {trendData.save_count || 0}
                    </div>
                    <div className="flex items-center">
                      <Share2 className="w-3 h-3 mr-1" />
                      {trendData.share_count || 0}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingDeals;
