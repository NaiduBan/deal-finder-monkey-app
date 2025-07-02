import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Star } from 'lucide-react';
import { Offer } from '@/types';
import { Badge } from '@/components/ui/badge';

interface TrendingDealsSectionProps {
  offers: Offer[];
}

const TrendingDealsSection = ({ offers }: TrendingDealsSectionProps) => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  // Get trending deals (sponsored, featured, or high savings)
  const trendingDeals = offers
    .filter(offer => offer.sponsored || offer.featured || parseFloat(offer.savings.toString()) > 50)
    .slice(0, 5);

  const dealOfTheDay = trendingDeals.find(offer => offer.sponsored) || trendingDeals[0];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({
        dealOfDay: `${hours}h ${minutes}m ${seconds}s`
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!trendingDeals.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-gradient-to-b from-accent to-accent/70 rounded-full"></div>
          <h2 className="font-bold text-2xl bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
            🔥 Trending Now
          </h2>
          <Badge className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent-foreground border-none">
            <TrendingUp className="w-3 h-3 mr-1" />
            Hot
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal of the Day - Large Card */}
        {dealOfTheDay && (
          <div className="lg:col-span-1">
            <Link to={`/offer/${dealOfTheDay.id}`}>
              <div className="relative bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20 hover:shadow-xl transition-all duration-300 group h-full">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gradient-to-r from-accent to-accent/80 text-black border-none font-bold">
                    <Crown className="w-3 h-3 mr-1 fill-current" />
                    Deal of the Day
                  </Badge>
                </div>
                
                <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={dealOfTheDay.imageUrl || "/placeholder.svg"} 
                    alt={dealOfTheDay.title || "Deal"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {dealOfTheDay.store}
                    </span>
                    <div className="flex items-center gap-1 text-accent">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold">
                        {timeLeft.dealOfDay || '23h 59m 59s'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {dealOfTheDay.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dealOfTheDay.description}
                  </p>

                  {dealOfTheDay.savings && (
                    <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-3 rounded-xl">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-accent">
                          {typeof dealOfTheDay.savings === 'number' ? `₹${dealOfTheDay.savings}` : dealOfTheDay.savings}
                        </span>
                        <span className="text-sm text-muted-foreground block">Savings</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Hot Deals Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {trendingDeals.slice(0, 4).map((offer, index) => (
              <Link key={offer.id} to={`/offer/${offer.id}`}>
                <div className="bg-card rounded-xl p-4 border hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={offer.imageUrl || "/placeholder.svg"} 
                        alt={offer.title || "Offer"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {offer.sponsored && (
                          <Badge className="bg-accent/20 text-accent-foreground border-none text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Sponsored
                          </Badge>
                        )}
                        {offer.featured && (
                          <Badge className="bg-primary/20 text-primary border-none text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {offer.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {offer.store}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {offer.savings && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-accent">
                          {typeof offer.savings === 'number' ? `₹${offer.savings}` : offer.savings}
                        </span>
                        <span className="text-xs text-muted-foreground block">Save</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix import
const Crown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6l3 3 4-4 4 4 3-3 2 6-8 4-8-4z"/>
  </svg>
);

export default TrendingDealsSection;