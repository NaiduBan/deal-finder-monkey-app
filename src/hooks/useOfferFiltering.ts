
import { useState, useEffect } from 'react';
import { Offer } from '@/types';

export const useOfferFiltering = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Searching for:", e.target.value);
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log("Category clicked:", categoryId);
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setDebouncedSearchTerm('');
  };

  // Filter offers based on search and category
  const filterOffers = (offers: Offer[], searchTerm: string, categoryFilter: string | null) => {
    return offers.filter(offer => {
      if (categoryFilter && offer.category) {
        const categoryMatch = offer.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
                             categoryFilter.toLowerCase().includes(offer.category.toLowerCase());
        if (!categoryMatch) return false;
      }
      
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (offer.title && offer.title.toLowerCase().includes(searchTermLower)) ||
          (offer.store && offer.store.toLowerCase().includes(searchTermLower)) ||
          (offer.description && offer.description.toLowerCase().includes(searchTermLower)) ||
          (offer.category && offer.category.toLowerCase().includes(searchTermLower));
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  };

  return {
    searchQuery,
    selectedCategory,
    debouncedSearchTerm,
    handleSearch,
    handleCategoryClick,
    handleClearFilters,
    filterOffers
  };
};
