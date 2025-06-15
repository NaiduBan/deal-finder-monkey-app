
import { useToast } from '@/hooks/use-toast';
import { Offer } from '@/types';

export const useOfferActions = (offer: Offer) => {
  const { toast } = useToast();

  const copyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      toast({
        title: 'Code copied!',
        description: `Code ${offer.code} copied to clipboard`,
      });
    }
  };

  const handleVisitLink = () => {
    const link = offer.smartlink || offer.url || offer.merchantHomepage;
    if (link) {
      window.open(link, '_blank');
    }
  };

  const handlePrimaryAction = () => {
    const link = offer.smartlink || offer.url || offer.merchantHomepage;
    if (offer.code) {
      copyCode();
      if (link) {
        toast({
          title: 'Redirecting...',
          description: `Visiting ${offer.store}'s website now.`,
        });
        setTimeout(() => {
          handleVisitLink();
        }, 500);
      }
    } else {
      if (link) {
        handleVisitLink();
        toast({
          title: 'Opening link',
          description: `Redirecting to ${offer.store}'s website`,
        });
      }
    }
  };

  return { copyCode, handleVisitLink, handlePrimaryAction };
};
