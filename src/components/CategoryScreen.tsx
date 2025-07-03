
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Bookmark, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const CategoryScreen = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { offers } = useData();
  const { session } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  // Decode the category name from URL
  const categoryName = categoryId ? decodeURIComponent(categoryId) : '';

  // Filter offers by category
  const categoryOffers = offers.filter(offer => {
    if (!offer.categories) return false;
    const categories = offer.categories.split(',').map(cat => cat.trim().toLowerCase());
    return categories.includes(categoryName.toLowerCase());
  });

  useEffect(() => {
    if (session?.user) {
      loadSavedOffers();
    }
  }, [session]);

  const loadSavedOffers = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('saved_offers')
        .select('offer_id')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setSavedOffers(data?.map(item => item.offer_id) || []);
    } catch (error) {
      console.error('Error loading saved offers:', error);
    }
  };

  const handleSaveOffer = async (offerId: string) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to save offers",
        variant: "destructive"
      });
      return;
    }

    try {
      const isSaved = savedOffers.includes(offerId);

      if (isSaved) {
        const { error } = await supabase
          .from('saved_offers')
          .delete()
          .eq('user_id', session.user.id)
          .eq('offer_id', offerId);

        if (error) throw error;
        setSavedOffers(prev => prev.filter(id => id !== offerId));
        toast({
          title: "Offer removed",
          description: "Offer removed from saved list",
        });
      } else {
        const { error } = await supabase
          .from('saved_offers')
          .insert({
            user_id: session.user.id,
            offer_id: offerId
          });

        if (error) throw error;
        setSavedOffers(prev => [...prev, offerId]);
        toast({
          title: "Offer saved",
          description: "Offer added to your saved list",
        });
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive"
      });
    }
  };

  if (!categoryName) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${!isMobile ? 'pt-20' : ''}`}>
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-3">Category not found</h3>
          <Link to="/categories" className="text-purple-600 hover:text-purple-700">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className={`bg-white shadow-sm border-b sticky z-10 ${isMobile ? 'top-0' : 'top-20'}`}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center space-x-4">
            <Link to="/categories" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
                  {categoryName}
                </h1>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {categoryOffers.length} offers available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4' : 'p-8 max-w-7xl mx-auto'}`}>
        {categoryOffers.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Tag className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No offers found</h3>
            <p className="text-gray-500 mb-6">
              There are no offers available in the "{categoryName}" category at the moment.
            </p>
            <Link 
              to="/categories" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {categoryOffers.map((offer) => (
              <Card
                key={offer.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors line-clamp-2 mb-2">
                        {offer.title}
                      </h3>
                      {offer.offerValue && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 mb-2">
                          {offer.offerValue}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveOffer(offer.id);
                      }}
                      className="flex-shrink-0 ml-2"
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${
                          savedOffers.includes(offer.id) 
                            ? 'fill-current text-purple-600' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </div>

                  {offer.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {offer.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {offer.offerType && (
                        <Badge variant="outline" className="text-xs">
                          {offer.offerType}
                        </Badge>
                      )}
                      {offer.code && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Code: {offer.code}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {offer.store && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                        {offer.store}
                      </Badge>
                    )}
                    
                    {offer.expiryDate && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Ends {new Date(offer.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <Link
                      to={`/offer/${offer.id}`}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryScreen;
