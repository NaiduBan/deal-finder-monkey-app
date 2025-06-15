
import { supabase } from "@/integrations/supabase/client";
import { Offer, Category } from "@/types";

// Function to fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Supabase...');
    const { data, error } = await (supabase as any)
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched from categories table:', data ? data.length : 0);
    
    // If no categories found, try to extract categories from Offers_data table
    if (!data || data.length === 0) {
      console.log('No categories found in categories table, attempting to extract from Offers_data table');
      
      const { data: offersData, error: offersError } = await (supabase as any)
        .from('Offers_data')
        .select('categories')
        .not('categories', 'is', null);
        
      if (offersError) {
        console.error('Error fetching categories from Offers_data table:', offersError);
        return [];
      }
      
      if (offersData && offersData.length > 0) {
        // Extract unique categories from Offers_data table
        const categoryMap = new Map<string, Category>();
        
        offersData.forEach((item: any) => {
          if (item.categories) {
            const cats = item.categories.split(',').map((c: string) => c.trim());
            cats.forEach((catName: string, index: number) => {
              if (catName && !categoryMap.has(catName.toLowerCase())) {
                const id = `cat-${categoryMap.size + index}`;
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
        console.log('Extracted categories from Offers_data table:', extractedCategories.length);
        
        // Store the extracted categories in the categories table for future use
        if (extractedCategories.length > 0) {
          try {
            const { error: insertError } = await (supabase as any)
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
      
      console.log('No categories found in database');
      return [];
    }
    
    // Transform the data to match our Category type
    return data.map((item: any) => ({
      id: item.id || `cat-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      icon: item.icon || getCategoryIcon(item.name),
      subcategories: []
    }));
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
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
    return 'shopping-bag';
  }
}

// Function to fetch all offers from the Offers_data table
export async function fetchOffers(): Promise<Offer[]> {
  try {
    console.log('Fetching fresh offers from Offers_data table...');
    const { data, error } = await (supabase as any)
      .from('Offers_data')
      .select('*')
      .order('lmd_id', { ascending: false })
      .limit(200);
    
    if (error) {
      console.error('Error fetching offers from Offers_data table:', error);
      throw error;
    }
    
    console.log('Offers_data table results:', data ? data.length : 0, 'records found');
    
    if (!data || data.length === 0) {
      console.log('No data found in Offers_data table');
      return [];
    }
    
    // Transform the data to match our Offer type
    return data.map((item: any, index: number) => {
      // Calculate price and savings
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
        id: `offer-${item.lmd_id || index}`,
        title: item.title || "",
        description: item.description || item.long_offer || item.offer || "",
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
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        sponsored: item.sponsored === true,
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
    console.error('Error in fetchOffers:', error);
    return [];
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
    
    const { data, error } = await (supabase as any)
      .from('saved_offers')
      .select('offer_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching saved offers:', error);
      throw error;
    }
    
    return data ? data.map((item: any) => item.offer_id) : [];
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
    
    const { error } = await (supabase as any)
      .from('saved_offers')
      .insert({
        user_id: userId,
        offer_id: offerId
      });
      
    if (error) {
      if (error.code === '23505') {
        console.log('Offer already saved for this user');
        return true;
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
    
    const { error } = await (supabase as any)
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
    
    console.log(`Fetching ${preferenceType} preferences for user ${userId}`);
    
    let query = (supabase as any)
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

// Function to save user preference
export async function saveUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  try {
    if (!userId || !preferenceType || !preferenceId) {
      throw new Error('User ID, preference type, and preference ID are required');
    }
    
    console.log(`Saving preference for user ${userId}: ${preferenceType} - ${preferenceId}`);
    
    const { data: existingPreference, error: checkError } = await (supabase as any)
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .eq('preference_id', preferenceId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing preference:', checkError);
      return false;
    }
    
    if (existingPreference) {
      console.log('Preference already exists, skipping save operation');
      return true;
    }
    
    const { error } = await (supabase as any)
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

// Function to remove user preference
export async function removeUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  try {
    if (!userId || !preferenceType || !preferenceId) {
      throw new Error('User ID, preference type, and preference ID are required');
    }
    
    console.log(`Removing preference for user ${userId}: ${preferenceType} - ${preferenceId}`);
    
    const { error } = await (supabase as any)
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
    
    const { error } = await (supabase as any)
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
    
    const { data, error } = await (supabase as any)
      .from('Offers_data')
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
    
    return data.map((item: any, index: number) => {
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
        id: `offer-${item.lmd_id || index}`,
        title: item.title || "",
        description: item.description || item.long_offer || item.offer || "",
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
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        sponsored: item.sponsored === true,
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

// Function to apply preferences to offers
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
