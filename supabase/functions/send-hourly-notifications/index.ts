
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting hourly notifications job...");

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .not('id', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users found');
      return new Response(JSON.stringify({ message: "No users found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${profiles.length} users to notify`);

    // Get random offers
    const { data: offers, error: offersError } = await supabase
      .from('Offers_data')
      .select('lmd_id, title, description, store, offer_value')
      .not('title', 'is', null)
      .limit(20);

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      throw offersError;
    }

    if (!offers || offers.length === 0) {
      console.log('No offers found');
      return new Response(JSON.stringify({ message: "No offers found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${offers.length} offers`);

    let notificationsSent = 0;

    // Process each user
    for (const profile of profiles) {
      try {
        // Get a random offer for this user
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        const offerId = `offer-${randomOffer.lmd_id}`;

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            title: `🎯 Hourly Deal Alert!`,
            message: `${randomOffer.title} from ${randomOffer.store} - Don't miss out!`,
            type: 'offer',
            offer_id: offerId
          });

        if (notificationError) {
          console.error(`Error creating notification for user ${profile.id}:`, notificationError);
        } else {
          console.log(`Hourly notification sent to user ${profile.id}`);
          notificationsSent++;
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    const result = {
      success: true,
      message: `Hourly notifications job completed`,
      stats: {
        totalUsers: profiles.length,
        notificationsSent,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Hourly job completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in hourly notifications job:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
