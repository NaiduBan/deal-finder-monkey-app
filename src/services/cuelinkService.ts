
import { supabase } from '@/integrations/supabase/client';
import { CuelinkOffer } from '@/types';

export const fetchCuelinkOffers = async (): Promise<CuelinkOffer[]> => {
  try {
    console.log('Fetching all offers from Cuelink_data table...');
    
    const { data, error } = await supabase
      .from('Cuelink_data')
      .select('*');

    if (error) {
      console.error('Error fetching Cuelink offers:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No Cuelink offers found in database');
      return [];
    }

    console.log(`Found ${data.length} Cuelink offers from database`);

    // Map the database fields to match our CuelinkOffer type
    const mappedOffers: CuelinkOffer[] = data.map(item => ({
      Id: item.Id,
      Title: item.Title,
      Description: item.Description,
      'Image URL': item['Image URL'],
      Merchant: item.Merchant,
      Categories: item.Categories,
      Terms: item.Terms,
      'Campaign Name': item['Campaign Name'],
      'Campaign ID': item['Campaign ID'],
      'Offer Added At': item['Offer Added At'],
      'End Date': item['End Date'],
      'Start Date': item['Start Date'],
      Status: item.Status,
      URL: item.URL,
      'Coupon Code': item['Coupon Code']
    }));

    console.log('Mapped Cuelink offers:', mappedOffers);
    return mappedOffers;
  } catch (error) {
    console.error('Error in fetchCuelinkOffers:', error);
    return [];
  }
};
