
import { supabase } from '@/integrations/supabase/client';

export interface DealComment {
  id?: string;
  user_id: string;
  offer_id: string;
  comment_text: string;
  parent_comment_id?: string;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const createComment = async (comment: Omit<DealComment, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('deal_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getCommentsForOffer = async (offerId: string) => {
  try {
    const { data, error } = await supabase
      .from('deal_comments')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('offer_id', offerId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const getRepliesForComment = async (commentId: string) => {
  try {
    const { data, error } = await supabase
      .from('deal_comments')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
};

export const likeComment = async (commentId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comment_likes')
      .insert({
        user_id: session.session.user.id,
        comment_id: commentId
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
};

export const unlikeComment = async (commentId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', session.session.user.id)
      .eq('comment_id', commentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unliking comment:', error);
    throw error;
  }
};
