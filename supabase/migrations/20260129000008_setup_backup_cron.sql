-- Enable the pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily backup at 2:00 AM UTC
-- This calls the perform_backup() function directly
SELECT cron.schedule(
    'daily-backup',           -- job name
    '0 2 * * *',              -- cron expression: daily at 2:00 AM UTC
    $$SELECT perform_backup()$$
);

-- Schedule cleanup of old backups weekly on Sunday at 3:00 AM UTC
SELECT cron.schedule(
    'weekly-cleanup',         -- job name
    '0 3 * * 0',              -- cron expression: Sunday at 3:00 AM UTC
    $$SELECT cleanup_old_backups(30)$$  -- keep last 30 days
);
