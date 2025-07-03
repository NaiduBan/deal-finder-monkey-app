
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
  sponsored: boolean;
  banner: boolean;
  url: string | null;
  smartlink: string | null;
  offerType: string | null;
  offerValue: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  categories: string | null;
}

export interface CuelinkOffer {
  Id: number;
  Title: string | null;
  Description: string | null;
  'Image URL': string | null;
  Merchant: string | null;
  Categories: string | null;
  Terms: string | null;
  'Campaign Name': string | null;
  'Campaign ID': number | null;
  'Offer Added At': string | null;
  'End Date': string | null;
  'Start Date': string | null;
  Status: string | null;
  URL: string | null;
  'Coupon Code': string | null;
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
  email: string;
  phone: string;
  location: string;
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

export interface GroupBuy {
  id: string;
  title: string;
  description: string;
  currentParticipants: number;
  targetParticipants: number;
  pricePerPerson: string;
  originalPrice: string;
  savings: string;
  endTime: string;
  organizer: string;
  category: string;
  location: string;
  imageUrl: string;
  tags: string[];
  isJoined: boolean;
}

export interface DealPost {
  id: number;
  user: string;
  avatar: string;
  dealTitle: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  rating: number;
  timeAgo: string;
  image: string;
  store: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  category: string;
  isLiked: boolean;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  points: number;
  deals: number;
  rank: number;
  badge: string;
  avatar: string;
  savings: string;
  level: string;
}
