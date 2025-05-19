
import { supabase } from "@/integrations/supabase/client";
import { Offer, Category } from "@/types";
import { mockCategories, mockOffers } from "@/mockData";

// Function to fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Supabase...');
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched:', data ? data.length : 0);
    
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
            const cats = item.categories.split(',').map(c => c.trim());
            cats.forEach(catName => {
              if (catName && !categoryMap.has(catName.toLowerCase())) {
                const id = catName.toLowerCase().replace(/\s+/g, '-');
                categoryMap.set(catName.toLowerCase(), {
                  id,
                  name: catName,
                  icon: '🏷️', // Default icon
                  subcategories: []
                });
              }
            });
          }
        });
        
        const extractedCategories = Array.from(categoryMap.values());
        console.log('Extracted categories from Data table:', extractedCategories.length);
        
        if (extractedCategories.length > 0) {
          return extractedCategories;
        }
      }
      
      console.log('No categories found in database, using mock data');
      return mockCategories;
    }
    
    // Transform the data to match our Category type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      subcategories: []  // We don't have subcategories in the DB schema yet
    }));
  } catch (error) {
    console.error('Error in fetchCategories, falling back to mock data:', error);
    return mockCategories;
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

// Function to fetch user preferences
export async function fetchUserPreferences(userId: string, preferenceType: string = 'all'): Promise<any[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch preferences');
    }
    
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
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserPreferences:', error);
    return [];
  }
}

// Function to apply preferences to offers
export function applyPreferencesToOffers(offers: Offer[], preferences: {[key: string]: string[]}): Offer[] {
  if (!preferences || Object.keys(preferences).length === 0) {
    return offers;
  }
  
  return offers.filter(offer => {
    // Check store preferences
    if (preferences.stores && preferences.stores.length > 0 && offer.store) {
      const storeMatch = preferences.stores.some(prefId => 
        offer.store.toLowerCase().includes(prefId.toLowerCase()) ||
        prefId.toLowerCase().includes(offer.store.toLowerCase())
      );
      
      if (storeMatch) {
        return true;
      }
    }
    
    // Check brand/category preferences
    if (preferences.brands && preferences.brands.length > 0 && offer.category) {
      const categoryMatch = preferences.brands.some(prefId => 
        offer.category.toLowerCase().includes(prefId.toLowerCase()) ||
        prefId.toLowerCase().includes(offer.category.toLowerCase())
      );
      
      if (categoryMatch) {
        return true;
      }
    }
    
    // Check bank preferences
    if (preferences.banks && preferences.banks.length > 0 && offer.description) {
      const bankMatch = preferences.banks.some(prefId => 
        offer.description.toLowerCase().includes(prefId.toLowerCase())
      );
      
      if (bankMatch) {
        return true;
      }
    }
    
    // If no preferences match or if preferences array is empty, include the offer if we have no preferences
    return Object.keys(preferences).every(key => preferences[key].length === 0);
  });
}
