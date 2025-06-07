import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Offer } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Calendar, MapPin, Tag, ExternalLink, Share2, Star, StarHalf } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import ShareDeal from './ShareDeal';
import { trackEvent } from '@/services/analyticsService';
import { useIsMobile } from '@/hooks/use-mobile';

interface OfferDetailScreenProps {
  // You can add props here if needed
}

const OfferDetailScreen = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { offers, loading } = useData();
  const { session } = useAuth();
  const { isOfferSaved, saveOffer, unsaveOffer } = useUser();
  const isMobile = useIsMobile();
  const [showShareModal, setShowShareModal] = useState(false);

  const offer = offers.find(o => o.id === offerId);
  const isSaved = offer ? isOfferSaved(offer.id) : false;

  useEffect(() => {
    if (offerId && session?.user) {
      trackEvent({
        offer_id: offerId,
        event_type: 'view',
        user_id: session.user.id
      });
    }
  }, [offerId, session?.user]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) return;
    
    if (isSaved) {
      unsaveOffer(offer!.id);
    } else {
      saveOffer(offer!.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-monkeyGreen mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Offer Not Found</h2>
          <p className="text-gray-500">The requested offer could not be found.</p>
          <Link to="/home" className="text-monkeyGreen hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="p-4 flex items-center justify-between">
          <Link to="/home" className="text-gray-600">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">{offer.title}</h1>
          <div>
            {session?.user && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToggle}
              >
                {isSaved ? <Star className="h-4 w-4 text-yellow-500" /> : <StarHalf className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <img
          src={offer.imageUrl || "/placeholder.svg"}
          alt={offer.title || "Offer"}
          className="w-full aspect-[16/9] object-contain bg-gray-50 p-4"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button variant="secondary" size="icon" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 bg-white space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{offer.title}</h2>
        <p className="text-sm text-monkeyGreen font-semibold">{offer.store || "Store"}</p>
        <p className="text-gray-700 leading-relaxed">{offer.description || "No description available."}</p>

        {offer.longOffer && offer.longOffer !== offer.description && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            {offer.longOffer}
          </div>
        )}

        <div className="flex items-center space-x-4 text-gray-500">
          {offer.endDate && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Expires: {format(parseISO(offer.endDate), 'MMMM dd, yyyy')}
              </span>
            </div>
          )}
          {offer.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{offer.location.address}</span>
            </div>
          )}
        </div>

        {offer.code && (
          <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">Code:</span>
              <span className="font-mono font-semibold text-monkeyGreen ml-1">{offer.code}</span>
            </div>
          </div>
        )}

        {offer.terms && (
          <div className="text-sm text-gray-600">
            <h4 className="font-semibold mb-1">Terms and Conditions:</h4>
            <p>{offer.terms}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center">
        <Button asChild>
          <a
            href={offer.affiliateLink || offer.url || offer.smartlink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Deal
          </a>
        </Button>
      </div>
      
      {/* Share Modal */}
      <ShareDeal
        offerId={offerId!}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Comments and Reviews Section (Placeholder) */}
      <div className="p-4 bg-gray-50">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Comments & Reviews</h4>
        <p className="text-gray-500">This section is under development. Stay tuned!</p>
      </div>
    </div>
  );
};

export default OfferDetailScreen;
