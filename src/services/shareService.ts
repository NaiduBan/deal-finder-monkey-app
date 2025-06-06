
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from './analyticsService';

export const shareDeal = async (offerId: string, shareMethod: 'social' | 'link' | 'email', shareTo?: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (session?.session?.user) {
      await supabase
        .from('deal_shares')
        .insert({
          user_id: session.session.user.id,
          offer_id: offerId,
          shared_via: shareMethod,
          shared_to: shareTo
        });
    }

    // Track analytics
    await trackEvent({
      offer_id: offerId,
      event_type: 'share',
      metadata: { method: shareMethod, shared_to: shareTo }
    });

    return true;
  } catch (error) {
    console.error('Error sharing deal:', error);
    return false;
  }
};

export const generateShareLink = (offerId: string, title: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/offer/${offerId}?utm_source=share&utm_medium=social&utm_campaign=deal_share`;
};

export const shareToSocialMedia = async (offerId: string, title: string, platform: string) => {
  const shareUrl = generateShareLink(offerId, title);
  const text = `Check out this amazing deal: ${title}`;
  
  let url = '';
  
  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      break;
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      break;
    case 'whatsapp':
      url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
      break;
    case 'telegram':
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
      break;
    default:
      return false;
  }
  
  window.open(url, '_blank', 'width=600,height=400');
  await shareDeal(offerId, 'social', platform);
  return true;
};

export const copyShareLink = async (offerId: string, title: string) => {
  try {
    const shareUrl = generateShareLink(offerId, title);
    await navigator.clipboard.writeText(shareUrl);
    await shareDeal(offerId, 'link');
    return shareUrl;
  } catch (error) {
    console.error('Error copying share link:', error);
    return null;
  }
};
