
import { supabase } from '@/integrations/supabase/client';
import { CuelinkOffer, Offer } from '@/types';

export const fetchCuelinkOffers = async (): Promise<Offer[]> => {
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

    // Transform Cuelink data to Offer format
    const transformedOffers: Offer[] = data.map((cuelinkOffer: CuelinkOffer) => ({
      id: `cuelink_${cuelinkOffer.Id}`,
      title: cuelinkOffer.Title || 'Flash Deal',
      description: cuelinkOffer.Description || '',
      imageUrl: cuelinkOffer['Image URL'] || null,
      store: cuelinkOffer.Merchant || 'Unknown Store',
      category: cuelinkOffer.Categories || 'General',
      price: 0, // Cuelink doesn't have price info
      originalPrice: 0,
      expiryDate: cuelinkOffer['End Date'] || '',
      isAmazon: false,
      affiliateLink: cuelinkOffer.URL || null,
      terms: cuelinkOffer.Terms || null,
      savings: 'Special Deal',
      lmdId: cuelinkOffer.Id,
      merchantHomepage: null,
      longOffer: cuelinkOffer.Description || null,
      code: cuelinkOffer['Coupon Code'] || null,
      termsAndConditions: cuelinkOffer.Terms || null,
      featured: true, // Mark Cuelink offers as featured
      publisherExclusive: false,
      url: cuelinkOffer.URL || null,
      smartlink: null,
      offerType: 'flash_deal',
      offerValue: null,
      status: cuelinkOffer.Status || 'active',
      startDate: cuelinkOffer['Start Date'] || null,
      endDate: cuelinkOffer['End Date'] || null,
      categories: cuelinkOffer.Categories || null,
    }));

    return transformedOffers;
  } catch (error) {
    console.error('Error in fetchCuelinkOffers:', error);
    return [];
  }
};
