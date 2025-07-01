
import { useState, useEffect } from 'react';
import { fetchCuelinkOffers } from '@/services/cuelinkService';
import { CuelinkOffer } from '@/types';

export const useCuelinkData = () => {
  const [cuelinkOffers, setCuelinkOffers] = useState<CuelinkOffer[]>([]);
  const [isCuelinkLoading, setIsCuelinkLoading] = useState(false);
  const [cuelinkCurrentPage, setCuelinkCurrentPage] = useState(1);

  const cuelinkItemsPerPage = 12;

  // Fetch Cuelink offers
  useEffect(() => {
    const loadCuelinkOffers = async () => {
      setIsCuelinkLoading(true);
      try {
        console.log('Loading Cuelink offers...');
        const cuelinkData = await fetchCuelinkOffers();
        console.log('Fetched Cuelink data:', cuelinkData);
        setCuelinkOffers(cuelinkData);
        console.log('Loaded Cuelink offers:', cuelinkData.length);
      } catch (error) {
        console.error('Error loading Cuelink offers:', error);
      } finally {
        setIsCuelinkLoading(false);
      }
    };

    loadCuelinkOffers();
  }, []);

  const handleCuelinkPageChange = (page: number) => {
    setCuelinkCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Cuelink offers based on search term
  const filterCuelinkOffers = (searchTerm: string) => {
    return cuelinkOffers.filter(offer => {
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (offer.Title && offer.Title.toLowerCase().includes(searchTermLower)) ||
          (offer.Merchant && offer.Merchant.toLowerCase().includes(searchTermLower)) ||
          (offer.Description && offer.Description.toLowerCase().includes(searchTermLower)) ||
          (offer.Categories && offer.Categories.toLowerCase().includes(searchTermLower));
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  };

  return {
    cuelinkOffers,
    isCuelinkLoading,
    cuelinkCurrentPage,
    cuelinkItemsPerPage,
    handleCuelinkPageChange,
    filterCuelinkOffers
  };
};
