
export interface Offer {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  store: string | null;
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
  // Fields from the Data table structure
  lmdId: number;
  merchantHomepage: string | null;
  longOffer: string | null;
  code: string | null;
  termsAndConditions: string | null;
  featured: boolean;
  publisherExclusive: boolean;
  url: string | null;
  smartlink: string | null;
  offerType: string | null;
  offerValue: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  categories: string | null;
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
