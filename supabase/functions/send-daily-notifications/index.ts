
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
    console.log("Starting daily notifications job...");

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
      .limit(50);

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

    const today = new Date().toISOString().split('T')[0];
    let notificationsSent = 0;
    let emailsSent = 0;

    // Process each user
    for (const profile of profiles) {
      try {
        // Check if we already sent notification today
        const { data: existingNotification } = await supabase
          .from('daily_notifications')
          .select('*')
          .eq('user_id', profile.id)
          .eq('notification_date', today)
          .single();

        if (existingNotification?.notification_sent && existingNotification?.email_sent) {
          console.log(`Already sent notifications to user ${profile.id} today`);
          continue;
        }

        // Get a random offer for this user
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        const offerId = `offer-${randomOffer.lmd_id}`;

        // Create or update daily notification record
        const { error: upsertError } = await supabase
          .from('daily_notifications')
          .upsert({
            user_id: profile.id,
            notification_date: today,
            offer_id: offerId,
            notification_sent: false,
            email_sent: false
          }, {
            onConflict: 'user_id,notification_date'
          });

        if (upsertError) {
          console.error(`Error upserting notification record for user ${profile.id}:`, upsertError);
          continue;
        }

        // Send in-app notification if not already sent
        if (!existingNotification?.notification_sent) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: profile.id,
              title: `Daily Deal from ${randomOffer.store}`,
              message: `Don't miss out: ${randomOffer.title || 'Amazing offer just for you!'}`,
              type: 'offer',
              offer_id: offerId
            });

          if (notificationError) {
            console.error(`Error creating notification for user ${profile.id}:`, notificationError);
          } else {
            console.log(`Notification sent to user ${profile.id}`);
            notificationsSent++;

            // Update notification record
            await supabase
              .from('daily_notifications')
              .update({ notification_sent: true })
              .eq('user_id', profile.id)
              .eq('notification_date', today);
          }
        }

        // Send email if Resend is configured and not already sent
        if (resend && profile.email && !existingNotification?.email_sent) {
          try {
            const savings = randomOffer.offer_value ? 
              (randomOffer.offer_value.includes('%') ? randomOffer.offer_value : `₹${randomOffer.offer_value}`) 
              : 'Great savings';

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🐵 OffersMonkey</h1>
                  <p style="color: #ecfdf5; margin: 10px 0 0 0; font-size: 16px;">Your Daily Deal is Here!</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
                  <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${profile.name || 'there'}! 👋</h2>
                  <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">We've found an amazing deal just for you:</p>
                  
                  <div style="border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0; background: #f0fdf4;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                      <div style="background: #10b981; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                        ${randomOffer.store}
                      </div>
                      <div style="background: #fbbf24; color: #92400e; padding: 6px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-left: 10px;">
                        Save ${savings}
                      </div>
                    </div>
                    <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${randomOffer.title || 'Amazing Deal'}</h3>
                    <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">${randomOffer.description || 'Don\'t miss out on this incredible offer!'}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/home" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                      View This Deal 🎁
                    </a>
                  </div>
                </div>
                
                <div style="text-align: center; color: #9ca3af; font-size: 14px;">
                  <p>Happy saving! 🎉<br>The OffersMonkey Team</p>
                  <p style="margin-top: 20px; font-size: 12px;">
                    You're receiving this because you're subscribed to daily offers from OffersMonkey.<br>
                    <a href="#" style="color: #10b981;">Unsubscribe</a> | <a href="#" style="color: #10b981;">Manage Preferences</a>
                  </p>
                </div>
              </div>
            `;

            const { error: emailError } = await resend.emails.send({
              from: 'OffersMonkey <offers@offersmonkey.com>',
              to: [profile.email],
              subject: `🐵 Your Daily Deal: ${savings} off at ${randomOffer.store}!`,
              html: emailHtml,
            });

            if (emailError) {
              console.error(`Error sending email to ${profile.email}:`, emailError);
            } else {
              console.log(`Email sent to ${profile.email}`);
              emailsSent++;

              // Update email sent status
              await supabase
                .from('daily_notifications')
                .update({ email_sent: true })
                .eq('user_id', profile.id)
                .eq('notification_date', today);
            }
          } catch (emailError) {
            console.error(`Failed to send email to ${profile.email}:`, emailError);
          }
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    const result = {
      success: true,
      message: `Daily notifications job completed`,
      stats: {
        totalUsers: profiles.length,
        notificationsSent,
        emailsSent,
        date: today
      }
    };

    console.log('Job completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in daily notifications job:', error);
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
