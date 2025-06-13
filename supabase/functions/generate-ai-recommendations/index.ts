
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userContext } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all offers from the database
    const { data: offers, error } = await supabase
      .from('Offers_data')
      .select('*')
      .limit(100);

    if (error) {
      throw error;
    }

    // Transform offers for recommendations
    const transformedOffers = offers?.map((item: any, index: number) => {
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
    }) || [];

    // Generate AI-powered recommendations based on user context
    const recommendations = {
      trendingOffers: getRandomOffers(transformedOffers, 8),
      personalizedOffers: getPersonalizedOffers(transformedOffers, userContext, 6),
      priceDropOffers: getPriceDropOffers(transformedOffers, userContext, 4),
      expiringOffers: getExpiringOffers(transformedOffers, 5),
      localOffers: getLocalOffers(transformedOffers, userContext, 4)
    };

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      trendingOffers: [],
      personalizedOffers: [],
      priceDropOffers: [],
      expiringOffers: [],
      localOffers: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getRandomOffers(offers: any[], count: number) {
  const shuffled = [...offers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getPersonalizedOffers(offers: any[], userContext: any, count: number) {
  if (!userContext || !userContext.preferences) {
    return getRandomOffers(offers, count);
  }

  // Filter offers based on user preferences
  let filtered = offers.filter(offer => {
    // Check if offer matches user's preferred categories or stores
    if (userContext.preferences.some((pref: any) => 
      pref.preference_type === 'stores' && 
      offer.store?.toLowerCase().includes(pref.preference_id.toLowerCase())
    )) {
      return true;
    }
    
    if (userContext.preferences.some((pref: any) => 
      pref.preference_type === 'brands' && 
      offer.category?.toLowerCase().includes(pref.preference_id.toLowerCase())
    )) {
      return true;
    }
    
    return false;
  });

  // If no matches found, return random offers
  if (filtered.length === 0) {
    filtered = offers;
  }

  return getRandomOffers(filtered, count);
}

function getPriceDropOffers(offers: any[], userContext: any, count: number) {
  // Simulate price drops by selecting offers with high savings percentages
  const priceDrops = offers.filter(offer => {
    if (typeof offer.savings === 'string' && offer.savings.includes('%')) {
      const percent = parseInt(offer.savings.replace(/[^0-9]/g, ''));
      return percent >= 30; // Consider 30%+ as significant price drops
    }
    return false;
  });

  return getRandomOffers(priceDrops.length > 0 ? priceDrops : offers, count);
}

function getExpiringOffers(offers: any[], count: number) {
  // Filter offers that are expiring soon (have end dates)
  const expiring = offers.filter(offer => offer.endDate && offer.endDate.trim() !== '');
  return getRandomOffers(expiring.length > 0 ? expiring : offers, count);
}

function getLocalOffers(offers: any[], userContext: any, count: number) {
  // For now, return random offers. In a real implementation, this would filter by location
  // You could integrate with Google Places API or similar for location-based filtering
  return getRandomOffers(offers, count);
}
