
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

// Function to fetch all offers
export async function fetchOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*, categories(*)');
  
  if (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
  
  // Transform the data to match our Offer type
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.image_url || "",
    store: item.store,
    category: item.categories?.name || "",
    price: Number(item.price),
    originalPrice: Number(item.original_price),
    expiryDate: item.expiry_date || "",
    location: item.location_lat && item.location_lng ? {
      lat: Number(item.location_lat),
      lng: Number(item.location_lng),
      address: item.location_address || ""
    } : undefined,
    isAmazon: item.is_amazon || false,
    affiliateLink: item.affiliate_link || undefined,
    terms: item.terms || undefined,
    savings: item.savings || "",
    // Map new fields
    lmdId: item.lmd_id || undefined,
    merchantHomepage: item.merchant_homepage || undefined,
    longOffer: item.long_offer || undefined,
    code: item.code || undefined,
    termsAndConditions: item.terms_and_conditions || undefined,
    featured: item.featured || false,
    publisherExclusive: item.publisher_exclusive || false,
    url: item.url || undefined,
    smartlink: item.smartlink || undefined,
    offerType: item.offer_type || undefined,
    offerValue: item.offer_value || undefined,
    status: item.status || undefined,
    startDate: item.start_date || undefined
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
