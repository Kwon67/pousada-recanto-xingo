-- Extend admin audit events for login protection and session lifecycle tracking
ALTER TABLE admin_access_logs
  DROP CONSTRAINT IF EXISTS admin_access_logs_event_type_check;

ALTER TABLE admin_access_logs
  ADD CONSTRAINT admin_access_logs_event_type_check
  CHECK (event_type IN ('login', 'access', 'login_failed', 'logout'));

CREATE INDEX IF NOT EXISTS admin_access_logs_event_type_created_at_idx
  ON admin_access_logs (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_access_logs_ip_created_at_idx
  ON admin_access_logs (ip, created_at DESC)
  WHERE ip IS NOT NULL;
