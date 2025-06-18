
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { message, context } = await req.json();

    // Search for relevant offers based on the user's message
    const offerData = await searchRelevantOffers(supabaseClient, message);

    // Enhanced system prompt that can handle any type of question
    const systemPrompt = `You are OffersMonkey Assistant, a versatile AI assistant that can help with any questions while specializing in deals and offers. You have access to real-time offer data and can provide comprehensive assistance.

Context about the user:
${context ? JSON.stringify(context, null, 2) : 'No additional context available'}

Available Offers Data:
${offerData.length > 0 ? JSON.stringify(offerData, null, 2) : 'No relevant offers found for this query'}

Guidelines:
- You can answer ANY type of question - from general knowledge to specific topics
- When users ask about offers, deals, coupons, or shopping, prioritize the available offers data
- For non-offer related questions, provide helpful and accurate information
- Be friendly, enthusiastic, and use emojis appropriately 🐒
- Keep responses informative but concise
- If you don't have specific offer data for a query, you can suggest general shopping advice
- Always be helpful whether the question is about deals or any other topic

For Offer-Related Responses:
When you have relevant offers to show, format your response as:
[OFFERS_DATA_START]
${JSON.stringify(offerData)}
[OFFERS_DATA_END]

Then provide a helpful text response about the offers found.

For General Questions:
- Provide accurate, helpful information
- Use clear formatting and structure
- Include relevant examples when helpful
- Be conversational and engaging

Remember: You're an AI assistant that happens to specialize in deals, but you can help with anything!`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser message: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      }),
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Save the conversation to database
    await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: message,
        response: aiResponse
      });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      offers: offerData.length > 0 ? offerData : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to search for relevant offers based on user query
async function searchRelevantOffers(supabaseClient: any, userMessage: string): Promise<any[]> {
  try {
    const searchTerms = extractSearchTerms(userMessage.toLowerCase());
    
    // Check if the message is offer-related
    const offerKeywords = ['deal', 'offer', 'discount', 'coupon', 'sale', 'promo', 'store', 'shop', 'buy', 'price', 'cheap'];
    const isOfferRelated = offerKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    if (!isOfferRelated && searchTerms.length === 0) {
      // For non-offer questions, return empty array
      return [];
    }
    
    if (searchTerms.length === 0) {
      // If no specific search terms but offer-related, return featured offers
      const { data, error } = await supabaseClient
        .from('Offers_data')
        .select('*')
        .or('featured.eq.true,featured.eq.1')
        .limit(6); // Limit to 6 cards for better display
      
      return error ? [] : (data || []);
    }

    let query = supabaseClient.from('Offers_data').select('*');
    
    // Build search query for multiple terms
    const searchConditions = searchTerms.map(term => 
      `title.ilike.%${term}%,description.ilike.%${term}%,store.ilike.%${term}%,categories.ilike.%${term}%,long_offer.ilike.%${term}%`
    ).join(',');
    
    query = query.or(searchConditions).limit(6); // Limit to 6 cards for better display
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching offers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchRelevantOffers:', error);
    return [];
  }
}

// Function to extract search terms from user message
function extractSearchTerms(message: string): string[] {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'show', 'find', 'get', 'give', 'tell', 'me', 'i', 'you', 'we', 'they', 'it', 'this', 'that', 'these', 'those', 'a', 'an', 'some', 'any', 'all', 'best', 'good', 'great', 'what', 'how', 'when', 'where', 'why', 'who'];
  
  // Extract meaningful words (longer than 2 characters and not common words)
  const words = message
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word.toLowerCase()))
    .slice(0, 5); // Limit to 5 search terms
  
  return words;
}
