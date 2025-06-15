
import React from 'react';
import { CuelinkOffer } from '@/types';
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Store, ExternalLink } from 'lucide-react';

interface CuelinkOfferCardProps {
  offer: CuelinkOffer;
}

const CuelinkOfferCard: React.FC<CuelinkOfferCardProps> = ({ offer }) => {
  const handleVisitOffer = () => {
    if (offer.URL) {
      window.open(offer.URL, '_blank');
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-lg group cursor-pointer" onClick={handleVisitOffer}>
  
      {/* Image Section */}
      <div className="relative">
        {offer['Image URL'] ? (
          <div className="aspect-video bg-gray-100">
            <img 
              src={offer['Image URL']} 
              alt={offer.Title || 'Offer'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              onError={(e) => { 
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.display = 'none';
              }} 
            />
          </div>
        ) : (
          <div className="aspect-video bg-spring-green-50 flex items-center justify-center">
            <Store className="w-12 h-12 text-spring-green-200" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="capitalize shadow" variant={offer.Status === 'active' ? 'default' : 'secondary'}>{offer.Status || 'Status'}</Badge>
        </div>
      </div>
    
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div>
          {offer.Merchant && <p className="text-xs font-bold uppercase text-spring-green-600 tracking-wider">{offer.Merchant}</p>}
          <CardTitle className="text-md font-semibold text-gray-900 line-clamp-2 mt-1">{offer.Title || 'Flash Deal'}</CardTitle>
        </div>
    
        {/* Description */}
        {offer.Description && <p className="text-sm text-gray-600 line-clamp-2 mt-2">{offer.Description}</p>}
    
        {/* Coupon Code */}
        {offer['Coupon Code'] && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">CODE</p>
            <div className="mt-1 p-2 bg-spring-green-50 border border-dashed border-spring-green-200 rounded-md">
              <p className="font-mono font-bold text-spring-green-700 tracking-widest">{offer['Coupon Code']}</p>
            </div>
          </div>
        )}
    
        <div className="flex-grow" /> {/* Spacer */}
    
        {/* Categories and terms */}
        <div className="mt-3 space-y-2">
            {offer.Categories && (
              <div>
                <div className="flex flex-wrap gap-1">
                  {offer.Categories.split(',').map((c, i) => <Badge key={i} variant="outline" className="text-xs font-normal">{c.trim()}</Badge>)}
                </div>
              </div>
            )}
            {offer.Terms && (
                <p className="text-xs text-gray-500 line-clamp-1"><strong className="font-medium">Terms:</strong> {offer.Terms}</p>
            )}
            {offer['Campaign Name'] && (
                <p className="text-xs text-gray-500 line-clamp-1"><strong className="font-medium">Campaign:</strong> {offer['Campaign Name']}</p>
            )}
        </div>
    
      </div>
      
      <CardFooter className="p-3 bg-gray-50 border-t flex-col items-start gap-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 w-full">
          <Calendar className="w-3.5 h-3.5" />
          <span>{offer['End Date'] ? `Ends: ${new Date(offer['End Date']).toLocaleDateString()}` : 'No end date'}</span>
          <div className="flex-grow" />
          <div className="flex items-center gap-1 text-spring-green-600 font-semibold">
            <span>View Offer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CuelinkOfferCard;
