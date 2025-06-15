
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Offer } from '@/types';
import OfferActions from './OfferActions';

interface OfferImageProps {
  offer: Offer;
  prevOfferId: string | null;
  nextOfferId: string | null;
}

const OfferImage = ({ offer, prevOfferId, nextOfferId }: OfferImageProps) => {
  const isMobile = useIsMobile();
  return (
    <div className={`relative bg-white ${isMobile ? 'w-full aspect-square' : 'w-full aspect-[4/3] rounded-xl shadow-lg border'}`}>
      <img
        src={offer.imageUrl || "/placeholder.svg"}
        alt={offer.title || "Offer"}
        className={`w-full h-full object-contain ${!isMobile ? 'rounded-xl' : ''}`}
      />
      
      <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4">
        {prevOfferId ? (
          <Link to={`/offer/${prevOfferId}`} className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors">
            <ChevronLeft className="w-5 h-5 text-spring-green-600" />
          </Link>
        ) : <div />}
        {nextOfferId ? (
          <Link to={`/offer/${nextOfferId}`} className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors">
            <ChevronRight className="w-5 h-5 text-spring-green-600" />
          </Link>
        ) : <div />}
      </div>
      
      <OfferActions offer={offer} />
    </div>
  );
};

export default OfferImage;
