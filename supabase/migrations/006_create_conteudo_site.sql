-- Create conteudo_site table for CMS
CREATE TABLE conteudo_site (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  categoria TEXT DEFAULT 'geral',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_conteudo_site_chave ON conteudo_site(chave);
CREATE INDEX idx_conteudo_site_categoria ON conteudo_site(categoria);

-- Trigger for updated_at
CREATE TRIGGER update_conteudo_site_updated_at
  BEFORE UPDATE ON conteudo_site
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE conteudo_site ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Allow public read access on conteudo_site" ON conteudo_site
  FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "Allow authenticated users to modify conteudo_site" ON conteudo_site
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed default content
INSERT INTO conteudo_site (chave, valor, categoria) VALUES
('hero_titulo', 'Seu refúgio às margens do Canyon do Xingó', 'home'),
('hero_subtitulo', 'Descanse, respire e viva a natureza do sertão alagoano. Pousada aconchegante com piscina, área de lazer e a hospitalidade nordestina que você merece.', 'home'),
('home_sobre_titulo', 'Bem-vindo ao Recanto do Matuto', 'home'),
('home_sobre_texto', 'Uma pousada nova e aconchegante em Piranhas, Alagoas. Construída com carinho para receber você que busca tranquilidade, conforto e contato com a natureza às margens do Canyon do Xingó.', 'home'),
('home_sobre_imagem', 'https://placehold.co/800x600/2D6A4F/FDF8F0?text=Pousada+Recanto+do+Matuto', 'home'),
('home_sobre_media', '[]', 'home'),
('home_cta_titulo', 'Reserve agora e viva essa experiência', 'home'),
('home_cta_subtitulo', 'Quartos a partir de R$ 180/noite', 'home'),
('sobre_titulo', 'Nossa História', 'sobre'),
('sobre_texto', 'A Pousada Recanto do Matuto Xingó nasceu do sonho de criar um espaço onde os visitantes pudessem se sentir em casa, cercados pela beleza natural do sertão alagoano. Localizada em Piranhas, a poucos minutos do Canyon do Xingó, nossa pousada oferece 10 quartos aconchegantes, todos com banheiro privativo, além de piscina, área de redes, churrasqueira e chuveirão.', 'sobre'),
('contato_como_chegar', 'De avião: O aeroporto mais próximo é o de Aracaju (SE) ou Maceió (AL). De lá, são aproximadamente 3 horas de carro até Piranhas. De carro: Piranhas fica às margens do Rio São Francisco, acessível pela AL-220.', 'contato'),
('politica_cancelamento', 'Cancelamento gratuito até 48 horas antes do check-in. Após esse prazo, será cobrada a primeira diária como taxa.', 'geral'),
('regras_pousada', 'Check-in a partir das 14h. Check-out até as 12h. Silêncio após as 22h. Pets não permitidos. Café da manhã incluso.', 'geral');
