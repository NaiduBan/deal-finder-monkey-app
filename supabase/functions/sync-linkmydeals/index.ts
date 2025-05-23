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
    
    // Check if this is a manual trigger, scheduled job, or clear old data request
    let isManualTrigger = false;
    let isScheduledJob = false;
    let clearOldData = false;
    
    try {
      const body = await req.json();
      isManualTrigger = body.manual === true;
      isScheduledJob = body.scheduled === true;
      clearOldData = body.clearOldData === true;
    } catch (e) {
      // No body or invalid JSON, assume manual trigger
      isManualTrigger = true;
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

    // Check daily quota limit
    const today = new Date().toISOString().split('T')[0];
    const lastExtractDate = syncStatus?.last_extract 
      ? new Date(syncStatus.last_extract).toISOString().split('T')[0] 
      : null;
      
    // Strict daily quota enforcement - only allow one extract per day
    if (lastExtractDate === today && !clearOldData) {
      const message = isScheduledJob 
        ? "Scheduled job: Already performed daily extract. Skipping to preserve quota."
        : isManualTrigger 
          ? "Manual trigger: Already performed daily extract today. Please wait until tomorrow."
          : "Already performed daily extract today.";
      
      console.log(message);
      
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "skipped",
          last_sync_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "linkmydeals");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message,
          skipped: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear old data if requested (this bypasses daily quota)
    if (clearOldData) {
      console.log("Clearing old data from Data table...");
      const { error: deleteError } = await supabase
        .from("Data")
        .delete()
        .neq("lmd_id", 0); // Delete all records (lmd_id is never 0)

      if (deleteError) {
        console.error("Error clearing old data:", deleteError);
        throw new Error(`Failed to clear old data: ${deleteError.message}`);
      }
      console.log("Old data cleared successfully");
    }
    
    // Build API URL - use full extract when clearing old data, incremental otherwise
    const apiUrl = clearOldData 
      ? `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json`
      : `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json&incremental=1`;

    console.log(`Fetching data from LinkMyDeals API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`LinkMyDeals API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.metadata?.totalOffersReturned || 0} offers from LinkMyDeals`);

    // Handle the case where no offers are returned
    if (!data.metadata || data.metadata.totalOffersReturned === 0) {
      const message = clearOldData 
        ? "Old data cleared, no new offers returned from LinkMyDeals" 
        : "No new offers returned from LinkMyDeals API";
        
      await supabase
        .from("api_sync_status")
        .update({
          last_extract: new Date().toISOString(),
          last_sync_status: "success",
          last_sync_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "linkmydeals");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process offers - map LinkMyDeals fields to Data table structure
    const offers = data.offers.map((offer: any) => ({
      lmd_id: parseInt(offer.lmd_id),
      title: offer.title,
      description: offer.description,
      offer: offer.offer,
      code: offer.code,
      terms_and_conditions: offer.terms,
      categories: offer.categories,
      featured: offer.featured,
      publisher_exclusive: offer.publisher_exclusive,
      url: offer.url,
      image_url: offer.image_url,
      type: offer.type,
      status: offer.status,
      offer_value: offer.offer_value,
      store: offer.store,
      long_offer: offer.long_offer,
      merchant_homepage: offer.merchant_homepage,
      smartlink: offer.aff_link,
      end_date: offer.end_date,
      start_date: offer.start_date
    }));

    console.log(`Processing ${offers.length} offers for database upsert...`);

    // Upsert offers into Data table (insert new, update existing based on lmd_id)
    const { error: upsertError } = await supabase.from("Data").upsert(offers, {
      onConflict: "lmd_id",
      ignoreDuplicates: false
    });

    if (upsertError) {
      console.error("Error upserting offers:", upsertError);
      throw new Error(`Failed to upsert offers: ${upsertError.message}`);
    }

    // Clean up expired offers to keep data fresh
    const today_date = new Date();
    const { error: deleteError } = await supabase
      .from("Data")
      .delete()
      .lt("end_date", today_date.toISOString().split('T')[0]);

    if (deleteError) {
      console.error("Error removing expired offers:", deleteError);
      // Don't throw here, just log the error
    } else {
      console.log("Expired offers cleaned up successfully");
    }

    // Update sync status with success
    const successMessage = clearOldData 
      ? `Successfully cleared old data and imported ${offers.length} fresh offers from LinkMyDeals`
      : `Successfully synchronized ${offers.length} offers from LinkMyDeals (incremental update)`;

    await supabase
      .from("api_sync_status")
      .update({
        last_extract: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_message: successMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "linkmydeals");

    console.log("LinkMyDeals sync completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: successMessage,
        offersProcessed: offers.length,
        syncType: clearOldData ? "full" : "incremental"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in LinkMyDeals sync:", error);
    
    // Update sync status with error for monitoring
    await supabase
      .from("api_sync_status")
      .update({
        last_sync_status: "error",
        last_sync_message: `Sync failed: ${error.message}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "linkmydeals");
      
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
