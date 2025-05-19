
import React from 'react';
import { Offer } from '@/types';
import { MapPin } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard = ({ offer }: OfferCardProps) => {
  // Format price in Indian Rupees
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="offer-card h-full flex flex-col">
      <div className="aspect-square relative">
        <img 
          src={offer.imageUrl} 
          alt={offer.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-monkeyYellow text-black text-xs font-bold px-2 py-0.5 rounded-full">
          {offer.savings}
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-monkeyGreen font-medium">{offer.store}</p>
        <h3 className="font-medium text-sm line-clamp-2 flex-1">{offer.title}</h3>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-bold">{formatPrice(offer.price)}</span>
            <span className="text-xs text-gray-500 line-through">{formatPrice(offer.originalPrice)}</span>
          </div>
          
          {offer.location && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-0.5" />
              <span>Nearby</span>
            </div>
          )}
          
          {offer.isAmazon && (
            <div className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              Amazon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
