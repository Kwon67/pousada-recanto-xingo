-- Migration: Add Stripe support to reservas
-- Description: Adds 'aguardando_pagamento' status, stripe_session_id, and valor_pago columns

-- 1. Add 'aguardando_pagamento' to status_reserva enum
-- Note: ALTER TYPE ADD VALUE cannot be executed inside a transaction block in older Postgres, 
-- but Supabase migrations handle this if executed directly.
ALTER TYPE status_reserva ADD VALUE IF NOT EXISTS 'aguardando_pagamento';

-- 2. Add columns to reservas table
ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) DEFAULT 0.00;

-- 3. Create index on stripe_session_id for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_reservas_stripe_session ON reservas(stripe_session_id);
