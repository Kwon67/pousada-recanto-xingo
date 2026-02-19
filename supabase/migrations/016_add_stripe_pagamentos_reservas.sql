ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT NOT NULL DEFAULT 'nao_iniciado',
  ADD COLUMN IF NOT EXISTS stripe_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_approved_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reservas_stripe_payment_status_check'
  ) THEN
    ALTER TABLE reservas
      ADD CONSTRAINT reservas_stripe_payment_status_check
      CHECK (
        stripe_payment_status IN (
          'nao_iniciado',
          'pendente',
          'pago',
          'falhou',
          'cancelado',
          'expirado'
        )
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_stripe_checkout_session_id
  ON reservas (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_stripe_payment_intent_id
  ON reservas (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_stripe_payment_status
  ON reservas (stripe_payment_status);
