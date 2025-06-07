
import React from 'react';
import { Offer } from '@/types';
import { Bookmark, BookmarkCheck, Tag } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/services/analyticsService';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard = ({ offer }: OfferCardProps) => {
  const { isOfferSaved, saveOffer, unsaveOffer } = useUser();
  const { session } = useAuth();
  const isMobile = useIsMobile();
  const isSaved = isOfferSaved(offer.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) return;
    
    if (isSaved) {
      unsaveOffer(offer.id);
    } else {
      saveOffer(offer.id);
      trackEvent({
        offer_id: offer.id,
        event_type: 'save',
        user_id: session.user.id
      });
    }
  };

  const handleCardClick = () => {
    trackEvent({
      offer_id: offer.id,
      event_type: 'view',
      user_id: session?.user?.id
    });
  };

  return (
    <div 
      className={`offer-card h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
        !isMobile ? 'w-full max-w-[400px]' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Image Container - Different aspect ratios for mobile and desktop */}
      <div className={`relative bg-gray-50 ${
        isMobile ? 'aspect-square' : 'aspect-[5/2]'
      }`}>
        <img 
          src={offer.imageUrl || "/placeholder.svg"} 
          alt={offer.title || "Offer"} 
          className="w-full h-full object-contain p-2"
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

        {/* Featured Badge */}
        {offer.featured && (
          <div className="absolute bottom-2 left-2 bg-monkeyGreen text-white text-xs font-bold px-2 py-1 rounded-full">
            FEATURED
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Store */}
        <p className="text-xs text-monkeyGreen font-semibold mb-1">{offer.store || "Store"}</p>
        
        {/* Title */}
        {offer.title && (
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {offer.title}
          </h3>
        )}
        
        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2 flex-1 leading-relaxed mb-2">
          {offer.description || "Offer Description"}
        </p>
        
        {/* Long Offer */}
        {offer.longOffer && offer.longOffer !== offer.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {offer.longOffer}
          </p>
        )}
        
        {/* Code Display */}
        {offer.code && (
          <div className="mt-auto text-center">
            <span className="text-xs text-gray-500">Code: </span>
            <span className="text-xs font-mono font-semibold text-monkeyGreen bg-monkeyGreen/10 px-2 py-1 rounded">
              {offer.code}
            </span>
          </div>
        )}

        {/* Savings Display */}
        {offer.savings && (
          <div className="mt-2 text-center">
            <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
              Save {offer.savings}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
