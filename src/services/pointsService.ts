
import { supabase } from '@/integrations/supabase/client';

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  offer_id?: string;
  description?: string;
  created_at: string;
}

export const awardPoints = async (userId: string, points: number, actionType: string, description?: string, offerId?: string) => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .insert({
        user_id: userId,
        points,
        action_type: actionType,
        description,
        offer_id: offerId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Check for achievements
    await checkAchievements(userId);
    
    return data;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
};

export const getUserTotalPoints = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId);

    if (error) throw error;
    
    const totalPoints = data?.reduce((sum, record) => sum + record.points, 0) || 0;
    return totalPoints;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return 0;
  }
};

export const getUserPointsHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
};

export const checkAchievements = async (userId: string) => {
  try {
    // Get user's current stats
    const [totalPoints, savedOffers, reviews, shares] = await Promise.all([
      getUserTotalPoints(userId),
      getUserSavedOffersCount(userId),
      getUserReviewsCount(userId),
      getUserSharesCount(userId)
    ]);

    // Check achievements
    const achievements = await supabase
      .from('achievements')
      .select('*');

    if (achievements.error) throw achievements.error;

    for (const achievement of achievements.data || []) {
      // Check if user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (existingAchievement) continue;

      // Check achievement criteria
      let earned = false;
      
      switch (achievement.name) {
        case 'Deal Hunter':
          earned = savedOffers >= 10;
          break;
        case 'Review Master':
          earned = reviews >= 5;
          break;
        case 'Social Butterfly':
          earned = shares >= 5;
          break;
        case 'Point Collector':
          earned = totalPoints >= 500;
          break;
        case 'Deal Expert':
          earned = savedOffers >= 50;
          break;
        case 'Community Helper':
          earned = await getUserHelpfulVotesCount(userId) >= 20;
          break;
      }

      if (earned) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

const getUserSavedOffersCount = async (userId: string) => {
  const { count } = await supabase
    .from('saved_offers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count || 0;
};

const getUserReviewsCount = async (userId: string) => {
  const { count } = await supabase
    .from('deal_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count || 0;
};

const getUserSharesCount = async (userId: string) => {
  const { count } = await supabase
    .from('deal_shares')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count || 0;
};

const getUserHelpfulVotesCount = async (userId: string) => {
  const { data } = await supabase
    .from('review_helpfulness')
    .select('review_id')
    .eq('is_helpful', true);
  
  if (!data) return 0;
  
  const reviewIds = data.map(item => item.review_id);
  
  const { count } = await supabase
    .from('deal_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('id', reviewIds);
    
  return count || 0;
};
