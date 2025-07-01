
import { supabase } from "@/integrations/supabase/client";
import { pushNotificationService } from './pushNotificationService';

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

    // Send push notification if user is subscribed
    if (userId) {
      await sendPushNotification(userId, title, message, type, offerId);
    }

    return true;
  } catch (error) {
    console.error('Exception creating notification:', error);
    return false;
  }
}

async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  offerId?: string
): Promise<void> {
  try {
    // Check if user has push notifications enabled
    const isSubscribed = await pushNotificationService.isSubscribed();
    
    if (!isSubscribed) {
      console.log('User not subscribed to push notifications');
      return;
    }

    // Determine notification URL based on type
    let url = '/home';
    if (offerId && type === 'offer') {
      url = `/offer/${offerId.replace('offer-', '')}`;
    } else if (type === 'preference') {
      url = '/preferences';
    }

    // Show local push notification
    pushNotificationService.showLocalNotification({
      title,
      message,
      icon: 'https://offersmonkey.com/favicon.ico',
      url,
      type: type as any
    });

  } catch (error) {
    console.error('Failed to send push notification:', error);
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
    title: `🎯 New offer from ${offerStore}`,
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
    title: '⏰ Offer expiring soon!',
    message: `${offerTitle} expires in 24 hours`,
    type: 'expiry',
    offerId
  });
}

export async function createFlashDealNotification(
  userId: string,
  offerTitle: string,
  offerStore: string,
  offerId: string,
  savings?: string
): Promise<boolean> {
  const message = savings ? 
    `⚡ FLASH DEAL: ${offerTitle} - Save ${savings}! Limited time only.` : 
    `⚡ FLASH DEAL: ${offerTitle} - Don't miss out!`;

  return createNotification({
    userId,
    title: `🔥 Flash Deal Alert!`,
    message,
    type: 'offer',
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
    title: '💝 New offers matching your preferences',
    message: `We found new offers for ${preferenceValue} in your ${preferenceType}`,
    type: 'preference'
  });
}

export async function createSystemNotification(
  title: string,
  message: string,
  userId?: string
): Promise<boolean> {
  try {
    if (userId) {
      // Send to specific user
      return createNotification({
        userId,
        title,
        message,
        type: 'system'
      });
    } else {
      // Send to all users - get all user IDs first
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id');

      if (error) {
        console.error('Error fetching profiles for system notification:', error);
        return false;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No users found for system notification');
        return true;
      }

      // Create notifications for all users
      const notifications = profiles.map(profile => ({
        user_id: profile.id,
        title,
        message,
        type: 'system' as const,
        offer_id: null
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating system notifications:', insertError);
        return false;
      }

      // Send push notifications to current user only (to avoid spam)
      pushNotificationService.showLocalNotification({
        title,
        message,
        icon: 'https://offersmonkey.com/favicon.ico',
        url: '/home',
        type: 'general'
      });

      console.log(`Created system notification for ${profiles.length} users`);
      return true;
    }
  } catch (error) {
    console.error('Exception creating system notification:', error);
    return false;
  }
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
    title: `🌅 Daily Deal from ${offerStore}`,
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
      })))
      .select();

    if (error) {
      console.error('Error creating bulk notifications:', error);
      return 0;
    }

    if (!data) {
      return 0;
    }

    return data.length;
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
          title: '⏰ Offer expiring soon!',
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

// Auto-trigger flash deal notifications for high-value offers
export async function triggerFlashDealNotifications(): Promise<void> {
  try {
    console.log('Checking for new flash deals to notify about...');
    
    // Get recent high-value offers (example criteria)
    const { data: flashDeals, error } = await supabase
      .from('Offers_data')
      .select('lmd_id, title, store, offer_value, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('offer_value', 'is', null)
      .limit(10);

    if (error) {
      console.error('Error fetching flash deals:', error);
      return;
    }

    if (!flashDeals?.length) {
      console.log('No new flash deals found');
      return;
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id');

    if (usersError || !users?.length) {
      console.log('No users found for flash deal notifications');
      return;
    }

    // Send flash deal notifications
    for (const deal of flashDeals) {
      for (const user of users) {
        await createFlashDealNotification(
          user.id,
          deal.title,
          deal.store,
          `offer-${deal.lmd_id}`,
          deal.offer_value
        );
      }
    }

    console.log(`Sent flash deal notifications for ${flashDeals.length} deals to ${users.length} users`);
  } catch (error) {
    console.error('Error triggering flash deal notifications:', error);
  }
}
