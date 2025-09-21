// Mock API service to replace old api.ts
import { mockApiService } from './mockApiService';

export const api = {
  fetchBanners: mockApiService.fetchBanners,
  fetchOffers: mockApiService.fetchOffers,
  fetchCategories: mockApiService.fetchCategories,
  searchOffers: mockApiService.searchOffers
};

export default api;