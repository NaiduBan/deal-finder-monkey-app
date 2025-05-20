import { supabase } from "@/integrations/supabase/client";
import { Offer, Category } from "@/types";
import { mockCategories, mockOffers } from "@/mockData";

// Function to fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Supabase...');
    // First try to get categories from dedicated categories table
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched from categories table:', data ? data.length : 0);
    
    // If no categories found, try to extract categories from Data table
    if (!data || data.length === 0) {
      console.log('No categories found in categories table, attempting to extract from Data table');
      
      const { data: dataTable, error: dataError } = await supabase
        .from('Data')
        .select('categories')
        .not('categories', 'is', null);
        
      if (dataError) {
        console.error('Error fetching categories from Data table:', dataError);
        return mockCategories;
      }
      
      if (dataTable && dataTable.length > 0) {
        // Extract unique categories from Data table
        const categoryMap = new Map<string, Category>();
        
        dataTable.forEach(item => {
          if (item.categories) {
            const cats = item.categories.split(',').map((c: string) => c.trim());
            cats.forEach((catName: string, index: number) => {
              if (catName && !categoryMap.has(catName.toLowerCase())) {
                const id = `category-${categoryMap.size + index}`; // More descriptive ID format
                categoryMap.set(catName.toLowerCase(), {
                  id,
                  name: catName,
                  icon: getCategoryIcon(catName),
                  subcategories: []
                });
              }
            });
          }
        });
        
        const extractedCategories = Array.from(categoryMap.values());
        console.log('Extracted categories from Data table:', extractedCategories.length);
        
        // Store the extracted categories in the categories table for future use
        if (extractedCategories.length > 0) {
          try {
            const { error: insertError } = await supabase
              .from('categories')
              .upsert(extractedCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon
              })));
            
            if (insertError) {
              console.error('Error storing extracted categories:', insertError);
            } else {
              console.log('Successfully stored extracted categories in categories table');
            }
          } catch (err) {
            console.error('Failed to store extracted categories:', err);
          }
          
          return extractedCategories;
        }
      }
      
      console.log('No categories found in database, using mock data');
      return mockCategories;
    }
    
    // Transform the data to match our Category type
    return data.map(item => ({
      id: item.id || `category-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      icon: item.icon || getCategoryIcon(item.name),
      subcategories: []
    }));
  } catch (error) {
    console.error('Error in fetchCategories, falling back to mock data:', error);
    return mockCategories;
  }
}

// Helper function to get appropriate icon based on category name
function getCategoryIcon(categoryName: string): string {
  const nameLower = categoryName.toLowerCase();
  
  if (nameLower.includes('food') || nameLower.includes('restaurant') || nameLower.includes('dining')) {
    return 'utensils';
  } else if (nameLower.includes('electronic') || nameLower.includes('tech')) {
    return 'laptop';
  } else if (nameLower.includes('fashion') || nameLower.includes('cloth') || nameLower.includes('apparel')) {
    return 'shirt';
  } else if (nameLower.includes('travel') || nameLower.includes('flight') || nameLower.includes('hotel')) {
    return 'plane';
  } else if (nameLower.includes('home') || nameLower.includes('furniture')) {
    return 'home';
  } else if (nameLower.includes('beauty') || nameLower.includes('care')) {
    return 'sparkles';
  } else if (nameLower.includes('health') || nameLower.includes('fitness')) {
    return 'heart';
  } else if (nameLower.includes('entertainment') || nameLower.includes('movie')) {
    return 'tv';
  } else if (nameLower.includes('gift') || nameLower.includes('present')) {
    return 'gift';
  } else if (nameLower.includes('coffee') || nameLower.includes('cafe')) {
    return 'coffee';
  } else {
    return 'shopping-bag';  // Default icon
  }
}

// Function to fetch all offers from the Data table
export async function fetchOffers(): Promise<Offer[]> {
  try {
    console.log('Fetching offers from Data table...');
    const { data, error } = await supabase
      .from('Data')
      .select('*');
    
    if (error) {
      console.error('Error fetching offers from Data table:', error);
      throw error;
    }
    
    console.log('Data table results:', data ? data.length : 0, 'records found');
    
    // If no data is found in the Data table, use mock data
    if (!data || data.length === 0) {
      console.log('No data found in Data table, falling back to mock data');
      return mockOffers;
    }
    
    // Transform the data to match our Offer type
    return data.map((item, index) => {
      // Calculate price and savings
      let price = 0;
      let originalPrice = 0;
      let savings = '';
      
      if (item.offer_value) {
        const offerValue = item.offer_value;
        if (offerValue.includes('%')) {
          // Percentage discount
          const percent = parseInt(offerValue.replace(/[^0-9]/g, ''));
          originalPrice = Math.floor(1000 + Math.random() * 9000); // Random original price
          price = Math.floor(originalPrice * (1 - percent / 100));
          savings = `${percent}%`;
        } else if (offerValue.match(/\d+/)) {
          // Fixed amount discount
          const amount = parseInt(offerValue.replace(/[^0-9]/g, ''));
          price = amount;
          originalPrice = price + Math.floor(Math.random() * 500) + 100;
          savings = `₹${originalPrice - price}`;
        } else {
          // Default values
          price = Math.floor(Math.random() * 1000) + 100;
          originalPrice = price + Math.floor(Math.random() * 500) + 100;
          savings = `₹${originalPrice - price}`;
        }
      } else {
        // Default values
        price = Math.floor(Math.random() * 1000) + 100;
        originalPrice = price + Math.floor(Math.random() * 500) + 100;
        savings = `₹${originalPrice - price}`;
      }

      // Determine if it's an Amazon offer
      const isAmazon = (item.store && item.store.toLowerCase().includes('amazon')) || 
                      (item.merchant_homepage && item.merchant_homepage.toLowerCase().includes('amazon'));
      
      return {
        id: `data-${item.lmd_id || index}`,
        title: item.title || "",
        description: item.description || item.long_offer || "",
        imageUrl: item.image_url || "",
        store: item.store || "",
        category: item.categories || "",
        price: price,
        originalPrice: originalPrice,
        expiryDate: item.end_date || "",
        isAmazon: isAmazon,
        savings: savings,
        // Fields from the Data table
        lmdId: Number(item.lmd_id) || 0,
        merchantHomepage: item.merchant_homepage || "",
        longOffer: item.long_offer || "",
        code: item.code || "",
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        url: item.url || "",
        smartlink: item.smartlink || "",
        offerType: item.type || "",
        offerValue: item.offer_value || "",
        status: item.status || "",
        startDate: item.start_date || "",
        endDate: item.end_date || "",
        categories: item.categories || ""
      };
    });
  } catch (error) {
    console.error('Error in fetchOffers, falling back to mock data:', error);
    return mockOffers;
  }
}

// Function to extract unique stores from offers
export async function fetchStoresFromOffers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('Data')
      .select('store')
      .not('store', 'is', null);
      
    if (error) {
      throw error;
    }
    
    const uniqueStores = new Set<string>();
    
    data?.forEach(item => {
      if (item.store && item.store.trim()) {
        uniqueStores.add(item.store.trim());
      }
    });
    
    return Array.from(uniqueStores).sort();
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}

// Function to extract unique categories from offers
export async function fetchCategoriesFromOffers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('Data')
      .select('categories')
      .not('categories', 'is', null);
      
    if (error) {
      throw error;
    }
    
    const uniqueCategories = new Set<string>();
    
    data?.forEach(item => {
      if (item.categories) {
        const categories = item.categories.split(',');
        categories.forEach((cat: string) => {
          const trimmedCat = cat.trim();
          if (trimmedCat) {
            uniqueCategories.add(trimmedCat);
          }
        });
      }
    });
    
    return Array.from(uniqueCategories).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Function to extract bank names from offers
export async function fetchBanksFromOffers(): Promise<string[]> {
  try {
    // Common bank names to look for
    const commonBanks = [
      'HDFC', 'SBI', 'ICICI', 'Axis', 'RBL', 'Kotak', 
      'Bank of Baroda', 'Punjab National', 'IDBI', 'Canara',
      'Federal', 'IndusInd', 'Yes Bank', 'Union Bank',
      'HSBC', 'Citi', 'Standard Chartered', 'American Express',
      'Deutsche', 'DBS', 'IDFC', 'AU Small Finance'
    ];
    
    const { data, error } = await supabase
      .from('Data')
      .select('description, long_offer, title, terms_and_conditions');
      
    if (error) {
      throw error;
    }
    
    const bankMentions: Record<string, number> = {};
    
    // Look for bank mentions in offer text
    data?.forEach(item => {
      const fullText = `${item.title || ''} ${item.description || ''} ${item.long_offer || ''} ${item.terms_and_conditions || ''}`.toLowerCase();
      
      commonBanks.forEach(bank => {
        if (fullText.includes(bank.toLowerCase())) {
          bankMentions[bank] = (bankMentions[bank] || 0) + 1;
        }
      });
    });
    
    // Sort banks by frequency of mentions
    const sortedBanks = Object.keys(bankMentions)
      .sort((a, b) => bankMentions[b] - bankMentions[a]);
    
    return sortedBanks.length > 0 ? sortedBanks : commonBanks.slice(0, 6);
  } catch (error) {
    console.error('Error finding banks in offers:', error);
    return ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'American Express'];
  }
}

// Function to upload an image to Supabase storage
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('offers')
    .upload(filePath, file);
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  // Get the public URL for the uploaded image
  const { data: { publicUrl } } = supabase.storage
    .from('offers')
    .getPublicUrl(filePath);
    
  return publicUrl;
}

// Function to get user saved offers
export async function fetchUserSavedOffers(userId: string): Promise<string[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch saved offers');
    }
    
    const { data, error } = await supabase
      .from('saved_offers')
      .select('offer_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching saved offers:', error);
      throw error;
    }
    
    return data ? data.map(item => item.offer_id) : [];
  } catch (error) {
    console.error('Error in fetchUserSavedOffers:', error);
    return [];
  }
}

// Function to save an offer for a user
export async function saveOfferForUser(userId: string, offerId: string): Promise<boolean> {
  try {
    if (!userId || !offerId) {
      throw new Error('User ID and Offer ID are required');
    }
    
    console.log('Saving offer for user:', userId, offerId);
    
    const { error } = await supabase
      .from('saved_offers')
      .insert({
        user_id: userId,
        offer_id: offerId
      });
      
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('Offer already saved for this user');
        return true; // Already saved is still a success
      }
      console.error('Error saving offer:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveOfferForUser:', error);
    return false;
  }
}

// Function to unsave an offer for a user
export async function unsaveOfferForUser(userId: string, offerId: string): Promise<boolean> {
  try {
    if (!userId || !offerId) {
      throw new Error('User ID and Offer ID are required');
    }
    
    console.log('Removing saved offer for user:', userId, offerId);
    
    const { error } = await supabase
      .from('saved_offers')
      .delete()
      .eq('user_id', userId)
      .eq('offer_id', offerId);
      
    if (error) {
      console.error('Error removing saved offer:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in unsaveOfferForUser:', error);
    return false;
  }
}

// NEW PREFERENCE FUNCTIONS

// Function to get user preferences by preference type
export async function getUserPreferences(userId: string, preferenceType: string = 'all'): Promise<string[]> {
  try {
    if (!userId) {
      console.log('No user ID provided for preference fetch');
      return [];
    }
    
    console.log(`Fetching ${preferenceType} preferences for user ${userId}`);
    
    let query = supabase
      .from('user_preferences')
      .select('preference_id')
      .eq('user_id', userId);
      
    if (preferenceType !== 'all') {
      query = query.eq('preference_type', preferenceType);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} preferences of type ${preferenceType}`);
    return data ? data.map(pref => pref.preference_id) : [];
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return [];
  }
}

