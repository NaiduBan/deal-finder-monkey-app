import { Offer, Category, User, BannerItem } from "@/types";
import { mockOffers, mockCategories, mockUser } from "@/mockData";
import { fetchBanners as fetchBannersFromDb } from './supabaseService';

// Function to simulate API call delay
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Get all offers
export const getOffers = async (): Promise<Offer[]> => {
  await delay(500); // Simulate network delay
  return mockOffers;
};

// Get featured offers
export const getFeaturedOffers = async (): Promise<Offer[]> => {
  await delay(500); // Simulate network delay
  return mockOffers.filter(offer => offer.featured);
};

// Get offers by category
export const getOffersByCategory = async (categoryId: string): Promise<Offer[]> => {
  await delay(500); // Simulate network delay
  return mockOffers.filter(offer => offer.category.toLowerCase() === categoryId.toLowerCase());
};

// Get offer by ID
export const getOfferById = async (offerId: string): Promise<Offer | null> => {
  await delay(300); // Simulate network delay
  const offer = mockOffers.find(offer => offer.id === offerId);
  return offer || null;
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  await delay(300); // Simulate network delay
  return mockCategories;
};

// Get banner items
export const getBanners = async (): Promise<BannerItem[]> => {
  return await fetchBannersFromDb();
};

// Get user data
export const getUserData = async (userId: string): Promise<User | null> => {
  await delay(300); // Simulate network delay
  if (userId === mockUser.id) {
    return mockUser;
  }
  return null;
};

// Save offer to user favorites
export const saveOffer = async (userId: string, offerId: string): Promise<boolean> => {
  await delay(300); // Simulate network delay
  return true;
};

// Remove offer from user favorites
export const unsaveOffer = async (userId: string, offerId: string): Promise<boolean> => {
  await delay(300); // Simulate network delay
  return true;
};

// Search for offers
export const searchOffers = async (query: string): Promise<Offer[]> => {
  await delay(400); // Simulate network delay
  const lowercaseQuery = query.toLowerCase();
  return mockOffers.filter(
    offer => 
      offer.title?.toLowerCase().includes(lowercaseQuery) || 
      offer.description?.toLowerCase().includes(lowercaseQuery) ||
      offer.store?.toLowerCase().includes(lowercaseQuery)
  );
};

// Simulated API function for creating/adding a new offer
export const addOffer = async (offerData: Partial<Offer>): Promise<Offer> => {
  await delay(500); // Simulate network delay
  
  // Create a new offer with the provided data and fill in defaults where needed
  const newOffer: Offer = {
    id: `offer${Date.now()}`,
    title: offerData.title || "",
    description: offerData.description || "",
    imageUrl: offerData.imageUrl || "/placeholder.svg",
    store: offerData.store || "",
    category: offerData.category || "",
    price: offerData.price || 0,
    originalPrice: offerData.originalPrice || 0,
    expiryDate: offerData.expiryDate || new Date().toISOString(),
    isAmazon: offerData.isAmazon || false,
    affiliateLink: offerData.affiliateLink || "",
    terms: offerData.terms || "",
    savings: offerData.savings || "0%",
    location: offerData.location,
    // Add the additional fields required by the Offer interface
    lmdId: offerData.lmdId || Math.floor(Math.random() * 10000),
    merchantHomepage: offerData.merchantHomepage || null,
    longOffer: offerData.longOffer || null,
    code: offerData.code || null,
    termsAndConditions: offerData.termsAndConditions || null,
    featured: offerData.featured || false,
    publisherExclusive: offerData.publisherExclusive || false,
    sponsored: offerData.sponsored || false,
    url: offerData.url || null,
    smartlink: offerData.smartlink || null,
    offerType: offerData.offerType || null,
    offerValue: offerData.offerValue || null,
    status: offerData.status || "active",
    startDate: offerData.startDate || null,
    endDate: offerData.endDate || null,
    categories: offerData.categories || null
  };
  
  return newOffer;
};
