
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

export async function createDailyOfferNotification(
  userId: string,
  offerTitle: string,
  offerStore: string,
  offerId: string,
  savings?: string
): Promise<boolean> {
  const message = savings ? 
    `${offerTitle} - Save ${savings}!` : 
    offerTitle || 'Amazing deal just for you!';

  return createNotification({
    userId,
    title: `Daily Deal from ${offerStore}`,
    message,
    type: 'offer',
    offerId
  });
}

// Bulk notification functions for system use
export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications.map(notif => ({
        user_id: notif.userId || null,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        offer_id: notif.offerId || null
      })));

    if (error) {
      console.error('Error creating bulk notifications:', error);
      return 0;
    }

    // Handle the case where data might be null
    return Array.isArray(data) ? data.length : (data ? 1 : 0);
  } catch (error) {
    console.error('Exception creating bulk notifications:', error);
    return 0;
  }
}

export async function scheduleOfferExpiryNotifications(): Promise<boolean> {
  try {
    // Get offers expiring in 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: expiringOffers, error: offersError } = await supabase
      .from('Offers_data')
      .select('lmd_id, title, store, end_date')
      .eq('end_date', tomorrowStr)
      .not('title', 'is', null);

    if (offersError) {
      console.error('Error fetching expiring offers:', offersError);
      return false;
    }

    if (!expiringOffers || expiringOffers.length === 0) {
      console.log('No offers expiring tomorrow');
      return true;
    }

    // Get all users with preferences or saved offers
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .not('id', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return false;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users found');
      return true;
    }

    // Create expiry notifications for each user for each expiring offer
    const notifications: CreateNotificationParams[] = [];

    for (const offer of expiringOffers) {
      for (const profile of profiles) {
        notifications.push({
          userId: profile.id,
          title: 'Offer expiring soon!',
          message: `${offer.title} from ${offer.store} expires tomorrow`,
          type: 'expiry',
          offerId: `offer-${offer.lmd_id}`
        });
      }
    }

    if (notifications.length > 0) {
      const created = await createBulkNotifications(notifications);
      console.log(`Created ${created} expiry notifications`);
    }

    return true;
  } catch (error) {
    console.error('Error scheduling expiry notifications:', error);
    return false;
  }
}
