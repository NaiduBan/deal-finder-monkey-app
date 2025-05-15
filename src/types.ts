
export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  store: string;
  category: string;
  price: number;
  originalPrice: number;
  expiryDate: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  isAmazon: boolean;
  affiliateLink?: string;
  terms?: string;
  savings: number | string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  location: string;
  preferences: {
    brands: string[];
    stores: string[];
    banks: string[];
  };
  savedOffers: string[];
  points: number;
}

export interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  link: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
