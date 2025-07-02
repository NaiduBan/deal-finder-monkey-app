import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Heart, 
  Share2, 
  Clock,
  Star,
  MapPin,
  Tag
} from 'lucide-react';

interface OfferListViewProps {
  offers: any[];
}

export const OfferListView = ({ offers }: OfferListViewProps) => {
  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Image */}
              <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {offer.image_url ? (
                  <img 
                    src={offer.image_url} 
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-primary/60" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to={`/offer/${offer.id}`} className="group-hover:text-primary transition-colors">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {offer.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      {offer.store && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{offer.store}</span>
                        </div>
                      )}
                      
                      {offer.category && (
                        <Badge variant="secondary" className="text-xs">
                          {offer.category}
                        </Badge>
                      )}
                      
                      {offer.featured === 'true' && (
                        <Badge className="text-xs bg-accent text-accent-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {offer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {offer.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {offer.offer_value && (
                          <div className="text-2xl font-bold text-primary">
                            {offer.offer_value}
                          </div>
                        )}
                        
                        {offer.end_date && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              Expires {new Date(offer.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                      <Link to={`/offer/${offer.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Deal
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};