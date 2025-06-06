
import { supabase } from '@/integrations/supabase/client';

export interface DealReview {
  id?: string;
  user_id: string;
  offer_id: string;
  rating: number;
  review_text?: string;
  helpful_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const createReview = async (review: Omit<DealReview, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('deal_reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    
    // Track analytics
    await supabase.from('deal_analytics').insert({
      offer_id: review.offer_id,
      event_type: 'review',
      user_id: review.user_id
    });

    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getReviewsForOffer = async (offerId: string) => {
  try {
    const { data, error } = await supabase
      .from('deal_reviews')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const markReviewHelpful = async (reviewId: string, isHelpful: boolean) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('review_helpfulness')
      .upsert({
        user_id: session.session.user.id,
        review_id: reviewId,
        is_helpful: isHelpful
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
};
