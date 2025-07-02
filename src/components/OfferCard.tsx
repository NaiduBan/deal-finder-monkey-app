
import React from 'react';
import { Offer } from '@/types';
import { Bookmark, BookmarkCheck, Tag, Star, Users, ThumbsUp, Eye } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  offer: Offer;
  isMobile?: boolean;
}

const OfferCard = ({ offer, isMobile }: OfferCardProps) => {
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

  // Mock social proof data - in real app this would come from the database
  const socialProof = {
    usedCount: Math.floor(Math.random() * 500) + 50,
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
    verificationRate: Math.floor(Math.random() * 30) + 70 // 70-100%
  };

  return (
    <div className={`flex flex-col bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group ${
      offer.sponsored ? 'ring-2 ring-yellow-400/30 shadow-yellow-200/30' : ''
    }`}>
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3] overflow-hidden">
        <img 
          src={offer.imageUrl || "/placeholder.svg"} 
          alt={offer.title || "Offer"} 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Save Button */}
        {session?.user && (
          <button
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 z-20"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-spring-green-600" />
            ) : (
              <Bookmark className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
        
        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {offer.sponsored && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg border-none px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Sponsored
                </Badge>
            )}
            {offer.code && (
                <Badge className="bg-gradient-to-r from-spring-green-500 to-emerald-500 text-white shadow-lg border-none px-2 py-1 rounded-lg">
                    <Tag className="w-3 h-3 mr-1" />
                    CODE
                </Badge>
            )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col bg-white">
        {/* Store Badge */}
        <div className="inline-flex items-center w-fit mb-3">
          <span className="bg-gradient-to-r from-spring-green-100 to-emerald-100 text-spring-green-800 text-xs font-bold px-3 py-1.5 rounded-full border border-spring-green-200">
            {offer.store || "Store"}
          </span>
        </div>
        
        {/* Title */}
        {offer.title && (
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-spring-green-700 transition-colors duration-200">
            {offer.title}
          </h3>
        )}
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
          {offer.description || "Offer Description"}
        </p>

        {/* Long Offer */}
        {offer.longOffer && offer.longOffer !== offer.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-3 italic">
            {offer.longOffer}
          </p>
        )}
        
        {/* Social Proof Section */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{socialProof.usedCount} used</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{socialProof.rating} ⭐</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{socialProof.verificationRate}% verified</span>
            </div>
          </div>
          {socialProof.verificationRate > 85 && (
            <Badge className="bg-primary/10 text-primary border-none text-xs">
              Verified ✓
            </Badge>
          )}
        </div>

        {/* Code Display */}
        {offer.code && (
          <div className="mt-4">
            <div className="relative p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:from-primary/10 hover:to-primary/20 hover:border-primary/50 transition-all duration-200 group/code">
              <div className="text-center">
                <span className="text-xs text-primary uppercase tracking-wider font-medium block mb-1">Coupon Code</span>
                <p className="text-lg font-mono font-bold text-primary tracking-wider">
                  {offer.code}
                </p>
              </div>
              <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover/code:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
