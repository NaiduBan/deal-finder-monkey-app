// Complete mock database for the application
import { Offer, Category, User, BannerItem, CuelinkOffer, DealPost, LeaderboardMember } from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "john@example.com",
    name: "John Doe",
    phone: "+1234567890",
    location: "New York, NY",
    savedOffers: ["1", "3"],
    points: 1250
  },
  {
    id: "user-2",
    email: "jane@example.com",
    name: "Jane Smith",
    phone: "+1234567891",
    location: "Los Angeles, CA",
    savedOffers: ["2"],
    points: 850
  }
];

// Mock Categories
export const mockCategories: Category[] = [
  { id: "1", name: "Electronics", icon: "📱" },
  { id: "2", name: "Fashion", icon: "👕" },
  { id: "3", name: "Home & Garden", icon: "🏠" },
  { id: "4", name: "Sports", icon: "⚽" },
  { id: "5", name: "Beauty", icon: "💄" },
  { id: "6", name: "Food & Dining", icon: "🍕" },
  { id: "7", name: "Travel", icon: "✈️" },
  { id: "8", name: "Books", icon: "📚" }
];

// Mock Offers
export const mockOffers: Offer[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max - 50% Off",
    description: "Get the latest iPhone with incredible discount. Limited time offer!",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    store: "Apple Store",
    category: "Electronics",
    price: 599,
    originalPrice: 1199,
    expiryDate: "2024-12-31",
    isAmazon: false,
    affiliateLink: "https://apple.com/iphone-15-pro",
    terms: "Limited time offer. While supplies last.",
    savings: 600,
    lmdId: 12345,
    merchantHomepage: "https://apple.com",
    longOffer: "Get the latest iPhone 15 Pro Max with incredible 50% discount",
    code: "IPHONE50",
    termsAndConditions: "Valid for new customers only",
    featured: true,
    publisherExclusive: false,
    sponsored: false,
    url: "https://apple.com/iphone-15-pro",
    smartlink: "https://smartlink.apple.com/iphone15",
    offerType: "percentage",
    offerValue: "50%",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    categories: "Electronics"
  },
  {
    id: "2",
    title: "Nike Air Max - Buy 2 Get 1 Free",
    description: "Premium sneakers with amazing comfort. Perfect for sports and casual wear.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    store: "Nike",
    category: "Fashion",
    price: 89,
    originalPrice: 129,
    expiryDate: "2024-11-30",
    isAmazon: false,
    affiliateLink: "https://nike.com/air-max",
    terms: "Buy 2 Get 1 Free promotion",
    savings: 40,
    lmdId: 12346,
    merchantHomepage: "https://nike.com",
    longOffer: "Premium Nike Air Max sneakers with amazing comfort",
    code: "NIKE31",
    termsAndConditions: "Valid on selected styles only",
    featured: true,
    publisherExclusive: false,
    sponsored: false,
    url: "https://nike.com/air-max",
    smartlink: "https://smartlink.nike.com/airmax",
    offerType: "bogo",
    offerValue: "Buy 2 Get 1 Free",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-11-30",
    categories: "Fashion"
  },
  {
    id: "3",
    title: "Samsung 4K Smart TV - 40% Off",
    description: "Ultra HD Smart TV with HDR support. Transform your entertainment experience.",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
    store: "Samsung",
    category: "Electronics",
    price: 599,
    originalPrice: 999,
    expiryDate: "2024-12-15",
    isAmazon: false,
    affiliateLink: "https://samsung.com/tv",
    terms: "40% off on 4K Smart TVs",
    savings: 400,
    lmdId: 12347,
    merchantHomepage: "https://samsung.com",
    longOffer: "Ultra HD Smart TV with HDR support",
    code: "SAMSUNG40",
    termsAndConditions: "Limited time offer",
    featured: false,
    publisherExclusive: false,
    sponsored: false,
    url: "https://samsung.com/tv",
    smartlink: "https://smartlink.samsung.com/tv",
    offerType: "percentage",
    offerValue: "40%",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-15",
    categories: "Electronics"
  }
];

// Mock Cuelink Offers
export const mockCuelinkOffers: CuelinkOffer[] = [
  {
    Id: 1,
    Title: "Amazon Prime Day - Up to 70% Off",
    Description: "Massive discounts on electronics, fashion, and more during Prime Day.",
    'Image URL': "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400",
    Merchant: "Amazon",
    Categories: "Electronics",
    Terms: "Prime membership required",
    'Campaign Name': "Prime Day Sale",
    'Campaign ID': 12345,
    'Offer Added At': "2024-01-15T10:00:00Z",
    'End Date': "2024-12-01",
    'Start Date': "2024-01-01",
    Status: "active",
    URL: "https://amazon.com/prime-day",
    'Coupon Code': "PRIME70"
  },
  {
    Id: 2,
    Title: "Flipkart Big Billion Days",
    Description: "India's biggest shopping festival with unbeatable deals.",
    'Image URL': "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    Merchant: "Flipkart",
    Categories: "Fashion",
    Terms: "Valid on selected items",
    'Campaign Name': "Big Billion Days",
    'Campaign ID': 12346,
    'Offer Added At': "2024-01-10T08:00:00Z",
    'End Date': "2024-11-25",
    'Start Date': "2024-01-01",
    Status: "active",
    URL: "https://flipkart.com/big-billion-days",
    'Coupon Code': "BBD50"
  }
];

