-- Example: enable the "pg_cron" extension
create extension pg_cron with schema extensions;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Example: enable the "pg_net" extension.
create extension pg_net;
-- Note: The extension creates its own schema/namespace named "net" to avoid naming conflicts.

-- Create job to seed members
-- UNCOMMENT AND ADD YOUR CREDENTIALS below. DO NOT EXPOSE ANY SECRET KEYS HERE!

-- select
--   cron.schedule(
--     'seed-members',
--     '0 6 1 * *', -- “At 06:00 on day-of-month 1.”
--     $$
--     select
--       net.http_post(
--           url:='https://project-ref.supabase.co/functions/v1/seed-members',
--           headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--           body:=concat('{"time": "', now(), '"}')::jsonb
--       ) as request_id;
--     $$
--   );

-- Create cron to match folks
-- UNCOMMENT AND ADD YOUR CREDENTIALS below. DO NOT EXPOSE ANY SECRET KEYS HERE!

-- select
--   cron.schedule(
--     'seed-members',
--     '0 7 1 * *', -- “At 07:00 on day-of-month 1.”
--     $$
--     select
--       net.http_post(
--           url:='https://project-ref.supabase.co/functions/v1/match',
--           headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--           body:=concat('{"time": "', now(), '"}')::jsonb
--       ) as request_id;
--     $$
--   );