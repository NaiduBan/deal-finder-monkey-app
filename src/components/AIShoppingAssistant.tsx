
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Clock, MapPin, Users, Star } from 'lucide-react';
import { Offer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AIRecommendation {
  id: string;
  type: 'trending' | 'personalized' | 'price_drop' | 'expiring_soon' | 'local';
  title: string;
  description: string;
  offers: Offer[];
  confidence: number;
  icon: React.ReactNode;
}

const AIShoppingAssistant = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    generateAIRecommendations();
  }, [session]);

  const generateAIRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Get user preferences and behavior
      const userContext = await getUserContext();
      
      // Call AI recommendation engine
      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: { userContext }
      });

      if (error) throw error;

      const aiRecs: AIRecommendation[] = [
        {
          id: 'trending',
          type: 'trending',
          title: 'Trending Deals',
          description: 'Popular deals that others are loving right now',
          offers: data?.trendingOffers || [],
          confidence: 0.85,
          icon: <TrendingUp className="w-5 h-5 text-orange-500" />
        },
        {
          id: 'personalized',
          type: 'personalized',
          title: 'Just For You',
          description: 'Handpicked based on your shopping preferences',
          offers: data?.personalizedOffers || [],
          confidence: 0.92,
          icon: <Sparkles className="w-5 h-5 text-purple-500" />
        },
        {
          id: 'price_drop',
          type: 'price_drop',
          title: 'Price Drops',
          description: 'Items on your wishlist that just got cheaper',
          offers: data?.priceDropOffers || [],
          confidence: 0.95,
          icon: <TrendingUp className="w-5 h-5 text-green-500 rotate-180" />
        },
        {
          id: 'expiring',
          type: 'expiring_soon',
          title: 'Expiring Soon',
          description: 'Great deals ending in the next 24 hours',
          offers: data?.expiringOffers || [],
          confidence: 0.88,
          icon: <Clock className="w-5 h-5 text-red-500" />
        },
        {
          id: 'local',
          type: 'local',
          title: 'Near You',
          description: 'Local stores and restaurants with amazing offers',
          offers: data?.localOffers || [],
          confidence: 0.78,
          icon: <MapPin className="w-5 h-5 text-blue-500" />
        }
      ];

      setRecommendations(aiRecs.filter(rec => rec.offers.length > 0));
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      toast({
        title: "AI Assistant",
        description: "Unable to load personalized recommendations. Showing general deals instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserContext = async () => {
    if (!session?.user) return null;

    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id);

      // Get saved offers
      const { data: savedOffers } = await supabase
        .from('saved_offers')
        .select('offer_id')
        .eq('user_id', session.user.id);

      // Get recent searches (if we track them)
      const { data: searches } = await supabase
        .from('user_searches')
        .select('query, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        preferences: preferences || [],
        savedOffers: savedOffers?.map(so => so.offer_id) || [],
        recentSearches: searches || [],
        location: 'India' // Default location
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-monkeyGreen animate-pulse" />
          <h2 className="text-lg font-semibold">AI Assistant is analyzing...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-monkeyGreen" />
          <h2 className="text-xl font-bold">AI Shopping Assistant</h2>
          <Badge variant="secondary" className="bg-monkeyGreen/10 text-monkeyGreen">
            Powered by AI
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateAIRecommendations}
          className="text-monkeyGreen border-monkeyGreen hover:bg-monkeyGreen hover:text-white"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {rec.icon}
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">
                    {Math.round(rec.confidence * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {rec.offers.length} deals found
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {rec.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                {rec.offers.slice(0, 2).map((offer, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-monkeyGreen/10 rounded flex items-center justify-center text-xs">
                      {offer.store?.charAt(0) || '🏪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{offer.title}</p>
                      <p className="text-xs text-gray-500">{offer.store}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {offer.savings}
                    </Badge>
                  </div>
                ))}
                
                <Button 
                  className="w-full bg-monkeyGreen hover:bg-green-700 text-white"
                  size="sm"
                >
                  View All {rec.offers.length} Deals
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Building Your Profile</h3>
            <p className="text-gray-600 mb-4">
              Save some offers and set your preferences to get personalized AI recommendations!
            </p>
            <Button className="bg-monkeyGreen hover:bg-green-700 text-white">
              Set Preferences
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIShoppingAssistant;
