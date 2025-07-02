import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Store {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  rating: number;
  totalOffers: number;
  location: string;
  distance: string;
  isOpen: boolean;
  featured: boolean;
  cashback: string;
}

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  return (
    <Link to={`/store/${store.id}`}>
      <div className="bg-card rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        {/* Horizontal Layout */}
        <div className="flex items-center gap-6">
          {/* Store Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <img 
                src={store.logo} 
                alt={`${store.name} logo`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            {store.featured && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-black border-none text-xs px-2 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>

          {/* Store Info - Takes remaining space */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                    <span className={`text-xs font-medium ${store.isOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                      {store.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {store.description}
                </p>

                {/* Store Metrics */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="font-medium">{store.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="font-medium">{store.totalOffers} offers</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{store.distance}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Category & Actions */}
              <div className="flex flex-col items-end gap-3 ml-4">
                <Badge variant="outline" className="text-xs">
                  {store.category}
                </Badge>
                
                {store.cashback && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {store.cashback} Cashback
                  </div>
                )}
                
                <div className="flex items-center text-primary group-hover:text-accent transition-colors">
                  <span className="text-sm font-medium mr-2">View Store</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;