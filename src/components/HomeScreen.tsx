import React, { useEffect } from 'react';
import { useHomeScreen } from '@/hooks/useHomeScreen';
import HomeScreenContainer from './home/HomeScreenContainer';
import HomeHeader from './home/HomeHeader';
import SmartFeaturesSection from './home/SmartFeaturesSection';
import SearchAndFilters from './home/SearchAndFilters';
import TrendingDealsSection from './home/TrendingDealsSection';
import QuickStatsWidget from './home/QuickStatsWidget';
import OffersTabsSection from './home/OffersTabsSection';
import PWAInstallPrompt from './PWAInstallPrompt';

const HomeScreen = () => {
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

  // Filter nearby offers (non-Amazon)
  const nearbyOffers = displayedOffers.filter(offer => !offer.isAmazon);

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
    <HomeScreenContainer>
      {/* PWA Install Prompt */}
      <div className="mb-6">
        <PWAInstallPrompt />
      </div>
      
      {/* Enhanced Header */}
      <HomeHeader 
        offersCount={offers.length} 
        cuelinkOffersCount={cuelinkOffers.length} 
      />
      
      {/* Smart Features Section */}
      <SmartFeaturesSection />
      
      {/* Quick Stats Widget */}
      <QuickStatsWidget />
      
      {/* Trending Deals Section */}
      <TrendingDealsSection offers={localFilteredOffers} />
      
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
      <OffersTabsSection 
        displayedOffers={displayedOffers}
        amazonOffers={amazonOffers}
        nearbyOffers={nearbyOffers}
        paginatedCuelinkOffers={paginatedCuelinkOffers}
        cuelinkCurrentPage={cuelinkCurrentPage}
        totalCuelinkPages={totalCuelinkPages}
        displayedCuelinkOffers={displayedCuelinkOffers}
        cuelinkItemsPerPage={cuelinkItemsPerPage}
        isCuelinkLoading={isCuelinkLoading}
        onCuelinkPageChange={handleCuelinkPageChange}
        isDataLoading={isDataLoading}
        isLoading={isLoading}
        error={error}
        loadMoreOffers={loadMoreOffers}
        debouncedSearchTerm={debouncedSearchTerm}
        offers={offers}
        cuelinkOffers={cuelinkOffers}
      />
    </HomeScreenContainer>
  );
};

export default HomeScreen;
