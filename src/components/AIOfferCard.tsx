
import React from 'react';
import { ExternalLink, Tag, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AIOfferCardProps {
  offer: any;
  isMobile?: boolean;
}

const AIOfferCard = ({ offer, isMobile }: AIOfferCardProps) => {
  const handleCardClick = () => {
    // Generate offer ID from lmd_id or use a fallback
    const offerId = offer.lmd_id ? offer.lmd_id.toString() : offer.id || `offer-${Date.now()}`;
    const offerUrl = `/offer/${offerId}`;
    
    // Open in new tab
    window.open(offerUrl, '_blank');
  };

  const handleVisitStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = offer.smartlink || offer.url || offer.merchantHomepage;
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border ${
        offer.sponsored ? 'border-yellow-400 shadow-yellow-200/50' : 'border-gray-200'
      } ${isMobile ? 'w-full' : 'w-72'}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative bg-gray-100 aspect-video rounded-t-lg overflow-hidden">
          <img 
            src={offer.image_url || "/placeholder.svg"} 
            alt={offer.title || "Offer"} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges Container */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            {offer.sponsored && (
              <Badge className="bg-yellow-400 text-black text-xs">
                <Star className="w-3 h-3 mr-1" />
                Sponsored
              </Badge>
            )}
            {offer.code && (
              <Badge className="bg-monkeyGreen text-white text-xs">
                <Tag className="w-3 h-3 mr-1" />
                CODE
              </Badge>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Store */}
          <p className="text-xs font-semibold text-monkeyGreen">{offer.store || "Store"}</p>
          
          {/* Title */}
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">
            {offer.title || "Special Offer"}
          </h3>
          
          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2">
            {offer.description || offer.long_offer || "Amazing deal available now!"}
          </p>
          
          {/* Action Button */}
          <Button 
            size="sm" 
            className="w-full bg-monkeyGreen hover:bg-green-700 text-white text-xs py-1"
            onClick={handleVisitStore}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Visit Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOfferCard;
