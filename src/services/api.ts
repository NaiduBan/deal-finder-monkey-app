
import { Offer } from '@/types';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.104:5000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to convert API data to our app's Offer type
const mapApiOfferToAppOffer = (apiOffer: any): Offer => {
  // Parse the offer_value string to get numerical values
  let price = 0;
  let originalPrice = 0;
  let savings = "";
  
  // Try to extract price information from offer_value
  if (apiOffer.offer_value && apiOffer.offer_value !== "Free") {
    const discountMatch = apiOffer.offer_value.match(/(\d+)%/);
    if (discountMatch) {
      savings = `${discountMatch[1]}%`;
      // Set dummy prices for percentage discounts
      originalPrice = 100;
      price = originalPrice * (1 - (parseInt(discountMatch[1], 10) / 100));
    } else {
      // Try to extract rupee value
      const rupeeMatch = apiOffer.offer_value.match(/₹(\d+)/);
      if (rupeeMatch) {
        savings = `₹${rupeeMatch[1]}`;
        price = 100 - parseInt(rupeeMatch[1], 10);
        originalPrice = 100;
      } else {
        // Default values if we can't parse
        price = 49.99;
        originalPrice = 99.99;
        savings = apiOffer.offer_value || "Special";
      }
    }
  } else if (apiOffer.offer_value === "Free") {
    price = 0;
    originalPrice = 99.99;
    savings = "100%";
  }

  // Map categories string to first category for simplicity
  const categoryArray = apiOffer.categories ? apiOffer.categories.split(',') : [];
  const firstCategory = categoryArray.length > 0 ? 
    categoryArray[0].toLowerCase() : 'electronics';

  return {
    id: apiOffer.lmd_id || `offer-${Math.random().toString(36).substr(2, 9)}`,
    title: apiOffer.title || apiOffer.long_offer || "Special Offer",
    description: apiOffer.description || "",
    imageUrl: apiOffer.image_url || "/placeholder.svg",
    store: apiOffer.store || "Online Store",
    category: firstCategory,
    price: price,
    originalPrice: originalPrice,
    expiryDate: apiOffer.end_date || "2025-12-31",
    isAmazon: false,
    affiliateLink: apiOffer.smartlink || apiOffer.url || "",
    terms: apiOffer.terms_and_conditions || "",
    savings: savings
  };
};

export const apiService = {
  getOffers: async (): Promise<Offer[]> => {
    try {
      const response = await apiClient.get('/api/offers');
      return response.data.map(mapApiOfferToAppOffer);
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },
  
  getOfferById: async (id: string): Promise<Offer> => {
    try {
      // Since the API doesn't have a specific endpoint for single offer,
      // we'll fetch all and find the one we need
      const response = await apiClient.get('/api/offers');
      const offer = response.data.find((offer: any) => offer.lmd_id === id);
      
      if (!offer) {
        throw new Error('Offer not found');
      }
      
      return mapApiOfferToAppOffer(offer);
    } catch (error) {
      console.error(`Error fetching offer with ID ${id}:`, error);
      throw error;
    }
  }
};
