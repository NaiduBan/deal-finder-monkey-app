
import React from 'react';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import { Loader2 } from 'lucide-react';

const Offers = () => {
  const { offers, isLoading, error } = useData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading offers: {error}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No offers available matching your preferences.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {offers.slice(0, 6).map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
};

export default Offers;
