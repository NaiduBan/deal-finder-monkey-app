
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  offer_id: string;
  event_type: 'view' | 'click' | 'save' | 'share' | 'use';
  user_id?: string;
  metadata?: Record<string, any>;
}

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('deal_analytics')
      .insert({
        offer_id: event.offer_id,
        event_type: event.event_type,
        user_id: session?.session?.user?.id || null,
        metadata: event.metadata || {}
      });

    if (error) {
      console.error('Error tracking event:', error);
    }
  } catch (error) {
    console.error('Error in trackEvent:', error);
  }
};

export const getTrendingDeals = async () => {
  try {
    const { data, error } = await supabase
      .from('deal_popularity')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trending deals:', error);
    return [];
  }
};

export const getOfferAnalytics = async (offerId: string) => {
  try {
    const { data, error } = await supabase
      .from('deal_popularity')
      .select('*')
      .eq('offer_id', offerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching offer analytics:', error);
    return null;
  }
};
