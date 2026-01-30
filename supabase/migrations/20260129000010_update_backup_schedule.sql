-- Update backup schedule to run every 6 hours

-- Remove the old daily schedule
SELECT cron.unschedule('daily-backup');

-- Schedule backup every 6 hours (at 0:00, 6:00, 12:00, 18:00 UTC)
SELECT cron.schedule(
    'backup-every-6-hours',   -- job name
    '0 */6 * * *',            -- cron expression: every 6 hours
    $$SELECT perform_backup()$$
);
