
import React from 'react';
import { Offer } from '@/types';
import { Bookmark, BookmarkCheck, Tag } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard = ({ offer }: OfferCardProps) => {
  const { isOfferSaved, saveOffer, unsaveOffer } = useUser();
  const { session } = useAuth();
  const isSaved = isOfferSaved(offer.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) return;
    
    if (isSaved) {
      unsaveOffer(offer.id);
    } else {
      saveOffer(offer.id);
    }
  };

  return (
    <div className="offer-card h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="aspect-square relative">
        <img 
          src={offer.imageUrl || "/placeholder.svg"} 
          alt={offer.title || "Offer"} 
          className="w-full h-full object-cover"
        />
        
        {/* Save Button */}
        {session?.user && (
          <button
            onClick={handleSaveToggle}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-monkeyGreen" />
            ) : (
              <Bookmark className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
        
        {/* Code Badge */}
        {offer.code && (
          <div className="absolute top-2 left-2 bg-monkeyYellow text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            CODE
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Store */}
        <p className="text-xs text-monkeyGreen font-semibold mb-1">{offer.store || "Store"}</p>
        
        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-3 flex-1 leading-relaxed">
          {offer.description || offer.title || "Offer Description"}
        </p>
        
        {/* Code Display */}
        {offer.code && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">Code: </span>
            <span className="text-xs font-mono font-semibold text-monkeyGreen bg-monkeyGreen/10 px-2 py-1 rounded">
              {offer.code}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
