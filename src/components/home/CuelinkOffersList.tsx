import React from 'react';
import { CuelinkOffer } from '@/types';
import CuelinkOfferCard from '@/components/CuelinkOfferCard';
import CuelinkPagination from '@/components/CuelinkPagination';
import { useIsMobile } from '@/hooks/use-mobile';

interface CuelinkOffersListProps {
  offers: CuelinkOffer[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalOffers: number;
  itemsPerPage: number;
  searchTerm?: string;
}

const CuelinkOffersList = ({
  offers,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  totalOffers,
  itemsPerPage,
  searchTerm
}: CuelinkOffersListProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spring-green-600"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg text-center shadow-sm">
        <p className="text-gray-500">No flash deals found</p>
        <p className="text-sm text-gray-400 mt-2">
          {totalOffers === 0 
            ? "No flash deals available in the Cuelink_data table" 
            : "Try a different search term or check back later"
          }
        </p>
        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Total Cuelink offers loaded: {totalOffers}
          </p>
          {searchTerm && (
            <p className="text-xs text-gray-400">
              Search term: "{searchTerm}"
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600">
        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalOffers)} of {totalOffers} flash deals
      </div>
      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {offers.map((offer) => (
          <CuelinkOfferCard key={offer.Id} offer={offer} />
        ))}
      </div>
      <CuelinkPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default CuelinkOffersList;