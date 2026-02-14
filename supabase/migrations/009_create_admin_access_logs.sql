-- Audit table for admin panel access (login and authenticated usage)
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'access')),
  ip TEXT,
  user_agent TEXT,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_access_logs_created_at_idx
  ON admin_access_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS admin_access_logs_username_idx
  ON admin_access_logs (username);

ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read admin access logs" ON admin_access_logs;
CREATE POLICY "Allow authenticated read admin access logs" ON admin_access_logs
  FOR SELECT USING (auth.role() = 'authenticated');
