
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check, Heart, Share2, Calendar, Tag, Store, Percent, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { saveOfferForUser, unsaveOfferForUser } from '@/services/supabaseService';
import { useIsMobile } from '@/hooks/use-mobile';

const OfferDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { offers } = useData();
  const { user, updateSavedOffers } = useUser();
  const { session } = useAuth();
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const offer = offers.find(o => o.id === id);

  useEffect(() => {
    if (!offer) {
      navigate('/home');
    }
  }, [offer, navigate]);

  if (!offer) {
    return null;
  }

  const isSaved = user.savedOffers?.includes(offer.id) || false;

  const handleCopyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copied!",
        description: "Coupon code has been copied to clipboard",
      });
    }
  };

  const handleSaveOffer = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save offers",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        const success = await unsaveOfferForUser(session.user.id, offer.id);
        if (success) {
          updateSavedOffers(user.savedOffers?.filter(id => id !== offer.id) || []);
          toast({
            title: "Offer removed",
            description: "Offer has been removed from your saved list",
          });
        }
      } else {
        const success = await saveOfferForUser(session.user.id, offer.id);
        if (success) {
          updateSavedOffers([...(user.savedOffers || []), offer.id]);
          toast({
            title: "Offer saved!",
            description: "Offer has been added to your saved list",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved offers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: offer.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Offer link has been copied to clipboard",
      });
    }
  };

  const handleGetDeal = () => {
    const targetUrl = offer.smartlink || offer.url || offer.merchantHomepage;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
      toast({
        title: "Redirecting...",
        description: "Opening offer in a new tab",
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Mobile Header */}
      {isMobile ? (
        <div className="bg-white shadow-sm border-b p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 truncate mx-3 flex-1">
              {offer.store}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveOffer}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{offer.store}</h1>
                  <p className="text-gray-600">Offer Details</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleSaveOffer}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 ${
                    isSaved ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${isMobile ? 'p-4' : 'max-w-7xl mx-auto px-6 py-8'}`}>
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Main Content */}
          <div className={`space-y-6 ${!isMobile ? 'lg:col-span-2' : ''}`}>
            {/* Offer Image */}
            {offer.imageUrl && (
              <Card className="overflow-hidden border-green-200">
                <div className={`${isMobile ? 'h-48' : 'h-64 lg:h-80'} bg-gray-100 flex items-center justify-center`}>
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Offer Details */}
            <Card className="border-green-200">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="space-y-4">
                  <div>
                    <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'} mb-2`}>
                      {offer.title}
                    </h2>
                    <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
                      {offer.description || offer.longOffer}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {offer.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        ⭐ Featured
                      </Badge>
                    )}
                    {offer.publisherExclusive && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        💎 Exclusive
                      </Badge>
                    )}
                    {offer.savings && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        💰 Save {offer.savings}
                      </Badge>
                    )}
                  </div>

                  {/* Coupon Code */}
                  {offer.code && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Coupon Code</p>
                          <p className={`font-mono bg-white px-3 py-2 rounded border ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-green-700`}>
                            {offer.code}
                          </p>
                        </div>
                        <Button
                          onClick={handleCopyCode}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            {offer.termsAndConditions && (
              <Card className="border-orange-200">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className={`font-semibold text-gray-900 mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Terms & Conditions
                  </h3>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                    {offer.termsAndConditions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-blue-200">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <h3 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Store className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Store</p>
                      <p className="font-medium text-gray-900">{offer.store}</p>
                    </div>
                  </div>
                  
                  {offer.category && (
                    <div className="flex items-center space-x-3">
                      <Tag className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium text-gray-900">{offer.category}</p>
                      </div>
                    </div>
                  )}
                  
                  {offer.savings && (
                    <div className="flex items-center space-x-3">
                      <Percent className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Savings</p>
                        <p className="font-medium text-green-700">{offer.savings}</p>
                      </div>
                    </div>
                  )}
                  
                  {offer.expiryDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Valid Until</p>
                        <p className="font-medium text-gray-900">{offer.expiryDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Get Deal Button */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <Button
                  onClick={handleGetDeal}
                  size={isMobile ? "default" : "lg"}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Get This Deal
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Clicking will redirect you to the store
                </p>
              </CardContent>
            </Card>

            {/* Price Info */}
            {(offer.price || offer.originalPrice) && (
              <Card className="border-green-200">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className={`font-semibold text-gray-900 mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Price Details
                  </h3>
                  <div className="space-y-2">
                    {offer.originalPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="line-through text-gray-500">₹{offer.originalPrice}</span>
                      </div>
                    )}
                    {offer.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Deal Price:</span>
                        <span className="font-bold text-green-600 text-lg">₹{offer.price}</span>
                      </div>
                    )}
                    {offer.originalPrice && offer.price && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium text-gray-900">You Save:</span>
                        <span className="font-bold text-green-600">₹{offer.originalPrice - offer.price}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailScreen;
