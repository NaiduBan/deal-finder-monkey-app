// Mock notification service
export const notificationService = {
  sendDailyNotifications: async () => {
    console.log('Mock: Daily notifications sent');
    return { success: true };
  },
  
  sendHourlyNotifications: async () => {
    console.log('Mock: Hourly notifications sent');
    return { success: true };
  },
  
  sendPreferenceNotifications: async () => {
    console.log('Mock: Preference notifications sent');
    return { success: true };
  },
  
  scheduleNotification: async (message: string, delay: number) => {
    console.log(`Mock: Scheduled notification "${message}" with ${delay}ms delay`);
    return { success: true };
  },

  createNotification: async (notification: any) => {
    console.log('Mock: Created notification', notification);
    return { success: true };
  },

  createBulkNotifications: async (notifications: any[]) => {
    console.log('Mock: Created bulk notifications', notifications.length);
    return { success: true };
  },

  createFlashDealNotification: async (offer: any) => {
    console.log('Mock: Created flash deal notification', offer);
    return { success: true };
  },

  createSystemNotification: async (message: string) => {
    console.log('Mock: Created system notification', message);
    return { success: true };
  }
};

export default notificationService;