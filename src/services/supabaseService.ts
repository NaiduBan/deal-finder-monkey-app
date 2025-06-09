import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';

export const fetchOffers = async (): Promise<Offer[]> => {
  try {
    console.log('Fetching all offers from Offers_data table...');
    
    const { data, error } = await supabase
      .from('Offers_data')
      .select('*');

    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No offers found in database');
      return [];
    }

    console.log(`Found ${data.length} offers from database`);

    const mappedOffers: Offer[] = data.map(item => ({
      id: item.lmd_id?.toString() || Math.random().toString(),
      title: item.title || 'No Title',
      description: item.description || item.long_offer || 'No description available',
      store: item.store || 'Unknown Store',
      category: item.categories || 'General',
      originalPrice: item.offer_value ? parseFloat(item.offer_value.replace(/[^\d.]/g, '')) || 0 : 0,
      discountedPrice: item.offer_value ? parseFloat(item.offer_value.replace(/[^\d.]/g, '')) * 0.8 || 0 : 0,
      discountPercentage: Math.floor(Math.random() * 50) + 10,
      imageUrl: item.image_url || '/placeholder.svg',
      couponCode: item.code || undefined,
      expiryDate: item.end_date || undefined,
      isAmazon: item.store?.toLowerCase().includes('amazon') || false,
      terms: item.terms_and_conditions || undefined,
      offerUrl: item.url || item.smartlink || '#',
      featured: item.featured === 'true' || item.featured === '1',
      startDate: item.start_date || undefined,
      merchantHomepage: item.merchant_homepage || undefined,
      type: item.type || 'offer',
      status: item.status || 'active'
    }));

    console.log('Mapped offers:', mappedOffers);
    return mappedOffers;
  } catch (error) {
    console.error('Error in fetchOffers:', error);
    return [];
  }
};

export const applyPreferencesToOffers = (offers: Offer[], preferences: {[key: string]: string[]}): Offer[] => {
  console.log('Applying preferences to offers:', preferences);

  if (!offers || offers.length === 0) {
    console.log('No offers to filter');
    return [];
  }

  let filteredOffers = [...offers];

  if (preferences.brands && preferences.brands.length > 0) {
    console.log('Filtering by brands:', preferences.brands);
    filteredOffers = filteredOffers.filter(offer => 
      offer.title && preferences.brands.some(brand => 
        offer.title.toLowerCase().includes(brand.toLowerCase())
      )
    );
  }

  if (preferences.stores && preferences.stores.length > 0) {
    console.log('Filtering by stores:', preferences.stores);
    filteredOffers = filteredOffers.filter(offer => 
      offer.store && preferences.stores.some(store => 
        offer.store.toLowerCase().includes(store.toLowerCase())
      )
    );
  }

  if (preferences.banks && preferences.banks.length > 0) {
    console.log('Filtering by banks:', preferences.banks);
    filteredOffers = filteredOffers.filter(offer => {
      const descriptionIncludesBank = offer.description && preferences.banks.some(bank =>
        offer.description.toLowerCase().includes(bank.toLowerCase())
      );
      const titleIncludesBank = offer.title && preferences.banks.some(bank =>
        offer.title.toLowerCase().includes(bank.toLowerCase())
      );
      return descriptionIncludesBank || titleIncludesBank;
    });
  }

  console.log('Filtered offers count:', filteredOffers.length);
  return filteredOffers;
};
