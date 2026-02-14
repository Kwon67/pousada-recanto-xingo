-- Extend configuracoes with admin panel fields
ALTER TABLE configuracoes
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS google_analytics TEXT,
  ADD COLUMN IF NOT EXISTS meta_pixel TEXT,
  ADD COLUMN IF NOT EXISTS email_conta TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_notificacoes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notificacoes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS nova_reserva_push BOOLEAN DEFAULT true;

-- Backfill booleans for older rows
UPDATE configuracoes
SET
  whatsapp_notificacoes = COALESCE(whatsapp_notificacoes, true),
  email_notificacoes = COALESCE(email_notificacoes, true),
  nova_reserva_push = COALESCE(nova_reserva_push, true);

-- Extend galeria to support highlights
ALTER TABLE galeria
  ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;

UPDATE galeria
SET destaque = COALESCE(destaque, false);

