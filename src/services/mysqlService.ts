import { fetchOffersFromMySQL, searchOffersInMySQL } from './mysql/offersService';
import { testConnection } from './mysql/database';
import { Offer, Category } from '@/types';

// Initialize MySQL connection on service load
let mysqlConnected = false;

export const initializeMySQLConnection = async (): Promise<boolean> => {
  try {
    mysqlConnected = await testConnection();
    return mysqlConnected;
  } catch (error) {
    console.error('Failed to initialize MySQL connection:', error);
    return false;
  }
};

// Fetch offers from MySQL
export async function fetchOffers(): Promise<Offer[]> {
  try {
    if (!mysqlConnected) {
      console.log('🔄 Initializing MySQL connection...');
      mysqlConnected = await initializeMySQLConnection();
    }

    if (!mysqlConnected) {
      throw new Error('MySQL connection not available');
    }

    return await fetchOffersFromMySQL();
  } catch (error) {
    console.error('Error fetching offers from MySQL:', error);
    return [];
  }
}

// Search offers in MySQL
export async function searchOffers(query: string): Promise<Offer[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    if (!mysqlConnected) {
      console.log('🔄 Initializing MySQL connection...');
      mysqlConnected = await initializeMySQLConnection();
    }

    if (!mysqlConnected) {
      throw new Error('MySQL connection not available');
    }

    return await searchOffersInMySQL(query);
  } catch (error) {
    console.error('Error searching offers in MySQL:', error);
    return [];
  }
}

// Basic categories (since we're focusing on offers first)
export async function fetchCategories(): Promise<Category[]> {
  return [
    { id: 'electronics', name: 'Electronics', icon: 'laptop', subcategories: [] },
    { id: 'fashion', name: 'Fashion', icon: 'shirt', subcategories: [] },
    { id: 'food', name: 'Food & Dining', icon: 'utensils', subcategories: [] },
    { id: 'travel', name: 'Travel', icon: 'plane', subcategories: [] },
    { id: 'beauty', name: 'Beauty', icon: 'sparkles', subcategories: [] },
    { id: 'home', name: 'Home & Garden', icon: 'home', subcategories: [] },
  ];
}

// Function to apply preferences to offers (keep existing logic)
export function applyPreferencesToOffers(offers: Offer[], preferences: {[key: string]: string[]}): Offer[] {
  if (!preferences || Object.keys(preferences).length === 0 || 
      (preferences.stores?.length === 0 && preferences.brands?.length === 0 && preferences.banks?.length === 0)) {
    console.log('No preferences to filter by, returning all offers');
    return offers;
  }
  
  console.log(`Filtering ${offers.length} offers with preferences:`, 
    `stores: ${preferences.stores?.length || 0}, ` +
    `brands: ${preferences.brands?.length || 0}, ` + 
    `banks: ${preferences.banks?.length || 0}`
  );
  
  const filteredOffers = offers.filter(offer => {
    // Check store preferences
    if (preferences.stores && preferences.stores.length > 0 && offer.store) {
      for (const prefValue of preferences.stores) {
        if (prefValue && offer.store.toLowerCase().includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check brand/category preferences
    if (preferences.brands && preferences.brands.length > 0 && offer.category) {
      for (const prefValue of preferences.brands) {
        if (prefValue && offer.category.toLowerCase().includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check bank preferences
    if (preferences.banks && preferences.banks.length > 0 && 
       (offer.description || offer.termsAndConditions || offer.longOffer)) {
      const fullText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      
      for (const prefValue of preferences.banks) {
        if (prefValue && fullText.includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  console.log(`Filtered down to ${filteredOffers.length} offers matching preferences`);
  return filteredOffers;
}
