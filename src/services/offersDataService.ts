
import { supabase } from "@/integrations/supabase/client";
import { Offer, Category } from "@/types";
import { mockCategories, mockOffers } from "@/mockData";

// Function to fetch all offers from the OffersData table
export async function fetchOffersFromOffersData(): Promise<Offer[]> {
  try {
    console.log('Fetching offers from OffersData table...');
    const { data, error } = await supabase
      .from('OffersData')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching offers from OffersData table:', error);
      throw error;
    }
    
    console.log('OffersData table results:', data ? data.length : 0, 'records found');
    
    // If no data is found in the OffersData table, use mock data
    if (!data || data.length === 0) {
      console.log('No data found in OffersData table, falling back to mock data');
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
        id: `offersdata-${item.lmd_id}`,
        title: item.title || "",
        description: item.description || item.offer_text || "",
        imageUrl: item.image_url || "",
        store: item.store || "",
        category: item.categories || "",
        price: price,
        originalPrice: originalPrice,
        expiryDate: item.end_date || "",
        isAmazon: isAmazon,
        savings: savings,
        // Fields from the OffersData table
        lmdId: Number(item.lmd_id) || 0,
        merchantHomepage: item.merchant_homepage || "",
        longOffer: item.offer_text || "",
        code: item.code || "",
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        url: item.url || "",
        smartlink: item.smartLink || "",
        offerType: item.type || "",
        offerValue: item.offer_value || "",
        status: item.status || "",
        startDate: item.start_date || "",
        endDate: item.end_date || "",
        categories: item.categories || ""
      };
    });
  } catch (error) {
    console.error('Error in fetchOffersFromOffersData, falling back to mock data:', error);
    return mockOffers;
  }
}

// Function to search offers in OffersData table
export async function searchOffersInOffersData(query: string): Promise<Offer[]> {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const searchTerm = `%${query}%`;
    
    const { data, error } = await supabase
      .from('OffersData')
      .select('*')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},store.ilike.${searchTerm},categories.ilike.${searchTerm}`)
      .limit(20);
      
    if (error) {
      console.error('Error searching offers in OffersData:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform data to Offer type (reuse the transformation logic from fetchOffersFromOffersData)
    return data.map((item, index) => {
      // Calculate price and savings (same logic as in fetchOffersFromOffersData)
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
        id: `offersdata-${item.lmd_id}`,
        title: item.title || "",
        description: item.description || item.offer_text || "",
        imageUrl: item.image_url || "",
        store: item.store || "",
        category: item.categories || "",
        price: price,
        originalPrice: originalPrice,
        expiryDate: item.end_date || "",
        isAmazon: isAmazon,
        savings: savings,
        // Fields from the OffersData table
        lmdId: Number(item.lmd_id) || 0,
        merchantHomepage: item.merchant_homepage || "",
        longOffer: item.offer_text || "",
        code: item.code || "",
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured === "true" || item.featured === "1",
        publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
        url: item.url || "",
        smartlink: item.smartLink || "",
        offerType: item.type || "",
        offerValue: item.offer_value || "",
        status: item.status || "",
        startDate: item.start_date || "",
        endDate: item.end_date || "",
        categories: item.categories || ""
      };
    });
  } catch (error) {
    console.error('Error in searchOffersInOffersData:', error);
    return [];
  }
}

// Function to manually trigger the daily offers sync
export async function triggerDailyOffersSync(): Promise<boolean> {
  try {
    console.log('Manually triggering daily offers sync...');
    
    const { data, error } = await supabase.functions.invoke('sync-offers-daily', {
      body: { manual: true }
    });
    
    if (error) {
      console.error('Error triggering daily offers sync:', error);
      return false;
    }
    
    console.log('Daily sync trigger response:', data);
    return data.success === true;
  } catch (error) {
    console.error('Error in triggerDailyOffersSync:', error);
    return false;
  }
}

// Function to get daily sync status
export async function getDailySyncStatus(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('api_sync_status')
      .select('*')
      .eq('id', 'offersdata')
      .single();
      
    if (error) {
      console.error('Error fetching daily sync status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDailySyncStatus:', error);
    return null;
  }
}
