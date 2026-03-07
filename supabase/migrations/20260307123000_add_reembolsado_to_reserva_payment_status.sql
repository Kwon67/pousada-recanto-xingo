ALTER TABLE reservas
  DROP CONSTRAINT IF EXISTS reservas_stripe_payment_status_check;

ALTER TABLE reservas
  ADD CONSTRAINT reservas_stripe_payment_status_check
  CHECK (
    stripe_payment_status IN (
      'nao_iniciado',
      'pendente',
      'pago',
      'falhou',
      'cancelado',
      'expirado',
      'reembolsado'
    )
  );
