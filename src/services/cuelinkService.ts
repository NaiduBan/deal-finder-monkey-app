
import { supabase } from '@/integrations/supabase/client';
import { CuelinkOffer } from '@/types';

export const fetchCuelinkOffers = async (): Promise<CuelinkOffer[]> => {
  try {
    console.log('Fetching offers from Cuelink_data table...');
    
    const { data, error } = await supabase
      .from('Cuelink_data')
      .select('*')
      .eq('Status', 'active')
      .limit(50);

    if (error) {
      console.error('Error fetching Cuelink offers:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No Cuelink offers found');
      return [];
    }

    console.log(`Found ${data.length} Cuelink offers`);

    // Return the data as CuelinkOffer[] directly since it matches our type
    return data as CuelinkOffer[];
  } catch (error) {
    console.error('Error in fetchCuelinkOffers:', error);
    return [];
  }
};
