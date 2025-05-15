
import { Offer, Category, User, BannerItem } from "./types";

export const mockCategories: Category[] = [
  {
    id: "supermarket",
    name: "Supermarket",
    icon: "shopping-cart",
    subcategories: ["Groceries", "Bakery", "Dairy", "Meat"]
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "laptop",
    subcategories: ["Phones", "Laptops", "TVs", "Audio"]
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "shopping-bag",
    subcategories: ["Men", "Women", "Kids", "Accessories"]
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "home",
    subcategories: ["Living Room", "Bedroom", "Office", "Kitchen"]
  },
  {
    id: "jewelry",
    name: "Jewelry",
    icon: "gem",
    subcategories: ["Rings", "Necklaces", "Earrings", "Watches"]
  },
  {
    id: "online",
    name: "Online",
    icon: "globe",
    subcategories: ["Amazon", "eBay", "Walmart", "Target"]
  }
];

export const mockOffers: Offer[] = [
  {
    id: "offer1",
    title: "50% Off Fresh Produce",
    description: "Get 50% off all fresh fruits and vegetables this weekend only!",
    imageUrl: "/placeholder.svg",
    store: "Whole Foods",
    category: "supermarket",
    price: 49.99,
    originalPrice: 99.99,
    expiryDate: "2025-06-01",
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: "123 Market St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "Limited to in-store purchases only. Cannot be combined with other offers.",
    savings: "50%"
  },
  {
    id: "offer2",
    title: "Samsung Galaxy S23 Ultra",
    description: "Save $200 on the new Samsung Galaxy S23 Ultra with any trade-in",
    imageUrl: "/placeholder.svg",
    store: "Best Buy",
    category: "electronics",
    price: 999.99,
    originalPrice: 1199.99,
    expiryDate: "2025-05-30",
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: "1717 Harrison St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "Requires eligible trade-in. In-store only.",
    savings: "$200"
  },
  {
    id: "offer3",
    title: "Nike Air Max - 30% Off",
    description: "Limited time offer on all Nike Air Max models",
    imageUrl: "/placeholder.svg",
    store: "Foot Locker",
    category: "fashion",
    price: 89.99,
    originalPrice: 129.99,
    expiryDate: "2025-05-25",
    location: {
      lat: 37.7837,
      lng: -122.4090,
      address: "865 Market St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "While supplies last. Select models only.",
    savings: "30%"
  },
  {
    id: "offer4",
    title: "Amazon Echo Dot",
    description: "Echo Dot (5th Gen) smart speaker with Alexa",
    imageUrl: "/placeholder.svg",
    store: "Amazon",
    category: "electronics",
    price: 34.99,
    originalPrice: 49.99,
    expiryDate: "2025-06-10",
    isAmazon: true,
    affiliateLink: "https://amazon.com/dp/B09B8V1LZ3?tag=offersmonkey0e-21",
    savings: "30%"
  },
  {
    id: "offer5",
    title: "Modern Leather Sofa",
    description: "Italian genuine leather sofa with 40% discount",
    imageUrl: "/placeholder.svg",
    store: "Ashley HomeStore",
    category: "furniture",
    price: 899.99,
    originalPrice: 1499.99,
    expiryDate: "2025-06-15",
    location: {
      lat: 37.7739,
      lng: -122.4037,
      address: "2501 Mariposa St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "Floor models only. Delivery fees apply.",
    savings: "40%"
  },
  {
    id: "offer6",
    title: "Gold Ring with Diamonds",
    description: "14k Gold Ring with 0.5ct diamonds - Special Sale",
    imageUrl: "/placeholder.svg",
    store: "Tiffany & Co.",
    category: "jewelry",
    price: 1299.99,
    originalPrice: 1999.99,
    expiryDate: "2025-05-31",
    location: {
      lat: 37.7878,
      lng: -122.4058,
      address: "845 Market St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "In-store only. Certificate of authenticity included.",
    savings: "35%"
  },
  {
    id: "offer7",
    title: "Fire TV Stick 4K",
    description: "Stream in 4K with the latest Fire TV Stick",
    imageUrl: "/placeholder.svg",
    store: "Amazon",
    category: "electronics",
    price: 29.99,
    originalPrice: 49.99,
    expiryDate: "2025-06-20",
    isAmazon: true,
    affiliateLink: "https://amazon.com/dp/B08XVYZ1Y5?tag=offersmonkey0e-21",
    savings: "40%"
  },
  {
    id: "offer8",
    title: "BOGO Ice Cream",
    description: "Buy one get one free on premium ice cream pints",
    imageUrl: "/placeholder.svg",
    store: "Safeway",
    category: "supermarket",
    price: 4.99,
    originalPrice: 9.98,
    expiryDate: "2025-05-20",
    location: {
      lat: 37.7822,
      lng: -122.4111,
      address: "298 King St, San Francisco, CA"
    },
    isAmazon: false,
    terms: "Limit 4 per customer. Rewards card required.",
    savings: "50%"
  }
];

export const mockBanners: BannerItem[] = [
  {
    id: "banner1",
    imageUrl: "/placeholder.svg",
    title: "Summer Sale - Up to 70% Off",
    link: "/category/fashion"
  },
  {
    id: "banner2",
    imageUrl: "/placeholder.svg",
    title: "New Electronics Deals",
    link: "/category/electronics"
  },
  {
    id: "banner3",
    imageUrl: "/placeholder.svg",
    title: "Grocery Weekend Specials",
    link: "/category/supermarket"
  }
];

export const mockUser: User = {
  id: "user1",
  name: "John Doe",
  phone: "+1234567890",
  location: "San Francisco, CA",
  preferences: {
    brands: ["Samsung", "Nike", "Amazon"],
    stores: ["Best Buy", "Whole Foods", "Target"],
    banks: ["Chase", "Bank of America"]
  },
  savedOffers: ["offer2", "offer4"],
  points: 250
};

export const mockChatMessages = [
  {
    id: "msg1",
    text: "Hello! I'm OffersMonkey. How can I help you find deals today?",
    isUser: false,
    timestamp: new Date()
  }
];
