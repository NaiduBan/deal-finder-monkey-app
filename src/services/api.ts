// Mock API service to replace old api.ts
import { apiService } from './index';

export const api = {
  fetchBanners: apiService.fetchBanners,
  fetchOffers: apiService.fetchOffers,
  fetchCategories: apiService.fetchCategories,
  searchOffers: apiService.searchOffers
};

export const getBanners = apiService.fetchBanners;

export default api;