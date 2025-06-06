
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';

export interface SearchFilters {
  keyword?: string;
  category?: string;
  store?: string;
  minPrice?: number;
  maxPrice?: number;
  discountMin?: number;
  location?: string;
  featured?: boolean;
}

export const searchOffers = async (filters: SearchFilters) => {
  try {
    let query = supabase
      .from('Offers_data')
      .select('*');

    // Apply keyword search
    if (filters.keyword) {
      query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,store.ilike.%${filters.keyword}%`);
    }

    // Apply category filter
    if (filters.category) {
      query = query.ilike('categories', `%${filters.category}%`);
    }

    // Apply store filter
    if (filters.store) {
      query = query.ilike('store', `%${filters.store}%`);
    }

    // Apply featured filter
    if (filters.featured) {
      query = query.eq('featured', 'true');
    }

    const { data, error } = await query
      .order('lmd_id', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Transform data to Offer format
    const offers: Offer[] = (data || []).map((item: any, index: number) => {
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

    // Apply client-side filters for price and discount
    let filteredOffers = offers;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filteredOffers = filteredOffers.filter(offer => {
        if (filters.minPrice !== undefined && offer.price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && offer.price > filters.maxPrice) return false;
        return true;
      });
    }

    if (filters.discountMin !== undefined) {
      filteredOffers = filteredOffers.filter(offer => {
        if (offer.savings.includes('%')) {
          const discount = parseInt(offer.savings.replace('%', ''));
          return discount >= filters.discountMin!;
        }
        return true;
      });
    }

    return filteredOffers;
  } catch (error) {
    console.error('Error searching offers:', error);
    return [];
  }
};

export const getPopularSearchTerms = async () => {
  try {
    // This would typically come from analytics, but for now return some common terms
    return [
      'electronics', 'fashion', 'food', 'travel', 'books', 
      'beauty', 'home', 'sports', 'automotive', 'health'
    ];
  } catch (error) {
    console.error('Error fetching popular search terms:', error);
    return [];
  }
};
