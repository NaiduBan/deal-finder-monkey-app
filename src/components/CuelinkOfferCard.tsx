
import React from 'react';
import { CuelinkOffer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Store, ExternalLink, Ticket } from 'lucide-react';

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
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={handleVisitOffer}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {offer.Title || 'Flash Deal'}
          </CardTitle>
          <Badge variant={offer.Status === 'active' ? 'default' : 'secondary'}>
            {offer.Status}
          </Badge>
        </div>
        {offer.Merchant && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Store className="w-4 h-4" />
            <span>{offer.Merchant}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {offer['Image URL'] && (
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={offer['Image URL']} 
              alt={offer.Title || 'Offer'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {offer.Description && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {offer.Description}
          </p>
        )}

        {offer.Categories && (
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">{offer.Categories}</span>
          </div>
        )}

        {offer['Coupon Code'] && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Ticket className="w-4 h-4 text-green-600" />
            <span className="text-sm font-mono text-green-700">{offer['Coupon Code']}</span>
          </div>
        )}

        {offer.Terms && (
          <div className="text-xs text-gray-500 line-clamp-2">
            <strong>Terms:</strong> {offer.Terms}
          </div>
        )}

        <div className="space-y-1 text-xs text-gray-500">
          {offer['Start Date'] && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Starts: {new Date(offer['Start Date']).toLocaleDateString()}</span>
            </div>
          )}
          {offer['End Date'] && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Ends: {new Date(offer['End Date']).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {offer['Campaign Name'] && (
          <div className="text-xs text-gray-500">
            <strong>Campaign:</strong> {offer['Campaign Name']}
          </div>
        )}

        {offer.URL && (
          <div className="flex items-center justify-center pt-2">
            <button className="flex items-center gap-1 text-monkeyGreen hover:text-monkeyGreen/80 text-sm font-medium">
              <ExternalLink className="w-4 h-4" />
              Visit Offer
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CuelinkOfferCard;
