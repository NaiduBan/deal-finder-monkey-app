
import { executeQuery } from './database';
import { Offer } from '@/types';

export interface MySQLOffer {
  id: number;
  title: string;
  description: string;
  image_url: string;
  store: string;
  categories: string;
  offer_value: string;
  code: string;
  url: string;
  start_date: string;
  end_date: string;
  featured: boolean | string;
  sponsored: boolean | string;
  status: string;
  [key: string]: any;
}

export const fetchOffersFromMySQL = async (): Promise<Offer[]> => {
  try {
    console.log('🔍 Fetching offers from MySQL database...');
    
    const query = `
      SELECT * FROM offers_data 
      WHERE status = 'active' OR status IS NULL
      ORDER BY id DESC 
      LIMIT 200
    `;
    
    const results = await executeQuery(query) as MySQLOffer[];
    console.log(`📊 Found ${results.length} offers in MySQL database`);
    
    return results.map((item: MySQLOffer, index: number) => transformMySQLOffer(item, index));
  } catch (error) {
    console.error('❌ Error fetching offers from MySQL:', error);
    throw new Error('Failed to fetch offers from MySQL database');
  }
};

export const searchOffersInMySQL = async (searchTerm: string): Promise<Offer[]> => {
  try {
    console.log('🔍 Searching offers in MySQL database for:', searchTerm);
    
    const query = `
      SELECT * FROM offers_data 
      WHERE (title LIKE ? OR description LIKE ? OR store LIKE ? OR categories LIKE ?)
      AND (status = 'active' OR status IS NULL)
      ORDER BY id DESC 
      LIMIT 50
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const results = await executeQuery(query, [searchPattern, searchPattern, searchPattern, searchPattern]) as MySQLOffer[];
    
    console.log(`📊 Found ${results.length} search results in MySQL database`);
    
    return results.map((item: MySQLOffer, index: number) => transformMySQLOffer(item, index));
  } catch (error) {
    console.error('❌ Error searching offers in MySQL:', error);
    throw new Error('Failed to search offers in MySQL database');
  }
};

const transformMySQLOffer = (item: MySQLOffer, index: number): Offer => {
  // Calculate price and savings similar to the existing logic
  let price = 0;
  let originalPrice = 0;
  let savings = '';
  
  if (item.offer_value) {
    const offerValue = item.offer_value;
    if (offerValue.includes('%')) {
      const percent = parseInt(offerValue.replace(/[^0-9]/g, ''));
      originalPrice = Math.floor(1000 + Math.random() * 9000);
      price = Math.floor(originalPrice * (1 - percent / 100));
      savings = `${percent}%`;
    } else if (offerValue.match(/\d+/)) {
      const amount = parseInt(offerValue.replace(/[^0-9]/g, ''));
      price = amount;
      originalPrice = price + Math.floor(Math.random() * 500) + 100;
      savings = `₹${originalPrice - price}`;
    } else {
      price = Math.floor(Math.random() * 1000) + 100;
      originalPrice = price + Math.floor(Math.random() * 500) + 100;
      savings = `₹${originalPrice - price}`;
    }
  } else {
    price = Math.floor(Math.random() * 1000) + 100;
    originalPrice = price + Math.floor(Math.random() * 500) + 100;
    savings = `₹${originalPrice - price}`;
  }

  const isAmazon = (item.store && item.store.toLowerCase().includes('amazon')) || 
                  (item.url && item.url.toLowerCase().includes('amazon'));
  
  return {
    id: `mysql-offer-${item.id || index}`,
    title: item.title || "",
    description: item.description || "",
    imageUrl: item.image_url || "",
    store: item.store || "",
    category: item.categories || "",
    price: price,
    originalPrice: originalPrice,
    expiryDate: item.end_date || "",
    isAmazon: isAmazon,
    savings: savings,
    lmdId: Number(item.id) || 0,
    merchantHomepage: item.url || "",
    longOffer: item.description || "",
    code: item.code || "",
    termsAndConditions: "",
    featured: item.featured === true || item.featured === "1" || item.featured === "true",
    publisherExclusive: false,
    sponsored: item.sponsored === true || item.sponsored === "1" || item.sponsored === "true",
    url: item.url || "",
    smartlink: item.url || "",
    offerType: "deal",
    offerValue: item.offer_value || "",
    status: item.status || "active",
    startDate: item.start_date || "",
    endDate: item.end_date || "",
    categories: item.categories || ""
  };
};
