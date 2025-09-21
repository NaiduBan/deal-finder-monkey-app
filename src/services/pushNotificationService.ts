// Mock push notification service
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
}

export const pushNotificationService = {
  requestPermission: async (): Promise<NotificationPermission> => {
    console.log('Mock: Push notification permission requested');
    return 'granted';
  },
  
  sendNotification: async (message: string) => {
    console.log('Mock: Push notification sent:', message);
    return { success: true };
  },

  subscribeToNotifications: async () => {
    console.log('Mock: Subscribed to push notifications');
    return { success: true };
  },

  unsubscribeFromNotifications: async () => {
    console.log('Mock: Unsubscribed from push notifications');
    return { success: true };
  },

  initialize: async () => {
    console.log('Mock: Push notifications initialized');
    return { success: true };
  },

  isSubscribed: async () => {
    console.log('Mock: Checking subscription status');
    return false;
  },

  subscribeToPush: async () => {
    console.log('Mock: Subscribing to push');
    return { success: true };
  },

  unsubscribeFromPush: async () => {
    console.log('Mock: Unsubscribing from push');
    return { success: true };
  }
};

export { NotificationPayload };
export default pushNotificationService;