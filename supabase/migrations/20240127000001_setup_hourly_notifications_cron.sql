
-- Schedule the hourly notifications function to run every hour
SELECT cron.schedule(
  'hourly-offers-notifications',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://vtxtnyivbmvcmxuuqknn.supabase.co/functions/v1/send-hourly-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHRueWl2Ym12Y214dXVxa25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTczMDcsImV4cCI6MjA2MzY3MzMwN30.MDY79onfEFsVP5hczJSQJspEZg4ie3HeJ9utbTsVWHA"}'::jsonb,
        body:=concat('{"time": "', now(), '", "trigger": "hourly_cron"}')::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs (for reference)
-- SELECT * FROM cron.job;

-- To unschedule job if needed (for reference):
-- SELECT cron.unschedule('hourly-offers-notifications');
