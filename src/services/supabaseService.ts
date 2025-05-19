
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
    
    // If no categories found, throw an error to trigger fallback
    if (!data || data.length === 0) {
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
      console.error('Error fetching offers:', error);
      throw error;
    }
    
    console.log('Data table results:', data ? data.length : 0, 'records found');
    
    // If no data is found in the Data table, try the offers table
    if (!data || data.length === 0) {
      console.log('No data found in Data table, checking offers table');
      
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*');
      
      if (offersError) {
        console.error('Error fetching from offers table:', offersError);
        throw offersError;
      }
      
      console.log('Offers table results:', offersData ? offersData.length : 0, 'records found');
      
      // If still no data, fall back to mock data
      if (!offersData || offersData.length === 0) {
        console.log('No data in offers table either, falling back to mock data');
        return mockOffers;
      }
      
      // Transform the data from the offers table to match our Offer type
      return offersData.map((item) => ({
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        imageUrl: item.image_url || "",
        store: item.store || "",
        category: item.category_id || "",
        price: item.price || 0,
        originalPrice: item.original_price || 0,
        expiryDate: item.expiry_date || "",
        isAmazon: item.is_amazon || false,
        savings: item.savings || "",
        // Fields from the Offers table
        lmdId: item.lmd_id || 0,
        merchantHomepage: item.merchant_homepage || "",
        longOffer: item.long_offer || "",
        code: item.code || "",
        termsAndConditions: item.terms_and_conditions || "",
        featured: item.featured || false,
        publisherExclusive: item.publisher_exclusive || false,
        url: item.url || "",
        smartlink: item.smartlink || "",
        offerType: item.offer_type || "",
        offerValue: item.offer_value || "",
        status: item.status || "",
        startDate: item.start_date || "",
        endDate: item.expiry_date || "",
        categories: ""
      }));
    }
    
    // Generate random IDs for offers from Data table since they don't have IDs
    // Transform the data to match our Offer type
    return data.map((item, index) => ({
      id: `data-${item.lmd_id || index}`,
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.image_url || "",
      store: item.store || "",
      category: item.categories || "",
      // Use placeholder values for required fields that don't exist in Data table
      price: 0, 
      originalPrice: 0,
      expiryDate: item.end_date || "",
      isAmazon: false,
      savings: "",
      // Fields from the Data table
      lmdId: item.lmd_id || 0,
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
    }));
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