// Function to save multiple preferences
export async function saveUserPreferences(
  userId: string, 
  preferenceType: string, 
  preferenceIds: string[]
): Promise<boolean> {
  try {
    if (!userId || !preferenceType || !preferenceIds.length) {
      console.log('Missing required data for saving preferences');
      return false;
    }
    
    console.log(`Saving ${preferenceIds.length} ${preferenceType} preferences for user ${userId}`);
    
    // First delete existing preferences of this type
    const { error: deleteError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_type', preferenceType);
      
    if (deleteError) {
      console.error('Error deleting existing preferences:', deleteError);
      return false;
    }
    
    // Then insert new preferences
    const preferencesToInsert = preferenceIds.map(prefId => ({
      user_id: userId,
      preference_type: preferenceType,
      preference_id: prefId
    }));
    
    const { error: insertError } = await supabase
      .from('user_preferences')
      .insert(preferencesToInsert);
      
    if (insertError) {
      console.error('Error inserting new preferences:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveUserPreferences:', error);
    return false;
  }
}

// Function to filter offers based on user preferences
export function applyPreferencesToOffers(
  offers: Offer[],
  preferences: { brands: string[], stores: string[], banks: string[] }
): Offer[] {
  // If no preferences are set, return all offers
  if (!preferences || 
      Object.keys(preferences).length === 0 || 
      (preferences.brands.length === 0 && 
       preferences.stores.length === 0 && 
       preferences.banks.length === 0)) {
    return offers;
  }
  
  return offers.filter(offer => {
    // Check stores
    if (preferences.stores.length > 0 && offer.store) {
      if (preferences.stores.some(store => 
        offer.store?.toLowerCase().includes(store.toLowerCase()))) {
        return true;
      }
    }
    
    // Check categories/brands
    if (preferences.brands.length > 0 && offer.category) {
      if (preferences.brands.some(brand => 
        offer.category?.toLowerCase().includes(brand.toLowerCase()))) {
        return true;
      }
    }
    
    // Check banks (look in description, terms, etc.)
    if (preferences.banks.length > 0) {
      const fullText = `${offer.title || ''} ${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      
      if (preferences.banks.some(bank => 
        fullText.includes(bank.toLowerCase()))) {
        return true;
      }
    }
    
    return false;
  });
}

// Function to filter offers based on user preferences
export function filterOffersByPreferences(
  offers: Offer[],
  preferences: { brands: string[], stores: string[], banks: string[] }
): Offer[] {
  // If no preferences are set, return all offers
  if (!preferences || 
      Object.keys(preferences).length === 0 || 
      (preferences.brands.length === 0 && 
       preferences.stores.length === 0 && 
       preferences.banks.length === 0)) {
    return offers;
  }
  
  return offers.filter(offer => {
    // Check stores
    if (preferences.stores.length > 0 && offer.store) {
      if (preferences.stores.some(store => 
        offer.store?.toLowerCase().includes(store.toLowerCase()))) {
        return true;
      }
    }
    
    // Check categories/brands
    if (preferences.brands.length > 0 && offer.category) {
      if (preferences.brands.some(brand => 
        offer.category?.toLowerCase().includes(brand.toLowerCase()))) {
        return true;
      }
    }
    
    // Check banks (look in description, terms, etc.)
    if (preferences.banks.length > 0) {
      const fullText = `${offer.title || ''} ${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      
      if (preferences.banks.some(bank => 
        fullText.includes(bank.toLowerCase()))) {
        return true;
      }
    }
    
    return false;
  });
}

// Function to search offers
export async function searchOffers(query: string): Promise<Offer[]> {
  if (!query.trim()) return [];
  
  try {
    console.log('Searching offers with query:', query);
    
    const searchTerm = `%${query}%`;
    
    const { data, error } = await supabase
      .from('Data')
      .select('*')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},store.ilike.${searchTerm},categories.ilike.${searchTerm}`)
      .limit(20);
      
    if (error) {
      console.error('Error searching offers:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // Transform data to Offer type (using same transformation as fetchOffers)
    return data.map((item, index) => {
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
                      (item.merchant_homepage && item.merchant_homepage.toLowerCase().includes('amazon'));
      
      return {
        id: `data-${item.lmd_id || index}`,
        title: item.title || "",
        description: item.description || item.long_offer || "",
        imageUrl: item.image_url || "",
        store: item.store || "",
        category: item.categories || "",
        price: price,
        originalPrice: originalPrice,
        expiryDate: item.end_date || "",
        isAmazon: isAmazon,
        savings: savings,
        lmdId: Number(item.lmd_id) || 0,
        merchantHomepage: item.merchant_homepage || "",
        longOffer: item.long_offer || "",
        code: item.code || "",
        termsAndConditions: string | null,
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        url: item.url || "",
        smartlink: item.smartlink || "",
        offerType: string | null,
        offerValue: string | null,
        status: string | null,
        startDate: string | null,
        endDate: string | null,
        categories: string | null
      };
    });
  } catch (error) {
    console.error('Error in searchOffers:', error);
    return [];
  }
}

// Function to manually trigger LinkMyDeals sync
export async function triggerLinkMyDealsSync(): Promise<boolean> {
  try {
    console.log('Manually triggering LinkMyDeals sync...');
    
    const { data, error } = await supabase.functions.invoke('sync-linkmydeals', {
      body: { manual: true }
    });
    
    if (error) {
      console.error('Error triggering LinkMyDeals sync:', error);
      return false;
    }
    
    console.log('Sync trigger response:', data);
    return data.success === true;
  } catch (error) {
    console.error('Error in triggerLinkMyDealsSync:', error);
    return false;
  }
}

// Function to get sync status
export async function getLinkMyDealsSyncStatus(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('api_sync_status')
      .select('*')
      .eq('id', 'linkmydeals')
      .single();
      
    if (error) {
      console.error('Error fetching sync status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getLinkMyDealsSyncStatus:', error);
    return null;
  }
}
