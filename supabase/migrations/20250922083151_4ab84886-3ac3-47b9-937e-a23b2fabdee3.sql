-- Fix remaining critical RLS security issues

-- Enable RLS on the remaining public tables that were missing it
ALTER TABLE public.linkmydeals_offers ENABLE ROW LEVEL SECURITY;

-- Fix function search path issues for security
CREATE OR REPLACE FUNCTION public.update_deal_popularity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO deal_popularity (offer_id, view_count, save_count, share_count, click_count)
  VALUES (
    CASE 
      WHEN NEW.event_type = 'view' THEN NEW.offer_id
      WHEN NEW.event_type = 'save' THEN NEW.offer_id
      WHEN NEW.event_type = 'share' THEN NEW.offer_id
      WHEN NEW.event_type = 'click' THEN NEW.offer_id
      ELSE NEW.offer_id
    END,
    CASE WHEN NEW.event_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'save' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END
  )
  ON CONFLICT (offer_id) DO UPDATE SET
    view_count = deal_popularity.view_count + CASE WHEN NEW.event_type = 'view' THEN 1 ELSE 0 END,
    save_count = deal_popularity.save_count + CASE WHEN NEW.event_type = 'save' THEN 1 ELSE 0 END,
    share_count = deal_popularity.share_count + CASE WHEN NEW.event_type = 'share' THEN 1 ELSE 0 END,
    click_count = deal_popularity.click_count + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    popularity_score = (
      (deal_popularity.view_count + CASE WHEN NEW.event_type = 'view' THEN 1 ELSE 0 END) * 1 +
      (deal_popularity.save_count + CASE WHEN NEW.event_type = 'save' THEN 1 ELSE 0 END) * 3 +
      (deal_popularity.share_count + CASE WHEN NEW.event_type = 'share' THEN 1 ELSE 0 END) * 2 +
      (deal_popularity.click_count + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END) * 2
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE deal_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE deal_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_review_helpfulness_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE deal_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful AND NOT NEW.is_helpful THEN
      UPDATE deal_reviews SET helpful_count = helpful_count - 1 WHERE id = NEW.review_id;
    ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
      UPDATE deal_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE deal_reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_offers', (SELECT COUNT(*) FROM "Offers_data"),
    'total_cuelink_offers', (SELECT COUNT(*) FROM "Cuelink_data"),
    'total_categories', (SELECT COUNT(*) FROM categories),
    'total_saved_offers', (SELECT COUNT(*) FROM saved_offers),
    'active_users_today', (SELECT COUNT(DISTINCT user_id) FROM saved_offers WHERE created_at::date = CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_admin_users()
RETURNS TABLE(admin_id uuid, admin_name text, admin_email text, admin_role text, is_active boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.name, au.email, au.role, au.is_active, au.created_at
  FROM public.admin_users au
  ORDER BY au.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    first_name,
    last_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;