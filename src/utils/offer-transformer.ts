
import { Offer } from '@/types';

export const transformSupabaseOffer = (item: any, index?: number): Offer => {
  // This logic is copied from `fetchOffers` in `supabaseService.ts` to ensure consistency.
  let price = 0;
  let originalPrice = 0;
  let savings = '';
  
  if (item.offer_value) {
    const offerValue = item.offer_value;
    if (offerValue.includes('%')) {
      const percent = parseInt(offerValue.replace(/[^0-9]/g, ''));
      originalPrice = Math.floor(1000 + Math.random() * 9000);
      price = Math.floor(originalPrice * (1 - percent / 100));
      savings = `${percent}% OFF`;
    } else if (offerValue.match(/\d+/)) {
      const amount = parseInt(offerValue.replace(/[^0-9]/g, ''));
      price = amount;
      originalPrice = price + Math.floor(Math.random() * 500) + 100;
      savings = `Save ₹${originalPrice - price}`;
    } else {
      price = Math.floor(Math.random() * 1000) + 100;
      originalPrice = price + Math.floor(Math.random() * 500) + 100;
      savings = `Save ₹${originalPrice - price}`;
    }
  } else {
    price = Math.floor(Math.random() * 1000) + 100;
    originalPrice = price + Math.floor(Math.random() * 500) + 100;
    savings = `Save ₹${originalPrice - price}`;
  }

  const isAmazon = (item.store && item.store.toLowerCase().includes('amazon')) || 
                  (item.merchant_homepage && item.merchant_homepage.toLowerCase().includes('amazon'));
  
  return {
    id: `offer-${item.lmd_id || (index !== undefined ? index : Math.random())}`,
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
    banner: item.banner === true,
    url: item.url || "",
    smartlink: item.smartlink || "",
    offerType: item.type || "",
    offerValue: item.offer_value || "",
    status: item.status || "",
    startDate: item.start_date || "",
    endDate: item.end_date || "",
    categories: item.categories || ""
  };
};
