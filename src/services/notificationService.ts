
import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  userId?: string;
  title: string;
  message: string;
  type: 'offer' | 'expiry' | 'system' | 'preference';
  offerId?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  offerId
}: CreateNotificationParams): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId || null,
        title,
        message,
        type,
        offer_id: offerId || null
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception creating notification:', error);
    return false;
  }
}

export async function createOfferNotification(
  userId: string,
  offerTitle: string,
  offerStore: string,
  offerId: string
): Promise<boolean> {
  return createNotification({
    userId,
    title: `New offer from ${offerStore}`,
    message: offerTitle || 'Check out this new offer!',
    type: 'offer',
    offerId
  });
}

export async function createExpiryNotification(
  userId: string,
  offerTitle: string,
  offerId: string
): Promise<boolean> {
  return createNotification({
    userId,
    title: 'Offer expiring soon!',
    message: `${offerTitle} expires in 24 hours`,
    type: 'expiry',
    offerId
  });
}

export async function createPreferenceMatchNotification(
  userId: string,
  preferenceType: string,
  preferenceValue: string
): Promise<boolean> {
  return createNotification({
    userId,
    title: 'New offers matching your preferences',
    message: `We found new offers for ${preferenceValue} in your ${preferenceType}`,
    type: 'preference'
  });
}

export async function createSystemNotification(
  title: string,
  message: string,
  userId?: string
): Promise<boolean> {
  return createNotification({
    userId,
    title,
    message,
    type: 'system'
  });
}
