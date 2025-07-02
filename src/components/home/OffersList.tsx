import React from 'react';
import { Link } from 'react-router-dom';
import { Offer } from '@/types';
import OfferCard from '@/components/OfferCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface OffersListProps {
  offers: Offer[];
  isLoading: boolean;
  error: Error | null;
  onLoadMore: () => void;
  showLoadMore?: boolean;
  emptyStateConfig?: {
    title: string;
    description: string;
    showRefresh?: boolean;
    showPreferences?: boolean;
    preferencesLink?: string;
  };
}

const OffersList = ({ 
  offers, 
  isLoading, 
  error, 
  onLoadMore, 
  showLoadMore = true,
  emptyStateConfig 
}: OffersListProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading amazing deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-600">Error loading offers: {error.message}</p>
      </div>
    );
  }

  if (offers.length === 0 && emptyStateConfig) {
    return (
      <div className="bg-gradient-to-br from-white to-indigo-50/30 p-8 rounded-2xl text-center shadow-lg border border-indigo-100">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-gray-700 font-semibold text-lg mb-2">{emptyStateConfig.title}</p>
        <p className="text-sm text-gray-500 mb-6">{emptyStateConfig.description}</p>
        <div className="flex flex-col gap-3">
          {emptyStateConfig.showRefresh && (
            <button
              onClick={onLoadMore}
              className="bg-gradient-to-r from-spring-green-500 to-emerald-600 hover:from-spring-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Refresh Data
            </button>
          )}
          
          {emptyStateConfig.showPreferences && emptyStateConfig.preferencesLink && (
            <Link 
              to={emptyStateConfig.preferencesLink} 
              className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl text-center font-semibold transition-all duration-200 transform hover:scale-105"
            >
              ⚙️ Adjust Preferences
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {offers.length > 0 && (
        <div className={`grid gap-4 auto-rows-max ${
          isMobile 
            ? 'grid-cols-2' 
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}>
          {offers.map((offer) => (
            <Link key={offer.id} to={`/offer/${offer.id}`}>
              <OfferCard offer={offer} isMobile={isMobile} />
            </Link>
          ))}
        </div>
      )}
      
      {showLoadMore && offers.length > 0 && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onLoadMore}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center gap-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading more amazing deals...</span>
              </>
            ) : (
              <>
                <span>✨ Load more deals</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default OffersList;