// Mock Banners
export const mockBanners: BannerItem[] = [
  {
    id: "banner-1",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    title: "Black Friday Mega Sale",
    link: "/offers/black-friday"
  },
  {
    id: "banner-2",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    title: "Holiday Shopping Guide",
    link: "/categories/gifts"
  },
  {
    id: "banner-3",
    imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    title: "Electronics Clearance",
    link: "/categories/electronics"
  }
];

// Mock Deal Posts for Social Shopping
export const mockDealPosts: DealPost[] = [
  {
    id: 1,
    user: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    dealTitle: "iPhone 15 Pro Max - 50% Off",
    description: "Just got this amazing deal on the new iPhone! The discount is incredible. #TechDeals #iPhone",
    likes: 45,
    comments: 12,
    shares: 8,
    verified: true,
    rating: 4.8,
    timeAgo: "2 hours ago",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    store: "Apple Store",
    originalPrice: "$1199",
    discountedPrice: "$599",
    discount: "50% OFF",
    category: "Electronics",
    isLiked: false
  },
  {
    id: 2,
    user: "Jane Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    dealTitle: "Nike Air Max - Buy 2 Get 1 Free",
    description: "Perfect timing for my fitness journey! These sneakers are so comfortable. 👟 #Fitness #Nike",
    likes: 32,
    comments: 7,
    shares: 5,
    verified: true,
    rating: 4.6,
    timeAgo: "4 hours ago",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    store: "Nike",
    originalPrice: "$129",
    discountedPrice: "$89",
    discount: "31% OFF",
    category: "Fashion",
    isLiked: true
  }
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardMember[] = [
  {
    id: "user-1",
    name: "John Doe",
    points: 1250,
    deals: 45,
    rank: 1,
    badge: "Gold",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    savings: "$15,600",
    level: "Gold"
  },
  {
    id: "user-2",
    name: "Jane Smith",
    points: 850,
    deals: 32,
    rank: 2,
    badge: "Silver",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    savings: "$9,800",
    level: "Silver"
  },
  {
    id: "user-3",
    name: "Mike Johnson",
    points: 650,
    deals: 28,
    rank: 3,
    badge: "Bronze",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    savings: "$7,200",
    level: "Bronze"
  }
];

// Mock Notifications
export const mockNotifications = [
  {
    id: "notif-1",
    user_id: "user-1",
    title: "New Deal Alert!",
    message: "iPhone 15 Pro Max is now 50% off. Don't miss out!",
    type: "offer",
    offer_id: "1",
    is_read: false,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "notif-2",
    user_id: "user-1",
    title: "Deal Expiring Soon",
    message: "Your saved Samsung TV deal expires in 2 days.",
    type: "expiry",
    offer_id: "3",
    is_read: false,
    created_at: "2024-01-14T09:30:00Z"
  }
];

// Mock Saved Offers
export const mockSavedOffers = [
  { id: "save-1", user_id: "user-1", offer_id: "1", created_at: "2024-01-15T10:00:00Z" },
  { id: "save-2", user_id: "user-1", offer_id: "3", created_at: "2024-01-14T08:00:00Z" },
  { id: "save-3", user_id: "user-2", offer_id: "2", created_at: "2024-01-13T14:00:00Z" }
];

// Mock Comments
export const mockComments = [
  {
    id: "comment-1",
    post_id: "post-1",
    user_id: "user-2",
    user_name: "Jane Smith",
    user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    content: "This is an amazing deal! Thanks for sharing!",
    likes_count: 5,
    created_at: "2024-01-15T11:00:00Z",
    is_liked: false
  },
  {
    id: "comment-2",
    post_id: "post-1",
    user_id: "user-3",
    user_name: "Mike Johnson",
    user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    content: "Just ordered one! 📱",
    likes_count: 3,
    created_at: "2024-01-15T11:30:00Z",
    is_liked: true
  }
];

// In-memory storage for dynamic data
export class MockDatabase {
  private static instance: MockDatabase;
  
  public users = [...mockUsers];
  public categories = [...mockCategories];
  public offers = [...mockOffers];
  public cuelinkOffers = [...mockCuelinkOffers];
  public banners = [...mockBanners];
  public dealPosts = [...mockDealPosts];
  public leaderboard = [...mockLeaderboard];
  public notifications = [...mockNotifications];
  public savedOffers = [...mockSavedOffers];
  public comments = [...mockComments];

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Helper methods for data manipulation
  addOffer(offer: Offer) {
    this.offers.push(offer);
  }

  updateOffer(id: string, updates: Partial<Offer>) {
    const index = this.offers.findIndex(o => o.id === id);
    if (index !== -1) {
      this.offers[index] = { ...this.offers[index], ...updates };
    }
  }

  deleteOffer(id: string) {
    this.offers = this.offers.filter(o => o.id !== id);
  }

  addUser(user: User) {
    this.users.push(user);
  }

  updateUser(id: string, updates: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
    }
  }

  saveOffer(userId: string, offerId: string) {
    const existing = this.savedOffers.find(s => s.user_id === userId && s.offer_id === offerId);
    if (!existing) {
      this.savedOffers.push({
        id: `save-${Date.now()}`,
        user_id: userId,
        offer_id: offerId,
        created_at: new Date().toISOString()
      });
    }
  }

  unsaveOffer(userId: string, offerId: string) {
    this.savedOffers = this.savedOffers.filter(s => !(s.user_id === userId && s.offer_id === offerId));
  }

  addNotification(notification: any) {
    this.notifications.unshift(notification);
  }

  markNotificationAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.is_read = true;
    }
  }
}