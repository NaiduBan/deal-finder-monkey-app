
import { Bookmark, Share2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Offer } from '@/types';

const OfferActions = ({ offer }: { offer: Offer }) => {
  const { isOfferSaved, saveOffer, unsaveOffer } = useUser();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const isSaved = isOfferSaved(offer.id);

  const handleSave = () => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save offers",
        variant: "destructive"
      });
      return;
    }

    if (isSaved) {
      unsaveOffer(offer.id);
    } else {
      saveOffer(offer.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.title || 'Great Offer',
        text: offer.description || '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Offer link copied to clipboard',
      });
    }
  };

  return (
    <div className="absolute bottom-4 right-4 flex space-x-2">
      <button 
        onClick={handleSave}
        className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
      >
        <Bookmark 
          className={`w-5 h-5 transition-colors ${isSaved ? 'text-spring-green-500 fill-spring-green-500' : 'text-gray-600'}`} 
        />
      </button>
      <button 
        onClick={handleShare}
        className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
      >
        <Share2 className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default OfferActions;
