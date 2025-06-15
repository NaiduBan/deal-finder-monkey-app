
import React from 'react';
import { Offer } from '@/types';
import { Bookmark, BookmarkCheck, Tag, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";

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
    <div className={`h-full flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300 group ${
      offer.sponsored ? 'border-yellow-400 shadow-yellow-200/50' : 'border-gray-200'
    }`}>
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-video">
        <img 
          src={offer.imageUrl || "/placeholder.svg"} 
          alt={offer.title || "Offer"} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Save Button */}
        {session?.user && (
          <button
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-20"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-spring-green-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-700" />
            )}
          </button>
        )}
        
        {/* Badges Container */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
            {offer.sponsored && (
                <Badge className="bg-yellow-400 text-black shadow-lg border-none">
                    <Star className="w-3 h-3 mr-1" />
                    Sponsored
                </Badge>
            )}
            {offer.code && (
                <Badge className="bg-spring-green-600 text-white shadow-lg border-none">
                    <Tag className="w-3 h-3 mr-1" />
                    CODE
                </Badge>
            )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Store */}
        <p className="text-sm font-semibold text-spring-green-700 mb-1">{offer.store || "Store"}</p>
        
        {/* Title */}
        {offer.title && (
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
            {offer.title}
          </h3>
        )}
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 flex-1 leading-relaxed">
          {offer.description || "Offer Description"}
        </p>

        {/* Long Offer */}
        {offer.longOffer && offer.longOffer !== offer.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
            {offer.longOffer}
          </p>
        )}
        
        {/* Code Display */}
        {offer.code && (
          <div className="mt-4 text-center p-3 border-2 border-dashed border-spring-green-300 rounded-lg bg-spring-green-50 cursor-pointer hover:bg-spring-green-100 transition-colors">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Use Code</span>
            <p className="text-lg font-mono font-bold text-spring-green-700">
              {offer.code}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
