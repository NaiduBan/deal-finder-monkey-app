
import { supabase } from "@/integrations/supabase/client";
import { Offer, Category } from "@/types";

// Function to fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  // Transform the data to match our Category type
  return data.map(item => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    subcategories: []  // We don't have subcategories in the DB schema yet
  }));
}

// Function to fetch all offers from the Data table
export async function fetchOffers(): Promise<Offer[]> {
  console.log('Fetching offers from Data table...');
  const { data, error } = await supabase
    .from('Data')
    .select('*');
  
  if (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
  
  console.log('Data table results:', data ? data.length : 0, 'records found');
  
  // If no data is found, try to fall back to the mockOffers
  if (!data || data.length === 0) {
    console.log('No data found in Data table, falling back to mock data');
    const { mockOffers } = await import('@/mockData');
    return mockOffers;
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
    lmdId: item.lmd_id,
    merchantHomepage: item.merchant_homepage,
    longOffer: item.long_offer,
    code: item.code,
    termsAndConditions: item.terms_and_conditions,
    featured: item.featured === "true" || item.featured === "1",
    publisherExclusive: item.publisher_exclusive === "true" || item.publisher_exclusive === "1",
    url: item.url,
    smartlink: item.smartlink,
    offerType: item.type,
    offerValue: item.offer_value,
    status: item.status,
    startDate: item.start_date,
    endDate: item.end_date,
    categories: item.categories
  }));
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
