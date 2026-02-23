-- Reconcile configuracoes fields expected by the app with the current remote schema.
-- Safe to run multiple times.
ALTER TABLE configuracoes
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS google_analytics TEXT,
  ADD COLUMN IF NOT EXISTS meta_pixel TEXT,
  ADD COLUMN IF NOT EXISTS email_conta TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_notificacoes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notificacoes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS nova_reserva_push BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cta_preco_noite TEXT;

ALTER TABLE configuracoes
  ALTER COLUMN cta_preco_noite SET DEFAULT 'R$ 380';

UPDATE configuracoes
SET
  cta_preco_noite = COALESCE(NULLIF(TRIM(cta_preco_noite), ''), 'R$ 380'),
  whatsapp_notificacoes = COALESCE(whatsapp_notificacoes, true),
  email_notificacoes = COALESCE(email_notificacoes, true),
  nova_reserva_push = COALESCE(nova_reserva_push, true)
WHERE
  cta_preco_noite IS NULL
  OR TRIM(cta_preco_noite) = ''
  OR whatsapp_notificacoes IS NULL
  OR email_notificacoes IS NULL
  OR nova_reserva_push IS NULL;
