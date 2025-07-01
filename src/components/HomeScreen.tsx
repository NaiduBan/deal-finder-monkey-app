import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { useHomeScreen } from '@/hooks/useHomeScreen';
import HomeHeader from './home/HomeHeader';
import QuickStatsSection from './home/QuickStatsSection';
import SmartFeaturesSection from './home/SmartFeaturesSection';
import SearchAndFilters from './home/SearchAndFilters';
import OfferCard from './OfferCard';
import CuelinkOfferCard from './CuelinkOfferCard';
import CuelinkPagination from './CuelinkPagination';
import PWAInstallPrompt from './PWAInstallPrompt';

const HomeScreen = () => {
  const isMobile = useIsMobile();
  const {
    // State
    searchQuery,
    userPreferences,
    selectedCategory,
    debouncedSearchTerm,
    dynamicCategories,
    hasLoadedPreferences,
    localFilteredOffers,
    cuelinkOffers,
    isCuelinkLoading,
    cuelinkCurrentPage,
    isLoading,
    // Data from context
    offers,
    isDataLoading,
    error,
    isUsingMockData,
    // Handlers
    handleSearch,
    handleCategoryClick,
    handleClearFilters,
    loadMoreOffers,
    handleCuelinkPageChange,
    // Constants
    cuelinkItemsPerPage
  } = useHomeScreen();

  useEffect(() => {
    console.log("Home Screen Rendered");
    console.log("Offers loaded:", offers ? offers.length : 0);
    console.log("Filtered offers loaded:", localFilteredOffers ? localFilteredOffers.length : 0);
    console.log("Categories loaded:", dynamicCategories ? dynamicCategories.length : 0);
    console.log("Is loading:", isDataLoading);
    console.log("Error:", error);
    console.log("Using mock data:", isUsingMockData);
    console.log("User preferences:", userPreferences);
    console.log("Selected category:", selectedCategory);
    console.log("Has loaded preferences:", hasLoadedPreferences);
  }, [offers, localFilteredOffers, dynamicCategories, isDataLoading, error, isUsingMockData, userPreferences, selectedCategory, hasLoadedPreferences]);

  // Enhanced search functionality with category filtering on top of already filtered offers
  const displayedOffers = localFilteredOffers.filter(offer => {
    if (selectedCategory && offer.category) {
      const categoryMatch = offer.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                           selectedCategory.toLowerCase().includes(offer.category.toLowerCase());
      if (!categoryMatch) return false;
    }
    
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.title && offer.title.toLowerCase().includes(searchTermLower)) ||
        (offer.store && offer.store.toLowerCase().includes(searchTermLower)) ||
        (offer.description && offer.description.toLowerCase().includes(searchTermLower)) ||
        (offer.category && offer.category.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Filter Amazon offers specifically
  const amazonOffers = localFilteredOffers.filter(offer => {
    // Check if the offer is from Amazon by looking at the store name
    const isAmazonOffer = offer.store && offer.store.toLowerCase().includes('amazon');
    
    if (!isAmazonOffer) return false;
    
    // Apply search filter if present
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.title && offer.title.toLowerCase().includes(searchTermLower)) ||
        (offer.store && offer.store.toLowerCase().includes(searchTermLower)) ||
        (offer.description && offer.description.toLowerCase().includes(searchTermLower)) ||
        (offer.category && offer.category.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Filter Cuelink offers for Flash Deals tab
  const displayedCuelinkOffers = cuelinkOffers.filter(offer => {
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (offer.Title && offer.Title.toLowerCase().includes(searchTermLower)) ||
        (offer.Merchant && offer.Merchant.toLowerCase().includes(searchTermLower)) ||
        (offer.Description && offer.Description.toLowerCase().includes(searchTermLower)) ||
        (offer.Categories && offer.Categories.toLowerCase().includes(searchTermLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Pagination calculations for Cuelink offers
  const totalCuelinkPages = Math.ceil(displayedCuelinkOffers.length / cuelinkItemsPerPage);
  const paginatedCuelinkOffers = displayedCuelinkOffers.slice(
    (cuelinkCurrentPage - 1) * cuelinkItemsPerPage,
    cuelinkCurrentPage * cuelinkItemsPerPage
  );

  return (
    <div className={`bg-gradient-to-br from-spring-green-50 via-white to-spring-green-100 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      <HomeHeader 
        offersCount={offers.length} 
        cuelinkOffersCount={cuelinkOffers.length} 
      />
      
      {/* Main content */}
      <div className={`space-y-6 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* PWA Install Prompt - Added without disturbing layout */}
          <div className="mb-4">
            <PWAInstallPrompt />
          </div>
          
          <QuickStatsSection 
            displayedOffersCount={displayedOffers.length}
            cuelinkOffersCount={cuelinkOffers.length}
            categoriesCount={dynamicCategories.length}
          />
          
          <SmartFeaturesSection />
          
          <SearchAndFilters 
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            isUsingMockData={isUsingMockData}
            hasLoadedPreferences={hasLoadedPreferences}
            userPreferences={userPreferences}
            dynamicCategories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategoryClick}
            isDataLoading={isDataLoading}
            debouncedSearchTerm={debouncedSearchTerm}
            onClearFilters={handleClearFilters}
          />
          
          {/* Enhanced Offers section with better tabs */}
          <div>
            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl text-gray-900">🔥 Today's Hottest Deals</h2>
                <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="all" className="text-sm font-medium">All Deals</TabsTrigger>
                  <TabsTrigger value="nearby" className="text-sm font-medium">Nearby</TabsTrigger>
                  <TabsTrigger value="flash" className="text-sm font-medium">Flash</TabsTrigger>
                  <TabsTrigger value="amazon" className="text-sm font-medium">Amazon</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-2">
                {isDataLoading || isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-600">Error loading offers: {error.message}</p>
                      </div>
                    )}
                    
                    {!error && displayedOffers.length > 0 ? (
                      <div className={`grid gap-4 ${
                        isMobile 
                          ? 'grid-cols-2' 
                          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                      }`}>
                        {displayedOffers.map((offer) => (
                          <Link key={offer.id} to={`/offer/${offer.id}`}>
                            <OfferCard offer={offer} isMobile={isMobile} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !error && (
                        <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                          <p className="text-gray-500">No offers found</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {offers.length === 0 
                              ? "No offers available in the Offers_data table" 
                              : "Try a different search term or check back later"
                            }
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            <button
                              onClick={loadMoreOffers}
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
                        </div>
                      )
                    )}
                  </>
                )}
                
                {!isDataLoading && !error && displayedOffers.length > 0 && (
                  <button 
                    onClick={loadMoreOffers}
                    className="w-full py-3 text-center text-spring-green-600 border border-spring-green-600 rounded-lg mt-4 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-spring-green-600 border-t-transparent animate-spin"></div>
                        <span>Loading more...</span>
                      </div>
                    ) : (
                      <span>Load more</span>
                    )}
                  </button>
                )}
              </TabsContent>
              
              <TabsContent value="nearby" className="space-y-4">
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                  {displayedOffers.filter(offer => !offer.isAmazon).map((offer) => (
                    <Link key={offer.id} to={`/offer/${offer.id}`}>
                      <OfferCard offer={offer} isMobile={isMobile} />
                    </Link>
                  ))}
                </div>
                
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
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
                  </div>
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
                          onPageChange={handleCuelinkPageChange}
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
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-600">Error loading offers: {error.message}</p>
                      </div>
                    )}
                    
                    {!error && amazonOffers.length > 0 ? (
                      <>
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {amazonOffers.length} Amazon offers
                        </div>
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-2' 
                            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                        }`}>
                          {amazonOffers.map((offer) => (
                            <Link key={offer.id} to={`/offer/${offer.id}`}>
                              <OfferCard offer={offer} isMobile={isMobile} />
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      !error && (
                        <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                          <p className="text-gray-500">No Amazon offers found</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {offers.length === 0 
                              ? "No offers available in the database" 
                              : debouncedSearchTerm 
                                ? `No Amazon offers match "${debouncedSearchTerm}"`
                                : "Check back later for Amazon deals"
                            }
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            <button
                              onClick={loadMoreOffers}
                              className="bg-spring-green-600 text-white px-4 py-2 rounded-lg w-full"
                            >
                              Refresh Data
                            </button>
                            
                            {offers.length > 0 && (
                              <Link 
                                to="/preferences/stores" 
                                className="border border-spring-green-600 text-spring-green-600 px-4 py-2 rounded-lg text-center"
                              >
                                Adjust Store Preferences
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
                
                {!isDataLoading && !error && amazonOffers.length > 0 && (
                  <button 
                    onClick={loadMoreOffers}
                    className="w-full py-3 text-center text-spring-green-600 border border-spring-green-600 rounded-lg mt-4 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-spring-green-600 border-t-transparent animate-spin"></div>
                        <span>Loading more Amazon offers</span>
                      </div>
                    ) : (
                      <span>Load more Amazon offers</span>
                    )}
                  </button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
