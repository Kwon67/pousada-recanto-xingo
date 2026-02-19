-- Add editable image for Home > Sobre preview section
INSERT INTO conteudo_site (chave, valor, categoria)
VALUES (
  'home_sobre_imagem',
  'https://placehold.co/800x600/2D6A4F/FDF8F0?text=Pousada+Recanto+do+Matuto',
  'home'
)
ON CONFLICT (chave) DO NOTHING;
