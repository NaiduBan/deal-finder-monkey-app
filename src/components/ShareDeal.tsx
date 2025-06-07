
import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { shareOffer } from '@/services/shareService';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export interface ShareDealProps {
  offerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDeal = ({ offerId, isOpen, onClose }: ShareDealProps) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { offers } = useData();
  const [isSharing, setIsSharing] = useState(false);

  const offer = offers.find(o => o.id === offerId);

  if (!isOpen || !offer) return null;

  const shareUrl = `${window.location.origin}/offer/${offerId}`;
  const shareText = `Check out this amazing deal: ${offer.title} - ${offer.description}`;

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    try {
      if (session?.user) {
        await shareOffer(offerId, session.user.id, platform);
      }
      
      let shareLink = '';
      
      switch (platform) {
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
          break;
        case 'telegram':
          shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
        case 'email':
          shareLink = `mailto:?subject=${encodeURIComponent(offer.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: 'Link Copied!',
            description: 'Deal link has been copied to your clipboard.',
          });
          onClose();
          return;
      }
      
      if (shareLink) {
        window.open(shareLink, '_blank');
      }
      
      toast({
        title: 'Deal Shared!',
        description: `Deal shared successfully via ${platform}.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error sharing deal:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share deal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-xl sm:rounded-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share This Deal</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm mb-1">{offer.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{offer.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare('whatsapp')}
            disabled={isSharing}
            className="flex flex-col items-center p-4 h-auto"
          >
            <MessageCircle className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('telegram')}
            disabled={isSharing}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Share2 className="w-6 h-6 mb-2 text-blue-500" />
            <span className="text-xs">Telegram</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('email')}
            disabled={isSharing}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Mail className="w-6 h-6 mb-2 text-red-500" />
            <span className="text-xs">Email</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('copy')}
            disabled={isSharing}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Copy className="w-6 h-6 mb-2 text-gray-600" />
            <span className="text-xs">Copy Link</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareDeal;
