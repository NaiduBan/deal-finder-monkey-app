
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, Share2, MapPin, Info, Clock, AlertTriangle, ExternalLink, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

const OfferDetailScreen = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const { offers } = useData();
  
  const offerIndex = offers.findIndex(offer => offer.id === offerId);
  const offer = offerIndex !== -1 ? offers[offerIndex] : null;
  
  const nextOfferId = offerIndex < offers.length - 1 ? offers[offerIndex + 1].id : null;
  const prevOfferId = offerIndex > 0 ? offers[offerIndex - 1].id : null;
  
  if (!offer) {
    return (
      <div className="min-h-screen bg-monkeyBackground flex justify-center items-center">
        <p>Offer not found</p>
      </div>
    );
  }
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Offer removed from saved' : 'Offer saved',
      description: isSaved ? 'The offer has been removed from your saved list' : 'The offer has been added to your saved list',
    });
  };
  
  const handleShare = () => {
    // In a real app, this would open the native share dialog
    toast({
      title: 'Share offer',
      description: 'Sharing functionality will be implemented in the full version',
    });
  };
  
  const handleBuyNow = () => {
    if (offer.isAmazon && offer.affiliateLink) {
      // In a real app, this would open the affiliate link in a browser
      toast({
        title: 'Opening Amazon',
        description: 'Redirecting to Amazon to complete your purchase',
      });
    } else if (offer.location) {
      // In a real app, this would navigate to the map view
      toast({
        title: 'Opening Maps',
        description: `Navigating to ${offer.store}`,
      });
    } else if (offer.url || offer.smartlink || offer.merchantHomepage) {
      const link = offer.smartlink || offer.url || offer.merchantHomepage;
      // In a real app, this would open the link in a browser
      toast({
        title: 'Opening link',
        description: `Redirecting to ${offer.store}'s website`,
      });
    }
  };

  return (
    <div className="pb-20 bg-monkeyBackground min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold">Offer Details</h1>
        <div className="w-6 h-6"></div> {/* Empty div for flexbox alignment */}
      </div>
      
      {/* Image */}
      <div className="relative bg-white w-full aspect-square">
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="w-full h-full object-contain"
        />
        
        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          {prevOfferId && (
            <Link to={`/offer/${prevOfferId}`} className="bg-white/80 rounded-full p-1.5 shadow-lg">
              <ChevronLeft className="w-5 h-5 text-monkeyGreen" />
            </Link>
          )}
          {nextOfferId && (
            <Link to={`/offer/${nextOfferId}`} className="bg-white/80 rounded-full p-1.5 shadow-lg">
              <ChevronRight className="w-5 h-5 text-monkeyGreen" />
            </Link>
          )}
        </div>
        
        {/* Save and Share buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button 
            onClick={handleSave}
            className="bg-white/80 rounded-full p-2 shadow-lg"
          >
            <Bookmark 
              className={`w-5 h-5 ${isSaved ? 'text-monkeyYellow fill-monkeyYellow' : 'text-monkeyGreen'}`} 
            />
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/80 rounded-full p-2 shadow-lg"
          >
            <Share2 className="w-5 h-5 text-monkeyGreen" />
          </button>
        </div>
      </div>
      
      {/* Offer details */}
      <div className="flex-1 p-4 space-y-4">
        {/* Savings badge */}
        <div className="flex justify-between items-center">
          <div className="bg-monkeyYellow px-3 py-1 rounded-full text-sm font-semibold">
            Save {offer.savings}
          </div>
          <div className="text-gray-500 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {offer.expiryDate ? (
              `Expires ${new Date(offer.expiryDate).toLocaleDateString()}`
            ) : (
              "No expiry date"
            )}
          </div>
        </div>
        
        {/* Title and store */}
        <div>
          <h1 className="text-xl font-bold">{offer.title}</h1>
          <p className="text-monkeyGreen font-semibold">{offer.store}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">₹{offer.price.toFixed(2)}</span>
          <span className="text-gray-500 line-through">₹{offer.originalPrice.toFixed(2)}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700">{offer.description}</p>
        
        {/* Long offer if available */}
        {offer.longOffer && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700">{offer.longOffer}</p>
          </div>
        )}
        
        {/* Show code if available */}
        {offer.code && (
          <div className="flex items-center space-x-2 bg-monkeyYellow/20 p-3 rounded-lg">
            <Tag className="w-5 h-5 text-monkeyGreen" />
            <div>
              <p className="font-semibold">Code: {offer.code}</p>
              <p className="text-sm text-gray-600">Use this code at checkout</p>
            </div>
          </div>
        )}
        
        {/* Location if available */}
        {offer.location && (
          <div className="flex items-start space-x-2 bg-white p-3 rounded-lg shadow-sm">
            <MapPin className="w-5 h-5 text-monkeyGreen" />
            <div>
              <p className="font-semibold">{offer.store}</p>
              <p className="text-sm text-gray-600">{offer.location.address}</p>
            </div>
          </div>
        )}
        
        {/* Merchant Homepage if available */}
        {offer.merchantHomepage && (
          <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
            <ExternalLink className="w-5 h-5 text-monkeyGreen" />
            <div>
              <p className="font-semibold">Visit merchant website</p>
              <p className="text-sm text-gray-600 truncate">{offer.merchantHomepage}</p>
            </div>
          </div>
        )}
        
        {/* Terms */}
        {(offer.terms || offer.termsAndConditions) && (
          <div className="bg-monkeyYellow/10 p-3 rounded-lg flex items-start space-x-2">
            <Info className="w-5 h-5 text-monkeyYellow flex-shrink-0" />
            <p className="text-sm text-gray-700">{offer.termsAndConditions || offer.terms}</p>
          </div>
        )}
        
        {/* Additional details - Offer Type & Value */}
        {(offer.offerType || offer.offerValue) && (
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Offer Details</h3>
            {offer.offerType && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Type:</span> {offer.offerType}
              </p>
            )}
            {offer.offerValue && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Value:</span> {offer.offerValue}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom action button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-up">
        <Button
          className="w-full h-12 monkey-button"
          onClick={handleBuyNow}
        >
          {offer.isAmazon ? 'Buy on Amazon' : 
           offer.code ? 'Copy Code' : 
           (offer.url || offer.smartlink) ? 'Visit Website' : 
           'Get This Deal'}
        </Button>
      </div>
    </div>
  );
};

export default OfferDetailScreen;
