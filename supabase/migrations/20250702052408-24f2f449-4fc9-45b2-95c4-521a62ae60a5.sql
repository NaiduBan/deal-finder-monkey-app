-- Remove unused tables from the database

-- Tables that are completely unused
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.daily_checkins CASCADE;
DROP TABLE IF EXISTS public.deal_alerts CASCADE;
DROP TABLE IF EXISTS public.deal_analytics CASCADE;
DROP TABLE IF EXISTS public.deal_challenges CASCADE;
DROP TABLE IF EXISTS public.user_challenge_progress CASCADE;
DROP TABLE IF EXISTS public.deal_comments CASCADE;
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.deal_popularity CASCADE;
DROP TABLE IF EXISTS public.deal_reviews CASCADE;
DROP TABLE IF EXISTS public.review_helpfulness CASCADE;
DROP TABLE IF EXISTS public.deal_shares CASCADE;
DROP TABLE IF EXISTS public.preference_notification_log CASCADE;
DROP TABLE IF EXISTS public.user_friends CASCADE;
DROP TABLE IF EXISTS public.user_points CASCADE;
DROP TABLE IF EXISTS public.wishlist_categories CASCADE;

-- Note: Keeping these tables as they are used:
-- - admin_sessions, admin_users (admin authentication)
-- - banners (banner management)
-- - daily_notifications (notification service)
-- - linkmydeals_offers (referenced in SearchPreferencesScreen)