
import { useState, useEffect } from 'react';
import { pushNotificationService, NotificationPayload } from '@/services/pushNotificationService';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showTestNotification: (payload: NotificationPayload) => void;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if notifications are supported
      const supported = ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
      setIsSupported(supported);

      if (!supported) {
        return;
      }

      // Get current permission
      setPermission(Notification.permission);

      // Initialize push service
      const initialized = await pushNotificationService.initialize();
      if (initialized) {
        const subscribed = await pushNotificationService.isSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    initializeNotifications();
  }, []);

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await pushNotificationService.requestPermission();
        setPermission(newPermission);
        
        if (newPermission !== 'granted') {
          console.warn('Push notification permission denied');
          return false;
        }
      }

      // Subscribe to push notifications
      const subscription = await pushNotificationService.subscribeToPush();
      const success = !!subscription;
      setIsSubscribed(success);

      if (success) {
        console.log('Successfully subscribed to push notifications');
        
        // Show welcome notification
        pushNotificationService.showLocalNotification({
          title: 'OffersMonkey Notifications Enabled! 🎉',
          message: 'You\'ll now receive notifications about flash deals and personalized offers',
          icon: 'https://offersmonkey.com/favicon.ico',
          url: '/home'
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const success = await pushNotificationService.unsubscribeFromPush();
      setIsSubscribed(!success);
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const showTestNotification = (payload: NotificationPayload): void => {
    if (permission === 'granted') {
      pushNotificationService.showLocalNotification(payload);
    } else {
      console.warn('Cannot show notification: permission not granted');
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    showTestNotification
  };
};
