import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  Star, 
  ExternalLink, 
  Clock,
  Zap,
  Tag
} from 'lucide-react';

interface FeaturedDealsCarouselProps {
  offers: any[];
}

export const FeaturedDealsCarousel = ({ offers }: FeaturedDealsCarouselProps) => {
  // Get featured offers or top deals
  const featuredOffers = offers.filter(offer => offer.featured === 'true').slice(0, 8);
  const displayOffers = featuredOffers.length > 0 ? featuredOffers : offers.slice(0, 8);

  if (displayOffers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
          <Zap className="w-6 h-6 text-accent" />
          <span>Featured Deals</span>
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/offers?featured=true">View All Featured</Link>
        </Button>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {displayOffers.map((offer) => (
            <CarouselItem key={offer.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Image */}
                    <div className="aspect-video w-full rounded-t-lg overflow-hidden bg-muted">
                      {offer.image_url ? (
                        <img 
                          src={offer.image_url} 
                          alt={offer.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Tag className="w-12 h-12 text-primary/60" />
                        </div>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {offer.featured === 'true' && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}

                    {/* Offer Value */}
                    {offer.offer_value && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        {offer.offer_value}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{offer.store}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {offer.category && (
                          <Badge variant="secondary" className="text-xs">
                            {offer.category}
                          </Badge>
                        )}
                      </div>
                      
                      {offer.end_date && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {Math.ceil((new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d
                          </span>
                        </div>
                      )}
                    </div>

                    <Button asChild className="w-full bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform">
                      <Link to={`/offer/${offer.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Get Deal
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};