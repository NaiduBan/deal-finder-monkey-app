
import { Offer, Category, User, BannerItem } from "./types";

export const mockCategories: Category[] = [
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
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: "sparkles",
    subcategories: ["Skincare", "Makeup", "Haircare", "Fragrance"]
  },
  {
    id: "health",
    name: "Health",
    icon: "heart",
    subcategories: ["Supplements", "Fitness", "Medical", "Wellness"]
  },
  {
    id: "travel",
    name: "Travel",
    icon: "plane",
    subcategories: ["Hotels", "Flights", "Cruises", "Car Rentals"]
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
    savings: "50%",
    // Added fields to match updated Offer interface
    lmdId: 1001,
    merchantHomepage: "https://wholefoods.com",
    longOffer: "Enjoy 50% off all organic fruits and vegetables this weekend. Great time to stock up on healthy foods!",
    code: null,
    termsAndConditions: "Cannot be combined with other discounts. Valid in-store only.",
    featured: false,
    publisherExclusive: false,
    url: "https://wholefoods.com/offers",
    smartlink: null,
    offerType: "discount",
    offerValue: "50% Off",
    status: "active",
    startDate: "2025-05-25",
    endDate: "2025-06-01",
    categories: "supermarket,grocery"
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
    savings: "$200",
    // Added fields
    lmdId: 1002,
    merchantHomepage: "https://bestbuy.com",
    longOffer: "Trade in your old phone and get $200 off on the new Samsung Galaxy S23 Ultra. Limited time offer.",
    code: null,
    termsAndConditions: "Requires eligible trade-in. Offer valid in-store only.",
    featured: true,
    publisherExclusive: false,
    url: "https://bestbuy.com/offers/samsung",
    smartlink: null,
    offerType: "discount",
    offerValue: "$200 Off",
    status: "active",
    startDate: "2025-05-10",
    endDate: "2025-05-30",
    categories: "electronics,phones"
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
    savings: "30%",
    // Added fields
    lmdId: 1003,
    merchantHomepage: "https://footlocker.com",
    longOffer: "Get 30% off all Nike Air Max models. Limited time offer available in store and online.",
    code: null,
    termsAndConditions: "While supplies last. Select models only.",
    featured: false,
    publisherExclusive: false,
    url: "https://footlocker.com/offers/nike",
    smartlink: null,
    offerType: "discount",
    offerValue: "30% Off",
    status: "active",
    startDate: "2025-05-01",
    endDate: "2025-05-25",
    categories: "fashion,shoes"
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
    savings: "30%",
    // Added fields
    lmdId: 1004,
    merchantHomepage: "https://amazon.com",
    longOffer: "Get the Echo Dot (5th Gen) smart speaker with Alexa for 30% off. Limited time offer.",
    code: null,
    termsAndConditions: "Amazon Prime members only. Limited to 2 per customer.",
    featured: true,
    publisherExclusive: false,
    url: "https://amazon.com/dp/B09B8V1LZ3",
    smartlink: "https://amazon.com/dp/B09B8V1LZ3?tag=offersmonkey0e-21",
    offerType: "sale",
    offerValue: "30% Off",
    status: "active",
    startDate: "2025-05-15",
    endDate: "2025-06-10",
    categories: "electronics,smart-home"
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
    savings: "40%",
    // Added fields
    lmdId: 1005,
    merchantHomepage: "https://ashleyhomestore.com",
    longOffer: "Get 40% off Italian genuine leather sofas. Floor models only, limited quantities available.",
    code: null,
    termsAndConditions: "Floor models only. Delivery fees apply. Cannot be combined with other offers.",
    featured: false,
    publisherExclusive: false,
    url: "https://ashleyhomestore.com/offers",
    smartlink: null,
    offerType: "discount",
    offerValue: "40% Off",
    status: "active",
    startDate: "2025-05-20",
    endDate: "2025-06-15",
    categories: "furniture,homegoods"
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
    savings: "35%",
    // Added fields
    lmdId: 1006,
    merchantHomepage: "https://tiffany.com",
    longOffer: "Special sale: 14k Gold Ring with 0.5ct diamonds at 35% discount. Certificate of authenticity included.",
    code: null,
    termsAndConditions: "In-store only. Certificate of authenticity included. Limited quantities available.",
    featured: true,
    publisherExclusive: true,
    url: "https://tiffany.com/offers",
    smartlink: null,
    offerType: "luxury-sale",
    offerValue: "35% Off",
    status: "active",
    startDate: "2025-05-10",
    endDate: "2025-05-31",
    categories: "jewelry,accessories"
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
    savings: "40%",
    // Added fields
    lmdId: 1007,
    merchantHomepage: "https://amazon.com",
    longOffer: "Get the Fire TV Stick 4K for 40% off. Stream your favorite content in 4K quality.",
    code: null,
    termsAndConditions: "Limited to 3 per customer. While supplies last.",
    featured: false,
    publisherExclusive: false,
    url: "https://amazon.com/dp/B08XVYZ1Y5",
    smartlink: "https://amazon.com/dp/B08XVYZ1Y5?tag=offersmonkey0e-21",
    offerType: "sale",
    offerValue: "40% Off",
    status: "active",
    startDate: "2025-05-20",
    endDate: "2025-06-20",
    categories: "electronics,streaming"
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
    savings: "50%",
    // Added fields
    lmdId: 1008,
    merchantHomepage: "https://safeway.com",
    longOffer: "Buy one get one free on all premium ice cream pints. Perfect for the summer season!",
    code: null,
    termsAndConditions: "Limit 4 per customer. Rewards card required. In-store only.",
    featured: false,
    publisherExclusive: false,
    url: "https://safeway.com/offers",
    smartlink: null,
    offerType: "bogo",
    offerValue: "Buy One Get One Free",
    status: "active",
    startDate: "2025-05-10",
    endDate: "2025-05-20",
    categories: "supermarket,grocery,food"
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
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com', // Add email property to fix the error
  phone: '+91 9876543210',
  location: 'Mumbai',
  preferences: {
    brands: ['b1', 'b3'],
    stores: ['s1', 's4'],
    banks: ['bk1', 'bk3']
  },
  savedOffers: ['offer-1', 'offer-3', 'offer-5'],
  points: 350
};

