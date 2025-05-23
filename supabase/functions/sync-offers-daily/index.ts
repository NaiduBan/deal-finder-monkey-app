
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = "https://mmqkvjxsxufozfgqjoxz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINKMYDEALS_API_KEY = "c291177d82720f6ba86a97869a17c310";

// Initialize the Supabase client with the service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-my-custom-header",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily OffersData sync job...");
    
    // Get the current sync status for OffersData
    let { data: syncStatus, error: getError } = await supabase
      .from("api_sync_status")
      .select("*")
      .eq("id", "offersdata")
      .single();

    if (getError) {
      console.error("Error fetching sync status:", getError);
      throw new Error(`Failed to get sync status: ${getError.message}`);
    }

    // Check daily quota limit - only allow one extract per day
    const today = new Date().toISOString().split('T')[0];
    const lastExtractDate = syncStatus?.last_extract 
      ? new Date(syncStatus.last_extract).toISOString().split('T')[0] 
      : null;
      
    if (lastExtractDate === today) {
      const message = "Already performed daily extract today. Skipping to preserve quota.";
      console.log(message);
      
      await supabase
        .from("api_sync_status")
        .update({
          last_sync_status: "skipped",
          last_sync_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "offersdata");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message,
          skipped: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build API URL for incremental update
    const apiUrl = `https://feed.linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json&incremental=1`;

    console.log(`Fetching data from LinkMyDeals API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`LinkMyDeals API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.metadata?.totalOffersReturned || 0} offers from LinkMyDeals`);

    // Handle the case where no offers are returned
    if (!data.metadata || data.metadata.totalOffersReturned === 0) {
      const message = "No new offers returned from LinkMyDeals API";
        
      await supabase
        .from("api_sync_status")
        .update({
          last_extract: new Date().toISOString(),
          last_sync_status: "success",
          last_sync_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "offersdata");
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process offers - map LinkMyDeals fields to OffersData table structure
    const offers = data.offers.map((offer: any) => ({
      lmd_id: offer.lmd_id.toString(),
      store: offer.store,
      merchant_homepage: offer.merchant_homepage,
      offer_text: offer.offer,
      offer_value: offer.offer_value,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      terms_and_conditions: offer.terms,
      categories: offer.categories,
      category_array: offer.categories ? offer.categories.split(',').map((c: string) => c.trim()) : null,
      featured: offer.featured,
      publisher_exclusive: offer.publisher_exclusive,
      url: offer.url,
      smartlink: offer.aff_link,
      image_url: offer.image_url,
      type: offer.type,
      offer: offer.offer,
      status: offer.status,
      start_date: offer.start_date || null,
      end_date: offer.end_date || null,
      updated_at: new Date().toISOString()
    }));

    console.log(`Processing ${offers.length} offers for database upsert...`);

    // Upsert offers into OffersData table (insert new, update existing based on lmd_id)
    const { error: upsertError } = await supabase.from("offersdata").upsert(offers, {
      onConflict: "lmd_id",
      ignoreDuplicates: false
    });

    if (upsertError) {
      console.error("Error upserting offers:", upsertError);
      throw new Error(`Failed to upsert offers: ${upsertError.message}`);
    }

    // Clean up expired offers using the current date
    const currentDate = new Date().toISOString().split('T')[0];
    console.log(`Removing expired offers (current date: ${currentDate})...`);
    
    const { error: deleteError } = await supabase
      .from("offersdata")
      .delete()
      .lt("end_date", currentDate);

    if (deleteError) {
      console.error("Error removing expired offers:", deleteError);
      // Don't throw here, just log the error
    } else {
      console.log("Expired offers cleaned up successfully");
    }

    // Update sync status with success
    const successMessage = `Successfully synchronized ${offers.length} offers to OffersData table`;

    await supabase
      .from("api_sync_status")
      .update({
        last_extract: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_message: successMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "offersdata");

    console.log("Daily OffersData sync completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: successMessage,
        offersProcessed: offers.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily OffersData sync:", error);
    
    // Update sync status with error for monitoring
    await supabase
      .from("api_sync_status")
      .update({
        last_sync_status: "error",
        last_sync_message: `Sync failed: ${error.message}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "offersdata");
      
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
