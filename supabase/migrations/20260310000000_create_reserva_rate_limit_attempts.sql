-- Rate limit attempts table for reservation creation
-- Persists cross-instance in serverless environments

CREATE TABLE IF NOT EXISTS reserva_rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_type TEXT NOT NULL CHECK (key_type IN ('ip', 'email')),
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reserva_rate_limit_attempts_key_idx
  ON reserva_rate_limit_attempts (key_type, key_value, created_at DESC);

CREATE INDEX IF NOT EXISTS reserva_rate_limit_attempts_created_at_idx
  ON reserva_rate_limit_attempts (created_at DESC);

ALTER TABLE reserva_rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (used server-side only)
DROP POLICY IF EXISTS "No public access" ON reserva_rate_limit_attempts;
CREATE POLICY "No public access" ON reserva_rate_limit_attempts
  FOR ALL USING (false);
