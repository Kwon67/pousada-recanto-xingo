
-- 1. Add 'aguardando_pagamento' to status_reserva enum
ALTER TYPE status_reserva ADD VALUE IF NOT EXISTS 'aguardando_pagamento';

-- 2. Add Stripe columns to reservas table
ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) DEFAULT 0.00;

-- 3. Create index on stripe_session_id for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_reservas_stripe_session ON reservas(stripe_session_id);
;
