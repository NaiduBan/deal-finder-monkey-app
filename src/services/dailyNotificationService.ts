
import { supabase } from "@/integrations/supabase/client";

export interface DailyNotificationRecord {
  id: string;
  user_id: string;
  notification_date: string;
  offer_id?: string;
  email_sent: boolean;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserDailyNotifications(userId: string, days: number = 7): Promise<DailyNotificationRecord[]> {
  try {
    const { data, error } = await supabase
      .from('daily_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('notification_date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('Error fetching daily notifications:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserDailyNotifications:', error);
    return [];
  }
}

export async function triggerDailyNotifications(): Promise<boolean> {
  try {
    console.log('Triggering daily notifications...');
    
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-daily-notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'manual' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Daily notifications result:', result);
    
    return result.success || false;
  } catch (error) {
    console.error('Error triggering daily notifications:', error);
    return false;
  }
}

export async function hasReceivedTodaysNotification(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_notifications')
      .select('notification_sent')
      .eq('user_id', userId)
      .eq('notification_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking today\'s notification:', error);
      return false;
    }

    return data?.notification_sent || false;
  } catch (error) {
    console.error('Error in hasReceivedTodaysNotification:', error);
    return false;
  }
}
