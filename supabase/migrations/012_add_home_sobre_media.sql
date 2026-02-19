-- Add media gallery for Home > Sobre section
INSERT INTO conteudo_site (chave, valor, categoria)
VALUES ('home_sobre_media', '[]', 'home')
ON CONFLICT (chave) DO NOTHING;
