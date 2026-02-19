-- Ensure galeria supports featured images
ALTER TABLE galeria
  ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;

UPDATE galeria
SET destaque = COALESCE(destaque, false);
