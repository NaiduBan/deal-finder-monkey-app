
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = "https://mmqkvjxsxufozfgqjoxz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINKMYDEALS_API_KEY = "c291177d82720f6ba86a97869a17c310";

// Initialize the Supabase client with the service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting LinkMyDeals API sync job...");
    
    // Check if this is a manual trigger or scheduled
    let isManualTrigger = false;
    
    try {
      const body = await req.json();
      isManualTrigger = body.manual === true;
    } catch (e) {
      // No body or invalid JSON, assume scheduled job
    }
    
    // Get the current sync status
    let { data: syncStatus, error: getError } = await supabase
      .from("api_sync_status")
      .select("*")
      .eq("id", "linkmydeals")
      .single();

    if (getError) {
      console.error("Error fetching sync status:", getError);
      throw new Error(`Failed to get sync status: ${getError.message}`);
    }

    // Create status record if it doesn't exist
    if (!syncStatus) {
      console.log("No sync status found, creating initial record");
      const { error: createError } = await supabase
        .from("api_sync_status")
        .insert({
          id: "linkmydeals",
          last_sync_status: "pending",
          last_sync_message: "Initial sync pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          daily_extracts: 0,
          daily_extracts_reset_date: new Date().toISOString().split('T')[0]
        });
      
      if (createError) {
        console.error("Error creating sync status:", createError);
        throw new Error(`Failed to create sync status: ${createError.message}`);
      }
      
      syncStatus = {
        id: "linkmydeals",
        last_extract: null,
        last_sync_status: "pending",
        last_sync_message: "Initial sync pending",
        daily_extracts: 0,
        daily_extracts_reset_date: new Date().toISOString().split('T')[0]
      };
    }

    // Check daily quota limit - 25 extracts per day
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    // Reset counter if it's a new day
    if (syncStatus.daily_extracts_reset_date !== today) {
      console.log("New day detected, resetting daily extract counter");
      await supabase
        .from("api_sync_status")
        .update({
          daily_extracts: 0,
          daily_extracts_reset_date: today
        })
        .eq("id", "linkmydeals");
      
      // Update our local copy too
      syncStatus.daily_extracts = 0;
      syncStatus.daily_extracts_reset_date = today;
    }
    
    // Check if we've hit the daily limit (25 extracts)
    if (syncStatus.daily_extracts >= 25 && !isManualTrigger) {
      console.log("Daily extract limit of 25 reached. Skipping scheduled sync.");
      
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "skipped",
          last_sync_message: "Daily extract limit reached (25/25 used today)",
          updated_at: new Date().toISOString()
        })
        .eq("id", "linkmydeals");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Skipped extract due to daily limit (25/25)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // For manual triggers, warn but proceed if we're at the limit
    if (syncStatus.daily_extracts >= 25 && isManualTrigger) {
      console.log("WARNING: Daily extract limit reached, but proceeding due to manual trigger");
    }
      
    const lastExtract = syncStatus?.last_extract;
    console.log(`Last extract timestamp: ${lastExtract}`);
    
    // Update sync status to indicate we're starting the sync
    await supabase
      .from("api_sync_status")
      .update({
        last_sync_status: "in_progress",
        last_sync_message: "Sync in progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", "linkmydeals");
    
    // Build API URL - use full data fetch for first load or manual triggers
    // Use incremental for automatic updates after the first load
    let apiUrl;
    
    if (!lastExtract || isManualTrigger) {
      apiUrl = `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json`;
      console.log("Using full data fetch mode");
    } else {
      apiUrl = `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json&incremental=1`;
      console.log("Using incremental fetch mode");
    }

    console.log(`Fetching data from API: ${apiUrl}`);
    
    // Add timeout to fetch to avoid hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(apiUrl, { 
      signal: controller.signal,
      headers: {
        "User-Agent": "MonkeyDeals/1.0 (+https://monkeydeals.app)"
      }
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`API response not OK: ${response.status} - ${responseText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing API response as JSON:", e);
      throw new Error(`Failed to parse API response: ${e.message}`);
    }
    
    console.log(`Fetched ${data.metadata?.totalOffersReturned || 0} offers`);

    // Handle the case where no offers are returned
    if (!data.metadata || !data.offers || data.metadata.totalOffersReturned === 0) {
      // Update sync status with success but no data
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "success",
          last_sync_message: "No new offers to sync",
          updated_at: new Date().toISOString(),
          daily_extracts: syncStatus.daily_extracts + 1
        })
        .eq("id", "linkmydeals");
        
      return new Response(
        JSON.stringify({ success: true, message: "No new offers to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process offers - prepare for upsert with proper data validation
    const offers = data.offers.map((offer: any) => ({
      lmd_id: parseInt(offer.lmd_id),
      title: offer.title || "",
      description: offer.description || "",
      offer: offer.offer || "",
      code: offer.code || "",
      terms_and_conditions: offer.terms || "",
      categories: offer.categories || "",
      featured: offer.featured || "No",
      publisher_exclusive: offer.publisher_exclusive || "N",
      url: offer.url || "",
      image_url: offer.image_url || "",
      type: offer.type || "",
      status: offer.status || "active",
      offer_value: offer.offer_value || "",
      store: offer.store || "",
      long_offer: offer.long_offer || "",
      merchant_homepage: offer.merchant_homepage || "",
      smartlink: offer.aff_link || "",
      end_date: offer.end_date || "",
      start_date: offer.start_date || ""
    }));

    console.log(`Processing ${offers.length} offers...`);

    // Update existing records and insert new ones based on lmd_id
    const { error: upsertError } = await supabase.from("Data").upsert(offers, {
      onConflict: "lmd_id",
      ignoreDuplicates: false
    });

    if (upsertError) {
      console.error("Error upserting offers:", upsertError);
      throw new Error(`Failed to upsert offers: ${upsertError.message}`);
    }

    // Remove expired offers - use the current date to find and remove expired offers
    const today_date = new Date();
    console.log(`Removing offers expired before: ${today_date.toISOString().split('T')[0]}`);
    
    const { data: expiredData, error: countError } = await supabase
      .from("Data")
      .select("count()")
      .lt("end_date", today_date.toISOString().split('T')[0]);
      
    const expiredCount = expiredData?.[0]?.count || 0;
    console.log(`Found ${expiredCount} expired offers to remove`);
    
    const { error: deleteError } = await supabase
      .from("Data")
      .delete()
      .lt("end_date", today_date.toISOString().split('T')[0]);

    if (deleteError) {
      console.error("Error removing expired offers:", deleteError);
      // Don't throw here, just log the error
    }

    // Update sync status with success and increment daily extract counter
    await supabase
      .from("api_sync_status")
      .update({
        last_extract: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_message: `Successfully synced ${offers.length} offers and removed ${expiredCount} expired offers`,
        updated_at: new Date().toISOString(),
        daily_extracts: syncStatus.daily_extracts + 1
      })
      .eq("id", "linkmydeals");

    console.log(`LinkMyDeals sync completed successfully. Daily extracts used: ${syncStatus.daily_extracts + 1}/25`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${offers.length} offers and removed ${expiredCount} expired offers`,
        daily_extracts_used: syncStatus.daily_extracts + 1,
        daily_extracts_remaining: 25 - (syncStatus.daily_extracts + 1)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in LinkMyDeals sync:", error);
    
    // Update sync status with error
    await supabase
      .from("api_sync_status")
      .update({
        last_sync_status: "error",
        last_sync_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "linkmydeals");
      
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
