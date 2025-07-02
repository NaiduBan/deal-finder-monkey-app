import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfferMasonryGrid } from './OfferMasonryGrid';
import { OfferListView } from './OfferListView';
import { FeaturedDealsCarousel } from './FeaturedDealsCarousel';
import OfferCard from '@/components/OfferCard';
import CuelinkOfferCard from '@/components/CuelinkOfferCard';
import CuelinkPagination from '@/components/CuelinkPagination';
import { Button } from '@/components/ui/button';

interface MainContentAreaProps {
  layoutMode: 'grid' | 'masonry' | 'list';
  homeScreenData: any;
  showRightPanel: boolean;
}

export const MainContentArea = ({ 
  layoutMode, 
  homeScreenData, 
  showRightPanel 
}: MainContentAreaProps) => {
  const {
    localFilteredOffers,
    displayedOffers,
    amazonOffers,
    cuelinkOffers,
    paginatedCuelinkOffers,
    totalCuelinkPages,
    cuelinkCurrentPage,
    handleCuelinkPageChange,
    isDataLoading,
    isLoading,
    error,
    loadMoreOffers,
    isCuelinkLoading,
    selectedCategory,
    debouncedSearchTerm
  } = homeScreenData;

  // Use the already filtered offers from homeScreenData
  const filteredDisplayedOffers = displayedOffers || [];

  const contentWidth = showRightPanel ? 'flex-1' : 'w-full';

  const renderOffers = (offers: any[]) => {
    if (layoutMode === 'masonry') {
      return <OfferMasonryGrid offers={offers} />;
    } else if (layoutMode === 'list') {
      return <OfferListView offers={offers} />;
    } else {
      return (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {offers.map((offer) => (
            <Link key={offer.id} to={`/offer/${offer.id}`} className="group">
              <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <OfferCard offer={offer} isMobile={false} />
              </div>
            </Link>
          ))}
        </div>
      );
    }
  };

  return (
    <main className={`${contentWidth} min-h-screen overflow-hidden`}>
      <div className="p-6 space-y-8">
        {/* Featured Deals Carousel */}
        <FeaturedDealsCarousel offers={filteredDisplayedOffers.slice(0, 10)} />

        {/* Main Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">🔥 Today's Hottest Deals</h2>
            <TabsList className="grid w-full max-w-lg grid-cols-4 bg-muted p-1 rounded-xl">
              <TabsTrigger value="all" className="text-sm font-medium">All Deals</TabsTrigger>
              <TabsTrigger value="nearby" className="text-sm font-medium">Nearby</TabsTrigger>
              <TabsTrigger value="flash" className="text-sm font-medium">Flash</TabsTrigger>
              <TabsTrigger value="amazon" className="text-sm font-medium">Amazon</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-6">
            {isDataLoading || isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20">
                    <p className="text-destructive">Error loading offers: {error.message}</p>
                  </div>
                )}
                
                {!error && filteredDisplayedOffers.length > 0 ? (
                  <>
                    {renderOffers(filteredDisplayedOffers)}
                    <div className="flex justify-center pt-8">
                      <Button 
                        onClick={loadMoreOffers}
                        variant="outline"
                        size="lg"
                        disabled={isLoading}
                        className="px-8"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                            <span>Loading more...</span>
                          </div>
                        ) : (
                          <span>Load More Deals</span>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-card p-12 rounded-xl text-center shadow-sm border">
                    <p className="text-muted-foreground text-lg">No deals found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            {renderOffers(filteredDisplayedOffers.filter(offer => !offer.isAmazon))}
          </TabsContent>

          <TabsContent value="flash" className="space-y-6">
            {isCuelinkLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {paginatedCuelinkOffers.length > 0 ? (
                  <>
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {paginatedCuelinkOffers.map((offer) => (
                        <div key={offer.Id} className="transform transition-all duration-300 hover:scale-105">
                          <CuelinkOfferCard offer={offer} />
                        </div>
                      ))}
                    </div>
                    <CuelinkPagination 
                      currentPage={cuelinkCurrentPage}
                      totalPages={totalCuelinkPages}
                      onPageChange={handleCuelinkPageChange}
                    />
                  </>
                ) : (
                  <div className="bg-card p-12 rounded-xl text-center shadow-sm border">
                    <p className="text-muted-foreground text-lg">No flash deals found</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="amazon" className="space-y-6">
            {renderOffers(amazonOffers)}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};