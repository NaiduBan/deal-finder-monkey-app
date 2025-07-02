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
    <div className={`bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen relative overflow-hidden ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(156,146,172,0.03)_25%,_rgba(156,146,172,0.03)_50%,_transparent_50%,_transparent_75%,_rgba(156,146,172,0.03)_75%,_rgba(156,146,172,0.03))] bg-[length:60px_60px] opacity-30"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-spring-green-300/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Main content with better organization */}
      <div className={`space-y-8 relative z-10 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* PWA Install Prompt */}
          <div className="mb-6">
            <PWAInstallPrompt />
          </div>
          
          {/* Enhanced Header */}
          <HomeHeader 
            offersCount={offers.length} 
            cuelinkOffersCount={cuelinkOffers.length} 
          />
          
          {/* Quick Stats Cards in organized grid */}
          <QuickStatsSection 
            displayedOffersCount={displayedOffers.length}
            cuelinkOffersCount={cuelinkOffers.length}
            categoriesCount={dynamicCategories.length}
          />
          
          {/* Smart Features Section */}
          <SmartFeaturesSection />
          
          {/* Search and Filters - Better organized */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-8">
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
          </div>
          
          {/* Enhanced Offers section with better tabs */}
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
                <TabsList className="grid w-full max-w-lg grid-cols-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-1.5 rounded-2xl border border-indigo-200/50 shadow-inner">
                  <TabsTrigger value="all" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">All Deals</TabsTrigger>
                  <TabsTrigger value="nearby" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-spring-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Nearby</TabsTrigger>
                  <TabsTrigger value="flash" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Flash</TabsTrigger>
                  <TabsTrigger value="amazon" className="text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Amazon</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-2">
                {isDataLoading || isLoading ? (
                  <div className="flex flex-col justify-center items-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading amazing deals...</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-600">Error loading offers: {error.message}</p>
                      </div>
                    )}
                    
                    {!error && displayedOffers.length > 0 ? (
                      <div className={`grid gap-4 auto-rows-max ${
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
                        <div className="bg-gradient-to-br from-white to-indigo-50/30 p-8 rounded-2xl text-center shadow-lg border border-indigo-100">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🔍</span>
                          </div>
                          <p className="text-gray-700 font-semibold text-lg mb-2">No offers found</p>
                          <p className="text-sm text-gray-500 mb-6">
                            {offers.length === 0 
                              ? "No offers available in the Offers_data table" 
                              : "Try a different search term or check back later"
                            }
                          </p>
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={loadMoreOffers}
                              className="bg-gradient-to-r from-spring-green-500 to-emerald-600 hover:from-spring-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              🔄 Refresh Data
                            </button>
                            
                            {offers.length > 0 && (
                              <Link 
                                to="/preferences/brands" 
                                className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl text-center font-semibold transition-all duration-200 transform hover:scale-105"
                              >
                                ⚙️ Adjust Preferences
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
                
                {!isDataLoading && !error && displayedOffers.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={loadMoreOffers}
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
              </TabsContent>
              
              <TabsContent value="nearby" className="space-y-4">
                <div className={`grid gap-4 auto-rows-max ${
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
                  <div className="bg-gradient-to-br from-white to-spring-green-50/30 p-8 rounded-2xl text-center shadow-lg border border-spring-green-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-spring-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                    <p className="text-gray-700 font-semibold text-lg mb-2">No nearby offers found</p>
                    {offers.length > 0 && (
                      <Link 
                        to="/preferences/stores" 
                        className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-spring-green-500 to-emerald-600 hover:from-spring-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        🏪 Adjust Store Preferences
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
                        <div className={`grid gap-4 auto-rows-max ${
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
