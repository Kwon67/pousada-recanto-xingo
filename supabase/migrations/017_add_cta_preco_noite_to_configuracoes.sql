ALTER TABLE configuracoes
  ADD COLUMN IF NOT EXISTS cta_preco_noite TEXT;

ALTER TABLE configuracoes
  ALTER COLUMN cta_preco_noite SET DEFAULT 'R$ 380';

UPDATE configuracoes
SET cta_preco_noite = COALESCE(NULLIF(TRIM(cta_preco_noite), ''), 'R$ 380')
WHERE cta_preco_noite IS NULL OR TRIM(cta_preco_noite) = '';
