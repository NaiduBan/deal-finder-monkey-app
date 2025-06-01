
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  data?: any;
}

class PushNotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.permission = Notification.permission;
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }

  // Show a browser notification
  showNotification(data: NotificationData): void {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const notification = new Notification(data.title, {
      body: data.message,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: data.data,
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Check if notifications are supported and enabled
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Listen for new notifications from the database
  async setupRealtimeNotifications(userId: string): Promise<void> {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const notification = payload.new as any;
          
          this.showNotification({
            title: notification.title,
            message: notification.message,
            data: {
              notificationId: notification.id,
              type: notification.type,
              offerId: notification.offer_id,
              url: notification.offer_id ? `/offer/${notification.offer_id}` : '/notifications'
            }
          });
        }
      )
      .subscribe();

    console.log('Realtime notifications setup completed');
  }

  // Schedule local hourly notifications (fallback)
  scheduleHourlyNotifications(): void {
    // Clear any existing intervals
    const existingInterval = localStorage.getItem('hourlyNotificationInterval');
    if (existingInterval) {
      clearInterval(Number(existingInterval));
    }

    // Set up hourly notifications
    const interval = setInterval(() => {
      this.showNotification({
        title: '🐵 OffersMonkey',
        message: 'New deals are waiting for you! Check out the latest offers.',
        data: {
          url: '/home'
        }
      });
    }, 60 * 60 * 1000); // Every hour

    localStorage.setItem('hourlyNotificationInterval', interval.toString());
  }

  // Stop scheduled notifications
  stopScheduledNotifications(): void {
    const existingInterval = localStorage.getItem('hourlyNotificationInterval');
    if (existingInterval) {
      clearInterval(Number(existingInterval));
      localStorage.removeItem('hourlyNotificationInterval');
    }
  }
}

export const pushNotificationService = new PushNotificationService();

// Initialize notifications when the service is imported
export const initializeNotifications = async (userId?: string) => {
  if (!pushNotificationService.isSupported()) {
    console.log('Push notifications not supported');
    return false;
  }

  const hasPermission = await pushNotificationService.requestPermission();
  
  if (hasPermission && userId) {
    // Setup realtime listening for database notifications
    await pushNotificationService.setupRealtimeNotifications(userId);
    
    // Setup hourly local notifications as fallback
    pushNotificationService.scheduleHourlyNotifications();
  }

  return hasPermission;
};

export default pushNotificationService;
