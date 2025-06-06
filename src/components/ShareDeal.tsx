
import React, { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { shareToSocialMedia, copyShareLink } from '@/services/shareService';

interface ShareDealProps {
  offerId: string;
  title: string;
  children?: React.ReactNode;
}

const ShareDeal: React.FC<ShareDealProps> = ({ offerId, title, children }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      const shareUrl = await copyShareLink(offerId, title);
      if (shareUrl) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link copied!",
          description: "Deal link has been copied to clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleSocialShare = async (platform: string) => {
    try {
      const success = await shareToSocialMedia(offerId, title, platform);
      if (success) {
        toast({
          title: "Deal shared!",
          description: `Deal shared on ${platform}`
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share deal",
        variant: "destructive"
      });
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      platform: 'whatsapp'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      platform: 'twitter'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      platform: 'facebook'
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'text-blue-500',
      platform: 'telegram'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this deal</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Copy Link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded-md text-sm text-gray-600 truncate">
                  {window.location.origin}/offer/{offerId}
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Social Media Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Share on social media</p>
                <div className="grid grid-cols-2 gap-2">
                  {shareOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={option.platform}
                        onClick={() => handleSocialShare(option.platform)}
                        variant="outline"
                        className="justify-start"
                      >
                        <IconComponent className={`w-4 h-4 mr-2 ${option.color}`} />
                        {option.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDeal;
