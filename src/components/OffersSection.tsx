
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfferCard from './OfferCard';
import CuelinkOfferCard from './CuelinkOfferCard';
import CuelinkPagination from './CuelinkPagination';
import { Offer, CuelinkOffer } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface OffersSectionProps {
  isDataLoading: boolean;
  isLoading: boolean;
  error: any;
  displayedOffers: Offer[];
  amazonOffers: Offer[];
  displayedCuelinkOffers: CuelinkOffer[];
  paginatedCuelinkOffers: CuelinkOffer[];
  isCuelinkLoading: boolean;
  cuelinkCurrentPage: number;
  totalCuelinkPages: number;
  cuelinkOffers: CuelinkOffer[];
  debouncedSearchTerm: string;
  offers: Offer[];
  onLoadMore: () => void;
  onRefetchOffers: () => void;
  onCuelinkPageChange: (page: number) => void;
}

const OffersSection = ({
  isDataLoading,
  isLoading,
  error,
  displayedOffers,
  amazonOffers,
  displayedCuelinkOffers,
  paginatedCuelinkOffers,
  isCuelinkLoading,
  cuelinkCurrentPage,
  totalCuelinkPages,
  cuelinkOffers,
  debouncedSearchTerm,
  offers,
  onLoadMore,
  onRefetchOffers,
  onCuelinkPageChange
}: OffersSectionProps) => {
  const isMobile = useIsMobile();
  const cuelinkItemsPerPage = 12;

  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <p className="text-red-600">Error loading offers: {error.message}</p>
    </div>
  );

  const renderEmptyState = (message: string, subMessage: string, showActions: boolean = true) => (
    <div className="bg-white p-6 rounded-lg text-center shadow-sm">
      <p className="text-gray-500">{message}</p>
      <p className="text-sm text-gray-400 mt-2">{subMessage}</p>
      {showActions && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={onRefetchOffers}
            className="bg-spring-green-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Refresh Data
          </button>
          {offers.length > 0 && (
            <Link 
              to="/preferences/brands" 
              className="border border-spring-green-600 text-spring-green-600 px-4 py-2 rounded-lg text-center"
            >
              Adjust Preferences
            </Link>
          )}
        </div>
      )}
    </div>
  );

  const renderOfferGrid = (offersToRender: Offer[]) => (
    <div className={`grid gap-4 ${
      isMobile 
        ? 'grid-cols-2' 
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    }`}>
      {offersToRender.map((offer) => (
        <Link key={offer.id} to={`/offer/${offer.id}`}>
          <OfferCard offer={offer} isMobile={isMobile} />
        </Link>
      ))}
    </div>
  );

  const renderLoadMoreButton = (buttonText: string = "Load more") => (
    <button 
      onClick={onLoadMore}
      className="w-full py-3 text-center text-spring-green-600 border border-spring-green-600 rounded-lg mt-4 flex items-center justify-center"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-spring-green-600 border-t-transparent animate-spin"></div>
          <span>Loading more...</span>
        </div>
      ) : (
        <span>{buttonText}</span>
      )}
    </button>
  );

  return (
    <div>
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Today's Offers</h2>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="flash">Flash Deals</TabsTrigger>
            <TabsTrigger value="amazon">Amazon</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4 mt-2">
          {isDataLoading || isLoading ? (
            renderLoadingState()
          ) : (
            <>
              {error && renderErrorState()}
              
              {!error && displayedOffers.length > 0 ? (
                renderOfferGrid(displayedOffers)
              ) : (
                !error && renderEmptyState(
                  "No offers found",
                  offers.length === 0 
                    ? "No offers available in the Offers_data table" 
                    : "Try a different search term or check back later"
                )
              )}
            </>
          )}
          
          {!isDataLoading && !error && displayedOffers.length > 0 && renderLoadMoreButton()}
        </TabsContent>
        
        <TabsContent value="nearby" className="space-y-4">
          {renderOfferGrid(displayedOffers.filter(offer => !offer.isAmazon))}
          
          {displayedOffers.filter(offer => !offer.isAmazon).length === 0 && (
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <p className="text-gray-500">No nearby offers found</p>
              {offers.length > 0 && (
                <Link 
                  to="/preferences/stores" 
                  className="mt-4 text-spring-green-600 block underline"
                >
                  Adjust store preferences
                </Link>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="flash" className="space-y-4">
          {isCuelinkLoading ? (
            renderLoadingState()
          ) : (
            <>
              {paginatedCuelinkOffers.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {((cuelinkCurrentPage - 1) * cuelinkItemsPerPage) + 1}-{Math.min(cuelinkCurrentPage * cuelinkItemsPerPage, displayedCuelinkOffers.length)} of {displayedCuelinkOffers.length} flash deals
                  </div>
                  <div className={`grid gap-4 ${
                    isMobile 
                      ? 'grid-cols-1 sm:grid-cols-2' 
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}>
                    {paginatedCuelinkOffers.map((offer) => (
                      <CuelinkOfferCard key={offer.Id} offer={offer} />
                    ))}
                  </div>
                  <CuelinkPagination 
                    currentPage={cuelinkCurrentPage}
                    totalPages={totalCuelinkPages}
                    onPageChange={onCuelinkPageChange}
                  />
                </>
              ) : (
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <p className="text-gray-500">No flash deals found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {cuelinkOffers.length === 0 
                      ? "No flash deals available in the Cuelink_data table" 
                      : "Try a different search term or check back later"
                    }
                  </p>
                  <div className="mt-4">
                    <p className="text-xs text-gray-400">
                      Total Cuelink offers loaded: {cuelinkOffers.length}
                    </p>
                    {debouncedSearchTerm && (
                      <p className="text-xs text-gray-400">
                        Search term: "{debouncedSearchTerm}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="amazon" className="space-y-4">
          {isDataLoading || isLoading ? (
            renderLoadingState()
          ) : (
            <>
              {error && renderErrorState()}
              
              {!error && amazonOffers.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {amazonOffers.length} Amazon offers
                  </div>
                  {renderOfferGrid(amazonOffers)}
                </>
              ) : (
                !error && renderEmptyState(
                  "No Amazon offers found",
                  offers.length === 0 
                    ? "No offers available in the database" 
                    : debouncedSearchTerm 
                      ? `No Amazon offers match "${debouncedSearchTerm}"`
                      : "Check back later for Amazon deals",
                  true
                )
              )}
            </>
          )}
          
          {!isDataLoading && !error && amazonOffers.length > 0 && renderLoadMoreButton("Load more Amazon offers")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersSection;
