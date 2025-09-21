// Mock replacement for supabaseService
import { mockDatabase } from '@/data/mockDatabase';

export const supabaseService = {
  getBanners: async () => {
    return mockDatabase.banners;
  },
  
  getGroupBuys: async () => {
    return mockDatabase.groupBuys || [];
  },
  
  getDealPosts: async () => {
    return mockDatabase.socialPosts || [];
  },
  
  getLeaderboard: async () => {
    return mockDatabase.leaderboard || [];
  }
};

export const fetchAllBanners = async () => mockDatabase.banners;
export const createBanner = async (banner: any) => ({ ...banner, id: Date.now().toString() });
export const updateBanner = async (id: string, banner: any) => ({ ...banner, id });
export const deleteBanner = async (id: string) => ({ success: true });
export const uploadImage = async (file: File) => ({ url: '/placeholder.png' });

export const fetchSocialDealPosts = async () => mockDatabase.socialPosts || [];
export const fetchSocialLeaderboard = async () => mockDatabase.leaderboard || [];

export default supabaseService;