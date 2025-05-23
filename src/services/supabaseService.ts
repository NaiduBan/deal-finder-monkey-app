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
                const id = `b${categoryMap.size + index}`; // Use a more reliable ID format
                categoryMap.set(catName.toLowerCase(), {
                  id,
                  name: catName,
                  icon: getCategoryIcon(catName), // Get appropriate icon based on category name
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
      id: item.id || `b${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      icon: item.icon || getCategoryIcon(item.name),
      subcategories: []  // We don't have subcategories in the DB schema yet
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

// Enhanced function to fetch user preferences with improved logging
export async function fetchUserPreferences(userId: string, preferenceType: string = 'all'): Promise<any[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch preferences');
    }
    
    console.log(`Fetching ${preferenceType} preferences for user ${userId}`);
    
    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);
      
    if (preferenceType !== 'all') {
      query = query.eq('preference_type', preferenceType);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} preferences of type ${preferenceType}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserPreferences:', error);
    return [];
  }
}

// Enhanced function to save user preferences with better error handling
export async function saveUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  try {
    if (!userId || !preferenceType || !preferenceId) {
      throw new Error('User ID, preference type, and preference ID are required');
    }
    
    console.log(`Saving preference for user ${userId}: ${preferenceType} - ${preferenceId}`);
    
    // Check if preference already exists
    const { data: existingPreference, error: checkError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .eq('preference_id', preferenceId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means not found, which is expected
      console.error('Error checking existing preference:', checkError);
      return false;
    }
    
    // If preference already exists, don't add it again
    if (existingPreference) {
      console.log('Preference already exists, skipping save operation');
      return true;
    }
    
    // Insert the new preference
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        preference_type: preferenceType,
        preference_id: preferenceId
      });
      
    if (error) {
      console.error('Error saving user preference:', error);
      return false;
    }
    
    console.log('Preference saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveUserPreference:', error);
    return false;
  }
}

// Enhanced function to remove user preference with better error handling and logging
export async function removeUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  try {
    if (!userId || !preferenceType || !preferenceId) {
      throw new Error('User ID, preference type, and preference ID are required');
    }
    
    console.log(`Removing preference for user ${userId}: ${preferenceType} - ${preferenceId}`);
    
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .eq('preference_id', preferenceId);
      
    if (error) {
      console.error('Error removing user preference:', error);
      return false;
    }
    
    console.log('Preference removed successfully');
    return true;
  } catch (error) {
    console.error('Error in removeUserPreference:', error);
    return false;
  }
}

// Function to remove all preferences of a specific type for a user
export async function removeAllUserPreferencesOfType(userId: string, preferenceType: string): Promise<boolean> {
  try {
    if (!userId || !preferenceType) {
      throw new Error('User ID and preference type are required');
    }
    
    console.log(`Removing all ${preferenceType} preferences for user ${userId}`);
    
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_type', preferenceType);
      
    if (error) {
      console.error(`Error removing all ${preferenceType} preferences:`, error);
      return false;
    }
    
    console.log(`All ${preferenceType} preferences removed successfully`);
    return true;
  } catch (error) {
    console.error('Error in removeAllUserPreferencesOfType:', error);
    return false;
  }
}

// Function to search offers
export async function searchOffers(query: string): Promise<Offer[]> {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const searchTerm = `%${query}%`;
    
    const { data, error } = await supabase
      .from('Data')
      .select('*')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},store.ilike.${searchTerm},categories.ilike.${searchTerm}`)
      .limit(20);
      
    if (error) {
      console.error('Error searching offers:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform data to Offer type (reuse the transformation logic from fetchOffers)
    return data.map((item, index) => {
      // Calculate price and savings (same logic as in fetchOffers)
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
    console.error('Error in searchOffers:', error);
    return [];
  }
}

// Helper function to extract actual value from preference ID
// This handles the case where preference IDs are like 'b1', 's2', etc.
// but we need to match them against actual names in the offers
function extractPreferenceValue(prefId: string): string {
  // For IDs stored directly from Supabase data, they might be the actual values
  if (prefId.length > 3 && !prefId.startsWith('b') && !prefId.startsWith('s') && !prefId.startsWith('bk')) {
    return prefId;
  }
  
  // Try to find the preference in the mock data first
  const { mockBrands, mockStores, mockBanks } = require('@/mockData');
  
  if (prefId.startsWith('b')) {
    const brand = mockBrands.find(b => b.id === prefId);
    return brand ? brand.name : '';
  }
  
  if (prefId.startsWith('s')) {
    const store = mockStores.find(s => s.id === prefId);
    return store ? store.name : '';
  }
  
  if (prefId.startsWith('bk')) {
    const bank = mockBanks.find(b => b.id === prefId);
    return bank ? bank.name : '';
  }
  
  // If we can't extract, just return the original ID
  return prefId;
}

// Enhanced function to apply preferences to offers with better logging
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
      for (const prefId of preferences.stores) {
        const prefValue = extractPreferenceValue(prefId);
        if (prefValue && offer.store.toLowerCase().includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check brand/category preferences
    if (preferences.brands && preferences.brands.length > 0 && offer.category) {
      for (const prefId of preferences.brands) {
        const prefValue = extractPreferenceValue(prefId);
        if (prefValue && offer.category.toLowerCase().includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check bank preferences
    if (preferences.banks && preferences.banks.length > 0 && 
       (offer.description || offer.termsAndConditions || offer.longOffer)) {
      const fullText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      
      for (const prefId of preferences.banks) {
        const prefValue = extractPreferenceValue(prefId);
        if (prefValue && fullText.includes(prefValue.toLowerCase())) {
          return true;
        }
      }
    }
    
    // If no preferences match, don't include the offer
    return false;
  });
  
  console.log(`Filtered down to ${filteredOffers.length} offers matching preferences`);
  return filteredOffers;
}

// Function to manually trigger the LinkMyDeals sync with option to clear old data
export async function triggerLinkMyDealsSync(clearOldData: boolean = false): Promise<boolean> {
  try {
    console.log('Manually triggering LinkMyDeals sync...', clearOldData ? '(clearing old data)' : '');
    
    const { data, error } = await supabase.functions.invoke('sync-linkmydeals', {
      body: { manual: true, clearOldData }
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
