// Mock services for missing dependencies
export const cuelinkService = {
  fetchCuelinkOffers: async () => [],
  syncCuelinkData: async () => ({ success: true })
};

export const pushNotificationService = {
  requestPermission: async () => ({ granted: true }),
  sendNotification: async (message: string) => ({ success: true })
};

export default { cuelinkService, pushNotificationService };