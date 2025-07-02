import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Users, 
  Zap,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RightPanelProps {
  offers: any[];
  userPreferences: any;
  cuelinkOffers: any[];
}

export const RightPanel = ({ offers, userPreferences, cuelinkOffers }: RightPanelProps) => {
  // Get trending offers (top 5 by popularity or recent views)
  const trendingOffers = offers.slice(0, 5);
  
  // Get expiring soon offers
  const expiringSoon = offers.filter(offer => {
    if (!offer.end_date) return false;
    const endDate = new Date(offer.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  }).slice(0, 4);

  // Personalized recommendations based on user preferences
  const recommendations = offers.filter(offer => {
    if (!userPreferences?.categories) return false;
    return userPreferences.categories.some((pref: string) => 
      offer.category?.toLowerCase().includes(pref.toLowerCase())
    );
  }).slice(0, 4);

  return (
    <aside className="w-80 bg-card/30 backdrop-blur-sm border-l border-border p-4 space-y-6 overflow-y-auto max-h-screen">
      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Deals</span>
            <Badge variant="secondary">{offers.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Flash Deals</span>
            <Badge className="bg-accent text-accent-foreground">{cuelinkOffers.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expiring Soon</span>
            <Badge variant="destructive">{expiringSoon.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trending Deals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="w-5 h-5 text-accent" />
            <span>Trending Now</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingOffers.map((offer, index) => (
            <Link key={offer.id} to={`/offer/${offer.id}`}>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {offer.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{offer.store}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="w-5 h-5 text-destructive" />
              <span>Expiring Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringSoon.map((offer) => (
              <Link key={offer.id} to={`/offer/${offer.id}`}>
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors group">
                  <p className="text-sm font-medium truncate group-hover:text-destructive transition-colors">
                    {offer.title}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">{offer.store}</p>
                    <Badge variant="destructive" className="text-xs">
                      {Math.ceil((new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d left
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>For You</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((offer) => (
              <Link key={offer.id} to={`/offer/${offer.id}`}>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {offer.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{offer.store}</p>
                  </div>
                </div>
              </Link>
            ))}
            
            <Button variant="outline" size="sm" className="w-full mt-3" asChild>
              <Link to="/preferences">
                Customize Preferences
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 47 users saved electronics deals</p>
            <p>• 23 new flash deals added</p>
            <p>• Fashion category trending ↗️</p>
            <p>• 156 deals expiring today</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};