
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';
import BannerCarousel from './BannerCarousel';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const HomeScreen = () => {
  const { 
    filteredOffers, 
    categories, 
    isLoading, 
    error, 
    isUsingMockData, 
    refetchOffers,
    syncFromLinkMyDeals,
    dailyApiLimitInfo
  } = useData();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual sync from LinkMyDeals API
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const success = await syncFromLinkMyDeals();
      if (success) {
        // After successful sync, refresh the offers
        await refetchOffers();
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle refresh from existing data
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchOffers();
      toast({
        title: "Data refreshed",
        description: "Local data has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('Home Screen Rendered');
  console.log('Offers loaded:', filteredOffers.length);
  console.log('Categories loaded:', categories.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Using mock data:', isUsingMockData);
  console.log('Daily API Limit Info:', dailyApiLimitInfo);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header with sync controls */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">MonkeyDeals</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleSyncData}
              disabled={isSyncing}
              size="sm"
            >
              <Download className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Import Data'}
            </Button>
          </div>
        </div>

        {/* API Limit Info */}
        {dailyApiLimitInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700">
                Daily API Usage: {dailyApiLimitInfo.used}/25
              </span>
              <span className="text-blue-600">
                Remaining: {dailyApiLimitInfo.remaining}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(dailyApiLimitInfo.used / 25) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Resets on: {new Date(dailyApiLimitInfo.resetDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Data source indicator */}
        {isUsingMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Currently showing sample data. Use "Import Data" to fetch real offers from LinkMyDeals API.
            </p>
          </div>
        )}
      </div>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Categories Section */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Featured Offers */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Featured Offers ({filteredOffers.length})
        </h2>
        {filteredOffers.length > 0 ? (
          <div className="space-y-4">
            {filteredOffers.slice(0, 10).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No offers available at the moment.</p>
            <Button 
              onClick={handleSyncData} 
              className="mt-4"
              disabled={isSyncing}
            >
              <Download className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Import Latest Offers
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              Error loading data: {error.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
