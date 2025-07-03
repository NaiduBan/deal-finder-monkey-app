import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Offer, CuelinkOffer } from '@/types';
import OffersList from './OffersList';
import CuelinkOffersList from './CuelinkOffersList';
import { useIsMobile } from '@/hooks/use-mobile';

interface OffersTabsSectionProps {
  // All offers data
  displayedOffers: Offer[];
  amazonOffers: Offer[];
  nearbyOffers: Offer[];
  sponsoredOffers: Offer[];
  bannerOffers: Offer[];
  
  // Cuelink data
  paginatedCuelinkOffers: CuelinkOffer[];
  cuelinkCurrentPage: number;
  totalCuelinkPages: number;
  displayedCuelinkOffers: CuelinkOffer[];
  cuelinkItemsPerPage: number;
  isCuelinkLoading: boolean;
  onCuelinkPageChange: (page: number) => void;
  
  // Loading states
  isDataLoading: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Handlers
  loadMoreOffers: () => void;
  
  // Search and filters
  debouncedSearchTerm: string;
  offers: Offer[];
  cuelinkOffers: CuelinkOffer[];
}

const OffersTabsSection = ({
  displayedOffers,
  amazonOffers,
  nearbyOffers,
  sponsoredOffers,
  bannerOffers,
  paginatedCuelinkOffers,
  cuelinkCurrentPage,
  totalCuelinkPages,
  displayedCuelinkOffers,
  cuelinkItemsPerPage,
  isCuelinkLoading,
  onCuelinkPageChange,
  isDataLoading,
  isLoading,
  error,
  loadMoreOffers,
  debouncedSearchTerm,
  offers,
  cuelinkOffers
}: OffersTabsSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
      
      <Tabs defaultValue="all" className="space-y-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-b from-spring-green-500 to-emerald-600 rounded-full"></div>
            <h2 className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
              🔥 Today's Hottest Deals
            </h2>
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-yellow-700">Live Updates</span>
            </div>
          </div>
          <TabsList className="grid w-full max-w-2xl grid-cols-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-1.5 rounded-2xl border border-indigo-200/50 shadow-inner">
            <TabsTrigger value="all" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">All Deals</TabsTrigger>
            <TabsTrigger value="nearby" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-spring-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Nearby</TabsTrigger>
            <TabsTrigger value="flash" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Flash</TabsTrigger>
            <TabsTrigger value="amazon" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Amazon</TabsTrigger>
            <TabsTrigger value="sponsors" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Sponsors</TabsTrigger>
            <TabsTrigger value="banners" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Banners</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4 mt-2">
          <OffersList 
            offers={displayedOffers}
            isLoading={isDataLoading || isLoading}
            error={error}
            onLoadMore={loadMoreOffers}
            emptyStateConfig={{
              title: "No offers found",
              description: offers.length === 0 
                ? "No offers available in the Offers_data table" 
                : "Try a different search term or check back later",
              showRefresh: true,
              showPreferences: offers.length > 0,
              preferencesLink: "/preferences/brands"
            }}
          />
        </TabsContent>
        
        <TabsContent value="nearby" className="space-y-4">
          <OffersList 
            offers={nearbyOffers}
            isLoading={false}
            error={null}
            onLoadMore={() => {}}
            showLoadMore={false}
            emptyStateConfig={{
              title: "No nearby offers found",
              description: "Check back later for local deals",
              showPreferences: offers.length > 0,
              preferencesLink: "/preferences/stores"
            }}
          />
        </TabsContent>
        
        <TabsContent value="flash" className="space-y-4">
          <CuelinkOffersList 
            offers={paginatedCuelinkOffers}
            isLoading={isCuelinkLoading}
            currentPage={cuelinkCurrentPage}
            totalPages={totalCuelinkPages}
            onPageChange={onCuelinkPageChange}
            totalOffers={displayedCuelinkOffers.length}
            itemsPerPage={cuelinkItemsPerPage}
            searchTerm={debouncedSearchTerm}
          />
        </TabsContent>
        
        <TabsContent value="amazon" className="space-y-4">
          <OffersList 
            offers={amazonOffers}
            isLoading={isDataLoading || isLoading}
            error={error}
            onLoadMore={loadMoreOffers}
            emptyStateConfig={{
              title: "No Amazon offers found",
              description: offers.length === 0 
                ? "No offers available in the database" 
                : debouncedSearchTerm 
                  ? `No Amazon offers match "${debouncedSearchTerm}"`
                  : "Check back later for Amazon deals",
              showRefresh: true,
              showPreferences: offers.length > 0,
              preferencesLink: "/preferences/stores"
            }}
          />
        </TabsContent>
        
        <TabsContent value="sponsors" className="space-y-4">
          <OffersList 
            offers={sponsoredOffers}
            isLoading={isDataLoading || isLoading}
            error={error}
            onLoadMore={loadMoreOffers}
            emptyStateConfig={{
              title: "No sponsored offers found",
              description: offers.length === 0 
                ? "No sponsored offers available" 
                : debouncedSearchTerm 
                  ? `No sponsored offers match "${debouncedSearchTerm}"`
                  : "Check back later for sponsored deals",
              showRefresh: true,
              showPreferences: offers.length > 0,
              preferencesLink: "/preferences/brands"
            }}
          />
        </TabsContent>
        
        <TabsContent value="banners" className="space-y-4">
          <OffersList 
            offers={bannerOffers}
            isLoading={isDataLoading || isLoading}
            error={error}
            onLoadMore={loadMoreOffers}
            emptyStateConfig={{
              title: "No banner offers found",
              description: offers.length === 0 
                ? "No banner offers available" 
                : debouncedSearchTerm 
                  ? `No banner offers match "${debouncedSearchTerm}"`
                  : "Check back later for banner deals",
              showRefresh: true,
              showPreferences: offers.length > 0,
              preferencesLink: "/preferences/brands"
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersTabsSection;