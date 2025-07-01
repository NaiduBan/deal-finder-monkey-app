
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useOfferFiltering } from './useOfferFiltering';
import { useCuelinkData } from './useCuelinkData';
import { useUserPreferences } from './useUserPreferences';
import { useOfferCategories } from './useOfferCategories';

export const useHomeScreen = () => {
  const {
    offers,
    filteredOffers,
    categories: allCategories,
    isLoading: isDataLoading,
    error,
    refetchOffers,
    isUsingMockData
  } = useData();

  const [isLoading, setIsLoading] = useState(false);

  // Use focused hooks
  const {
    searchQuery,
    selectedCategory,
    debouncedSearchTerm,
    handleSearch,
    handleCategoryClick,
    handleClearFilters,
    filterOffers
  } = useOfferFiltering();

  const {
    cuelinkOffers,
    isCuelinkLoading,
    cuelinkCurrentPage,
    cuelinkItemsPerPage,
    handleCuelinkPageChange,
    filterCuelinkOffers
  } = useCuelinkData();

  const {
    userPreferences,
    hasLoadedPreferences,
    localFilteredOffers
  } = useUserPreferences(filteredOffers);

  const {
    dynamicCategories
  } = useOfferCategories(offers, allCategories);

  const loadMoreOffers = () => {
    setIsLoading(true);
    refetchOffers().then(() => {
      setIsLoading(false);
    });
  };

  return {
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
    // Utilities
    filterOffers,
    filterCuelinkOffers,
    // Constants
    cuelinkItemsPerPage
  };
};
