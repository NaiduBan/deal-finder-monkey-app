
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, Share2, MapPin, Info, Clock, ExternalLink, Tag, Copy, Grid, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const OfferDetailScreen = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { offers } = useData();
  const { isOfferSaved, saveOffer, unsaveOffer } = useUser();
  const { session } = useAuth();
  const isMobile = useIsMobile();
  
  const offerIndex = offers.findIndex(offer => offer.id === offerId);
  const offer = offerIndex !== -1 ? offers[offerIndex] : null;
  const isSaved = offer ? isOfferSaved(offer.id) : false;
  
  const nextOfferId = offerIndex < offers.length - 1 ? offers[offerIndex + 1].id : null;
  const prevOfferId = offerIndex > 0 ? offers[offerIndex - 1].id : null;
  
  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p>Offer not found</p>
      </div>
    );
  }
  
  const handleSave = () => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save offers",
        variant: "destructive"
      });
      return;
    }

    if (isSaved) {
      unsaveOffer(offer.id);
    } else {
      saveOffer(offer.id);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.title || 'Great Offer',
        text: offer.description || '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Offer link copied to clipboard',
      });
    }
  };

  const copyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      toast({
        title: 'Code copied',
        description: `Code ${offer.code} copied to clipboard`,
      });
    }
  };
  
  const handleVisitLink = () => {
    const link = offer.smartlink || offer.url || offer.merchantHomepage;
    if (link) {
      window.open(link, '_blank');
      toast({
        title: 'Opening link',
        description: `Redirecting to ${offer.store}'s website`,
      });
    }
  };

  // Function to strip HTML tags
  const stripHtmlTags = (str: string) => {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
  };

  return (
    <div className={`bg-gray-50 min-h-screen flex flex-col ${isMobile ? 'pb-20' : 'pb-8'}`}>
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <Link to="/home" className="hover:bg-white/10 p-1 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold">Offer Details</h1>
        <div className="w-6 h-6"></div>
      </div>
      
      {/* Main Content Container */}
      <div className={`flex-1 ${isMobile ? '' : 'max-w-6xl mx-auto w-full px-8 py-6'}`}>
        <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
          {/* Image Section */}
          <div className={`${isMobile ? 'order-1' : 'order-1'}`}>
            <div className={`relative bg-white ${isMobile ? 'w-full aspect-square' : 'w-full aspect-[4/3] rounded-xl shadow-sm border border-gray-100'}`}>
              <img
                src={offer.imageUrl || "/placeholder.svg"}
                alt={offer.title || "Offer"}
                className={`w-full h-full object-contain ${!isMobile ? 'rounded-xl' : ''}`}
              />
              
              {/* Navigation arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                {prevOfferId && (
                  <Link to={`/offer/${prevOfferId}`} className="bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5 text-monkeyGreen" />
                  </Link>
                )}
                {nextOfferId && (
                  <Link to={`/offer/${nextOfferId}`} className="bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors">
                    <ChevronRight className="w-5 h-5 text-monkeyGreen" />
                  </Link>
                )}
              </div>
              
              {/* Save and Share buttons */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  onClick={handleSave}
                  className="bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                >
                  <Bookmark 
                    className={`w-5 h-5 ${isSaved ? 'text-monkeyGreen fill-monkeyGreen' : 'text-gray-600'}`} 
                  />
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={`${isMobile ? 'order-2 p-4' : 'order-2'} space-y-6`}>
            {/* Title and store */}
            <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
                {offer.title || offer.description}
              </h1>
              <p className={`text-monkeyGreen font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                {offer.store}
              </p>
              
              {/* Status */}
              {offer.status && (
                <div className={`flex items-center ${isMobile ? 'text-sm' : 'text-base'} mt-3`}>
                  <AlertCircle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2 text-green-600`} />
                  <span className="text-green-600 font-medium">Status: {offer.status}</span>
                </div>
              )}
              
              {/* Expiry */}
              {offer.expiryDate && (
                <div className={`flex items-center text-gray-500 ${isMobile ? 'text-sm' : 'text-base'} mt-2`}>
                  <Clock className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                  Expires {new Date(offer.expiryDate).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {/* Description */}
            {offer.description && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <h3 className={`font-semibold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>Description</h3>
                <p className={`text-gray-700 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {stripHtmlTags(offer.description)}
                </p>
              </div>
            )}
            
            {/* Long offer if available */}
            {offer.longOffer && offer.longOffer !== offer.description && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <h3 className={`font-semibold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>Details</h3>
                <p className={`text-gray-700 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {stripHtmlTags(offer.longOffer)}
                </p>
              </div>
            )}
            
            {/* Categories */}
            {offer.categories && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <div className="flex items-start space-x-3">
                  <Grid className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-monkeyGreen mt-0.5`} />
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Categories</h3>
                    <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{offer.categories}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Code */}
            {offer.code && (
              <div className={`bg-monkeyYellow/10 ${isMobile ? 'p-4' : 'p-6'} rounded-xl border border-monkeyYellow/20`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Tag className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-monkeyGreen`} />
                    <div>
                      <p className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Promo Code</p>
                      <p className={`font-mono font-bold text-monkeyGreen ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        {offer.code}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={copyCode}
                    className="border-monkeyGreen text-monkeyGreen hover:bg-monkeyGreen hover:text-white"
                  >
                    <Copy className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                    Copy
                  </Button>
                </div>
              </div>
            )}
            
            {/* Smartlink */}
            {(offer.smartlink || offer.url || offer.merchantHomepage) && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-monkeyGreen`} />
                    <div>
                      <p className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Visit Website</p>
                      <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Get this deal online</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleVisitLink}
                    size={isMobile ? "sm" : "default"}
                    className="bg-monkeyGreen hover:bg-green-600 text-white"
                  >
                    Visit
                  </Button>
                </div>
              </div>
            )}
            
            {/* Location if available */}
            {offer.location && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <div className="flex items-start space-x-3">
                  <MapPin className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-monkeyGreen mt-0.5`} />
                  <div>
                    <p className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>{offer.store}</p>
                    <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{offer.location.address}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Terms */}
            {(offer.terms || offer.termsAndConditions) && (
              <div className={`bg-orange-50 ${isMobile ? 'p-4' : 'p-6'} rounded-xl border border-orange-200`}>
                <div className="flex items-start space-x-3">
                  <Info className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-orange-600 flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-semibold text-orange-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Terms & Conditions</p>
                    <p className={`text-orange-800 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {stripHtmlTags(offer.termsAndConditions || offer.terms)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional details */}
            {(offer.offerType || offer.offerValue) && (
              <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-sm border border-gray-100`}>
                <h3 className={`font-semibold mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Offer Details</h3>
                <div className="space-y-3">
                  {offer.offerType && (
                    <div className="flex justify-between">
                      <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Type:</span>
                      <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>{offer.offerType}</span>
                    </div>
                  )}
                  {offer.offerValue && (
                    <div className="flex justify-between">
                      <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Value:</span>
                      <span className={`font-medium text-monkeyGreen ${isMobile ? 'text-sm' : 'text-base'}`}>{offer.offerValue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom action button */}
      <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0' : 'mt-8'} p-4 bg-white shadow-lg border-t`}>
        <Button
          className={`${isMobile ? 'w-full h-12' : 'w-full max-w-md mx-auto block h-14 text-lg'} bg-monkeyGreen hover:bg-green-600 text-white font-semibold`}
          onClick={offer.code ? copyCode : handleVisitLink}
        >
          {offer.code ? 'Copy Code & Visit' : 'Get This Deal'}
        </Button>
      </div>
    </div>
  );
};

export default OfferDetailScreen;
