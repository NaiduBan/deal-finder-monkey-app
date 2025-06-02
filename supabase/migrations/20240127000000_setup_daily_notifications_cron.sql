
-- Schedule the daily notifications function to run every day at 9 AM UTC
SELECT cron.schedule(
  'daily-offers-notifications',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vtxtnyivbmvcmxuuqknn.supabase.co/functions/v1/send-daily-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHRueWl2Ym12Y214dXVxa25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTczMDcsImV4cCI6MjA2MzY3MzMwN30.MDY79onfEFsVP5hczJSQJspEZg4ie3HeJ9utbTsVWHA"}'::jsonb,
        body:=concat('{"time": "', now(), '", "trigger": "cron"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule expiry notifications to run every day at 6 PM UTC
SELECT cron.schedule(
  'daily-expiry-notifications',
  '0 18 * * *', -- Every day at 6 PM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vtxtnyivbmvcmxuuqknn.supabase.co/functions/v1/send-daily-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHRueWl2Ym12Y214dXVxa25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTczMDcsImV4cCI6MjA2MzY3MzMwN30.MDY79onfEFsVP5hczJSQJspEZg4ie3HeJ9utbTsVWHA"}'::jsonb,
        body:=concat('{"time": "', now(), '", "trigger": "expiry_check"}')::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs (for reference)
-- SELECT * FROM cron.job;

-- To unschedule jobs if needed (for reference):
-- SELECT cron.unschedule('daily-offers-notifications');
-- SELECT cron.unschedule('daily-expiry-notifications');
