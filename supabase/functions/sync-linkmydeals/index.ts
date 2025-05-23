
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = "https://mmqkvjxsxufozfgqjoxz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINKMYDEALS_API_KEY = "s291177d82720f6ba86a97869a17c310";

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

    // Check daily quota limit
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    // Extract the date part of the last extract
    const lastExtractDate = syncStatus?.last_extract 
      ? new Date(syncStatus.last_extract).toISOString().split('T')[0] 
      : null;
      
    // If this is a manual trigger and we already had an extract today, check if we want to proceed
    if (isManualTrigger && lastExtractDate === today) {
      console.log("Warning: Already performed an extract today. Using one of the 24 daily quota.");
      
      // For manual triggers, we'll proceed but with a warning
      // For automated/scheduled jobs, we'd skip if already run today
    } else if (!isManualTrigger && lastExtractDate === today) {
      // If this is a scheduled job and we already extracted today, skip
      console.log("Scheduled job: Already performed an extract today. Skipping to preserve quota.");
      
      // Update sync status with skipped message
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "skipped",
          last_sync_message: "Skipped additional extract to preserve daily quota",
          updated_at: new Date().toISOString(),
        })
        .eq("id", "linkmydeals");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Skipped extract to preserve daily quota" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lastExtract = syncStatus?.last_extract;
    console.log(`Last extract timestamp: ${lastExtract}`);
    
    // Build API URL with incremental=1 to only get new/updated offers
    const apiUrl = `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json&incremental=1`;

    console.log(`Fetching data from API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.metadata?.totalOffersReturned || 0} offers`);

    // Handle the case where no offers are returned
    if (!data.metadata || data.metadata.totalOffersReturned === 0) {
      // Update sync status with success but no data
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "success",
          last_sync_message: "No new offers to sync",
          updated_at: new Date().toISOString(),
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

    // Optional: Remove expired offers 
    const today_date = new Date();
    const { error: deleteError } = await supabase
      .from("Data")
      .delete()
      .lt("end_date", today_date.toISOString().split('T')[0]);

    if (deleteError) {
      console.error("Error removing expired offers:", deleteError);
      // Don't throw here, just log the error
    }

    // Update sync status with success
    await supabase
      .from("api_sync_status")
      .update({
        last_extract: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_message: `Successfully synced ${offers.length} offers`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "linkmydeals");

    console.log("LinkMyDeals sync completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${offers.length} offers` 
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