export const mockChatMessages = [
  {
    id: "msg1",
    text: "Hello! I'm OffersMonkey. How can I help you find deals today?",
    isUser: false,
    timestamp: new Date()
  }
];

// Adding mock data for preferences
export const mockBrands = [
  { id: 'b1', name: 'Nike', logo: '🏷️' },
  { id: 'b2', name: 'Adidas', logo: '🏷️' },
  { id: 'b3', name: 'Apple', logo: '🏷️' },
  { id: 'b4', name: 'Samsung', logo: '🏷️' },
  { id: 'b5', name: 'Amazon', logo: '🏷️' },
  { id: 'b6', name: 'Sony', logo: '🏷️' },
  { id: 'b7', name: 'Microsoft', logo: '🏷️' },
  { id: 'b8', name: 'H&M', logo: '🏷️' },
  { id: 'b9', name: 'Zara', logo: '🏷️' },
  { id: 'b10', name: 'IKEA', logo: '🏷️' },
  { id: 'b11', name: 'Lenovo', logo: '🏷️' },
  { id: 'b12', name: 'Dell', logo: '🏷️' },
  { id: 'b13', name: 'HP', logo: '🏷️' },
  { id: 'b14', name: 'Asus', logo: '🏷️' },
  { id: 'b15', name: 'LG', logo: '🏷️' },
];

export const mockStores = [
  { id: 's1', name: 'Walmart', logo: '🏬' },
  { id: 's2', name: 'Target', logo: '🏬' },
  { id: 's3', name: 'Best Buy', logo: '🏬' },
  { id: 's4', name: 'Walgreens', logo: '🏬' },
  { id: 's5', name: 'CVS', logo: '🏬' },
  { id: 's6', name: 'Costco', logo: '🏬' },
  { id: 's7', name: 'Kroger', logo: '🏬' },
  { id: 's8', name: 'Whole Foods', logo: '🏬' },
  { id: 's9', name: 'Home Depot', logo: '🏬' },
  { id: 's10', name: 'Lowe\'s', logo: '🏬' },
  { id: 's11', name: 'Macy\'s', logo: '🏬' },
  { id: 's12', name: 'Nordstrom', logo: '🏬' },
  { id: 's13', name: 'Apple Store', logo: '🏬' },
  { id: 's14', name: 'GameStop', logo: '🏬' },
  { id: 's15', name: 'Nike Store', logo: '🏬' },
];

export const mockBanks = [
  { id: 'bk1', name: 'Bank of America', logo: '🏦' },
  { id: 'bk2', name: 'Chase', logo: '🏦' },
  { id: 'bk3', name: 'Wells Fargo', logo: '🏦' },
  { id: 'bk4', name: 'Citibank', logo: '🏦' },
  { id: 'bk5', name: 'Capital One', logo: '🏦' },
  { id: 'bk6', name: 'American Express', logo: '🏦' },
  { id: 'bk7', name: 'Discover', logo: '🏦' },
  { id: 'bk8', name: 'TD Bank', logo: '🏦' },
  { id: 'bk9', name: 'US Bank', logo: '🏦' },
  { id: 'bk10', name: 'PNC Bank', logo: '🏦' },
  { id: 'bk11', name: 'HSBC', logo: '🏦' },
  { id: 'bk12', name: 'Santander', logo: '🏦' },
  { id: 'bk13', name: 'Citizens Bank', logo: '🏦' },
  { id: 'bk14', name: 'Ally Bank', logo: '🏦' },
  { id: 'bk15', name: 'Barclays', logo: '🏦' },
];
