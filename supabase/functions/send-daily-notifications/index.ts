
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  store: string;
  savings: string;
  imageUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting notifications job...");
    
    const requestBody = await req.json().catch(() => ({}));
    const triggerType = requestBody.trigger || 'hourly';
    
    console.log(`Trigger type: ${triggerType}`);

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .not('email', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users found with email addresses');
      return new Response(JSON.stringify({ message: "No users found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${profiles.length} users to notify`);

    // Get random offers
    const { data: offers, error: offersError } = await supabase
      .from('Offers_data')
      .select('lmd_id, title, description, store, offer_value, image_url')
      .not('title', 'is', null)
      .limit(100);

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

    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    let notificationsSent = 0;
    let emailsSent = 0;

    // Different notification types based on trigger
    const getNotificationContent = (triggerType: string, offer: any) => {
      const savings = offer.offer_value ? 
        (offer.offer_value.includes('%') ? offer.offer_value : `₹${offer.offer_value}`) 
        : 'Great savings';

      switch (triggerType) {
        case 'hourly':
          return {
            title: `🔥 Hot Deal Alert from ${offer.store}`,
            message: `${offer.title} - Save ${savings}! Limited time offer.`,
            type: 'offer'
          };
        case 'daily':
          return {
            title: `Daily Deal from ${offer.store}`,
            message: `${offer.title} - Save ${savings}!`,
            type: 'offer'
          };
        case 'expiry_check':
          return {
            title: 'Offers expiring soon!',
            message: `Don't miss out on ${offer.title} from ${offer.store}`,
            type: 'expiry'
          };
        default:
          return {
            title: `New offer from ${offer.store}`,
            message: `${offer.title} - Save ${savings}!`,
            type: 'offer'
          };
      }
    };

    // Process each user
    for (const profile of profiles) {
      try {
        // For hourly notifications, check if we already sent one in this hour
        if (triggerType === 'hourly') {
          const hourStart = new Date(now);
          hourStart.setMinutes(0, 0, 0);
          
          const { data: recentNotification } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', profile.id)
            .gte('created_at', hourStart.toISOString())
            .limit(1)
            .single();

          if (recentNotification) {
            console.log(`Already sent notification to user ${profile.id} this hour`);
            continue;
          }
        }

        // For daily notifications, check if we already sent one today
        if (triggerType === 'daily') {
          const { data: existingNotification } = await supabase
            .from('daily_notifications')
            .select('*')
            .eq('user_id', profile.id)
            .eq('notification_date', today)
            .single();

          if (existingNotification?.notification_sent) {
            console.log(`Already sent daily notification to user ${profile.id} today`);
            continue;
          }
        }

        // Get a random offer for this user
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        const offerId = `offer-${randomOffer.lmd_id}`;
        const notificationContent = getNotificationContent(triggerType, randomOffer);

        // Send in-app notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            title: notificationContent.title,
            message: notificationContent.message,
            type: notificationContent.type,
            offer_id: offerId
          });

        if (notificationError) {
          console.error(`Error creating notification for user ${profile.id}:`, notificationError);
        } else {
          console.log(`Notification sent to user ${profile.id}`);
          notificationsSent++;

          // Update daily notification record for daily triggers
          if (triggerType === 'daily') {
            await supabase
              .from('daily_notifications')
              .upsert({
                user_id: profile.id,
                notification_date: today,
                offer_id: offerId,
                notification_sent: true,
                email_sent: false
              }, {
                onConflict: 'user_id,notification_date'
              });
          }
        }

        // Send web push notification using the Web Push API
        // This would require the user to grant permission and register a service worker
        // For now, we'll just log that we would send a push notification
        console.log(`Would send push notification to user ${profile.id}: ${notificationContent.title}`);

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    const result = {
      success: true,
      message: `${triggerType} notifications job completed`,
      stats: {
        totalUsers: profiles.length,
        notificationsSent,
        emailsSent,
        triggerType,
        currentHour,
        date: today
      }
    };

    console.log('Job completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in notifications job:', error);
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
