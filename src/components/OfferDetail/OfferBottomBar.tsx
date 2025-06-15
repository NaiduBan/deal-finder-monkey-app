
import { useIsMobile } from '@/hooks/use-mobile';
import { Offer } from '@/types';
import { Button } from '@/components/ui/button';
import { useOfferActions } from '@/hooks/use-offer-actions';

const OfferBottomBar = ({ offer }: { offer: Offer }) => {
  const isMobile = useIsMobile();
  const { handlePrimaryAction } = useOfferActions(offer);

  const buttonText = offer.code ? 'Copy Code & Visit Site' : 'Get This Deal';

  const button = (
    <Button
      className={`w-full ${isMobile ? 'h-12' : 'h-14 text-lg'} bg-spring-green-600 hover:bg-spring-green-700 text-white font-semibold`}
      onClick={handlePrimaryAction}
    >
      {buttonText}
    </Button>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-[56px] left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t z-20">
        {button}
      </div>
    );
  }

  return (
    <div className="pt-4">
      {button}
    </div>
  );
};

export default OfferBottomBar;
