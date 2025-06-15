
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting preference-based notification job...");

    // 1. Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      console.log("No users found to notify.");
      return new Response(JSON.stringify({ message: "No users found" }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${profiles.length} profiles to process.`);
    let totalNotificationsCreated = 0;

    // 2. Process each user individually
    for (const profile of profiles) {
      const userId = profile.id;

      // 3. Fetch preferences for the current user
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('preference_type, preference_id')
        .eq('user_id', userId);

      if (preferencesError) {
        console.error(`Error fetching preferences for user ${userId}:`, preferencesError.message);
        continue;
      }
      if (!preferences || preferences.length === 0) {
        continue; // Skip user if they have no preferences
      }

      // Group preferences by type (e.g., 'stores', 'brands')
      const groupedPreferences = preferences.reduce((acc, pref) => {
        if (!acc[pref.preference_type]) {
          acc[pref.preference_type] = [];
        }
        acc[pref.preference_type].push(pref.preference_id);
        return acc;
      }, {} as { [key: string]: string[] });
      
      // 4. Build a dynamic query to find matching offers
      const orConditions: string[] = [];
      if (groupedPreferences.stores?.length > 0) {
        orConditions.push(...groupedPreferences.stores.map(s => `store.ilike.%${s}%`));
      }
      if (groupedPreferences.brands?.length > 0) {
        orConditions.push(...groupedPreferences.brands.map(b => `categories.ilike.%${b}%`));
      }
      if (groupedPreferences.banks?.length > 0) {
        const bankConditions = groupedPreferences.banks
          .map(b => `description.ilike.%${b}%,terms_and_conditions.ilike.%${b}%`);
        orConditions.push(...bankConditions);
      }
      
      if(orConditions.length === 0) {
        continue;
      }
      
      const finalOrQuery = orConditions.join(',');

      // Fetch offers that match any of the user's preferences
      const { data: offers, error: offersError } = await supabase
        .from('Offers_data')
        .select('lmd_id, title, store, categories, description, terms_and_conditions')
        .or(finalOrQuery);

      if (offersError) {
        console.error(`Error fetching matching offers for user ${userId}:`, offersError.message);
        continue;
      }
      if (!offers || offers.length === 0) {
        continue;
      }

      // 5. Filter out offers for which notifications have already been sent
      const offerIds = offers.map(o => `offer-${o.lmd_id}`);
      const { data: sentNotifications, error: sentError } = await supabase
        .from('preference_notification_log')
        .select('offer_id')
        .eq('user_id', userId)
        .in('offer_id', offerIds);

      if (sentError) {
        console.error(`Error checking sent notifications for user ${userId}:`, sentError.message);
        continue;
      }
      
      const sentOfferIds = new Set(sentNotifications.map(n => n.offer_id));
      const newMatchingOffers = offers.filter(o => !sentOfferIds.has(`offer-${o.lmd_id}`));

      if (newMatchingOffers.length === 0) {
        continue;
      }
      
      console.log(`Found ${newMatchingOffers.length} new matching offers for user ${userId}.`);

      // 6. Create notifications and log them
      const notificationsToInsert = newMatchingOffers.map(offer => ({
        user_id: userId,
        title: 'New Offer Matches Your Preference!',
        message: `We found a new offer for you: ${offer.title}`,
        type: 'preference',
        offer_id: `offer-${offer.lmd_id}`
      }));
      
      const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);

      if (insertError) {
        console.error(`Error inserting notifications for user ${userId}:`, insertError.message);
        continue;
      }
      
      // 7. Log that notifications have been sent to prevent duplicates
      const logsToInsert = newMatchingOffers.map(offer => ({
        user_id: userId,
        offer_id: `offer-${offer.lmd_id}`,
      }));
      
      const { error: logInsertError } = await supabase.from('preference_notification_log').insert(logsToInsert);
      
      if (logInsertError) {
        console.error(`Error inserting notification logs for user ${userId}:`, logInsertError.message);
      } else {
        totalNotificationsCreated += newMatchingOffers.length;
        console.log(`Successfully created ${newMatchingOffers.length} notifications for user ${userId}.`);
      }
    }

    const result = {
      success: true,
      message: "Preference-based notification job finished.",
      stats: {
        processedUsers: profiles.length,
        totalNotificationsCreated,
      }
    };
    
    return new Response(JSON.stringify(result), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Error in preference notification job:", error);
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
