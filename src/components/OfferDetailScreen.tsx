
import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/use-mobile';
import OfferHeader from './OfferDetail/OfferHeader';
import OfferImage from './OfferDetail/OfferImage';
import OfferInfo from './OfferDetail/OfferInfo';
import OfferBottomBar from './OfferDetail/OfferBottomBar';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const OfferDetailScreen = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { offers } = useData();
  const isMobile = useIsMobile();
  
  // Find offer by lmdId instead of the transformed id
  const offerIndex = offers.findIndex(offer => 
    offer.lmdId.toString() === offerId || offer.id === offerId
  );
  const offer = offerIndex !== -1 ? offers[offerIndex] : null;
  
  if (!offer) {
    return (
      <div className={`min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4 ${!isMobile ? 'pt-24' : ''}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Offer Not Found</h2>
        <p className="text-gray-600 mb-6">The offer you are looking for might have expired or does not exist.</p>
        <Button asChild>
          <Link to="/home">Go Back Home</Link>
        </Button>
      </div>
    );
  }
  
  // Find next and previous offers by lmdId
  const nextOfferIndex = offerIndex < offers.length - 1 ? offerIndex + 1 : -1;
  const prevOfferIndex = offerIndex > 0 ? offerIndex - 1 : -1;
  
  const nextOfferId = nextOfferIndex !== -1 ? offers[nextOfferIndex].lmdId.toString() : null;
  const prevOfferId = prevOfferIndex !== -1 ? offers[prevOfferIndex].lmdId.toString() : null;

  return (
    <div className={`bg-gray-100 min-h-screen ${isMobile ? 'pb-32' : 'pt-20'}`}>
      {isMobile && <OfferHeader />}

      <main className={`flex-1 ${isMobile ? '' : 'max-w-6xl mx-auto w-full px-4 py-8'}`}>
        <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-5 gap-8'}`}>
          <div className="lg:col-span-3">
            <OfferImage offer={offer} prevOfferId={prevOfferId} nextOfferId={nextOfferId} />
          </div>
          <div className="lg:col-span-2">
            <OfferInfo offer={offer} />
            {!isMobile && <OfferBottomBar offer={offer} />}
          </div>
        </div>
      </main>

      {isMobile && <OfferBottomBar offer={offer} />}
    </div>
  );
};

export default OfferDetailScreen;
