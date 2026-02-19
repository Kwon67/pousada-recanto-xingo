-- ==========================================
-- MIGRATION COMPLETA - Pousada Recanto do Matuto Xingo
-- Cole tudo isso no SQL Editor do Supabase
-- ==========================================

-- LIMPAR TUDO (ordem inversa por causa das foreign keys)
DROP TABLE IF EXISTS galeria CASCADE;
DROP TABLE IF EXISTS conteudo_site CASCADE;
DROP TABLE IF EXISTS configuracoes CASCADE;
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS hospedes CASCADE;
DROP TABLE IF EXISTS quartos CASCADE;
DROP TYPE IF EXISTS status_reserva CASCADE;
DROP TYPE IF EXISTS categoria_quarto CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 001: Create quartos
CREATE TYPE categoria_quarto AS ENUM ('standard', 'superior', 'suite');

CREATE TABLE quartos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  descricao_curta TEXT,
  categoria categoria_quarto DEFAULT 'standard',
  preco_diaria DECIMAL(10,2) NOT NULL,
  preco_fds DECIMAL(10,2),
  capacidade INT DEFAULT 2,
  tamanho_m2 INT,
  amenidades TEXT[] DEFAULT '{}',
  imagens TEXT[] DEFAULT '{}',
  imagem_principal TEXT,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quartos_slug ON quartos(slug);
CREATE INDEX idx_quartos_ativo ON quartos(ativo);
CREATE INDEX idx_quartos_destaque ON quartos(destaque);
CREATE INDEX idx_quartos_categoria ON quartos(categoria);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quartos_updated_at
  BEFORE UPDATE ON quartos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE quartos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on quartos" ON quartos
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert on quartos" ON quartos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update on quartos" ON quartos
  FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete on quartos" ON quartos
  FOR DELETE USING (true);

-- 002: Create hospedes
CREATE TABLE hospedes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  cidade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT hospedes_email_unique UNIQUE (email)
);

CREATE INDEX idx_hospedes_email ON hospedes(email);
CREATE INDEX idx_hospedes_cpf ON hospedes(cpf);

ALTER TABLE hospedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read hospedes" ON hospedes
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert hospedes" ON hospedes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update hospedes" ON hospedes
  FOR UPDATE USING (true);

-- 003: Create reservas
CREATE TYPE status_reserva AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');

CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quarto_id UUID REFERENCES quartos(id) ON DELETE SET NULL,
  hospede_id UUID REFERENCES hospedes(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_hospedes INT DEFAULT 1,
  valor_total DECIMAL(10,2) NOT NULL,
  status status_reserva DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservas_quarto ON reservas(quarto_id);
CREATE INDEX idx_reservas_hospede ON reservas(hospede_id);
CREATE INDEX idx_reservas_status ON reservas(status);
CREATE INDEX idx_reservas_check_in ON reservas(check_in);
CREATE INDEX idx_reservas_check_out ON reservas(check_out);
CREATE INDEX idx_reservas_dates ON reservas(check_in, check_out);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read reservas" ON reservas
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert reservas" ON reservas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update reservas" ON reservas
  FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to delete reservas" ON reservas
  FOR DELETE USING (true);

-- 004: Create avaliacoes
CREATE TABLE avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospede_id UUID REFERENCES hospedes(id) ON DELETE SET NULL,
  quarto_id UUID REFERENCES quartos(id) ON DELETE SET NULL,
  nota INT CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  aprovada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_hospede ON avaliacoes(hospede_id);
CREATE INDEX idx_avaliacoes_quarto ON avaliacoes(quarto_id);
CREATE INDEX idx_avaliacoes_aprovada ON avaliacoes(aprovada);
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read approved avaliacoes" ON avaliacoes
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert avaliacoes" ON avaliacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update avaliacoes" ON avaliacoes
  FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to delete avaliacoes" ON avaliacoes
  FOR DELETE USING (true);

-- 005: Create configuracoes
CREATE TABLE configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_pousada TEXT DEFAULT 'Pousada Recanto do Matuto Xingo',
  descricao TEXT,
  endereco TEXT DEFAULT 'Piranhas, Alagoas',
  telefone TEXT DEFAULT '(82) 98133-4027',
  email TEXT DEFAULT 'kivora.dev@outlook.com',
  instagram TEXT,
  booking_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  horario_checkin TIME DEFAULT '14:00',
  horario_checkout TIME DEFAULT '12:00'
);

INSERT INTO configuracoes (nome_pousada, descricao, instagram, latitude, longitude) VALUES (
  'Pousada Recanto do Matuto Xingo',
  'Seu refugio as margens do Canyon do Xingo. Pousada nova e aconchegante em Piranhas, Alagoas, com 10 quartos, piscina, area de lazer e hospitalidade nordestina.',
  '@recantodomatutoxingo',
  -9.6258,
  -37.7572
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on configuracoes" ON configuracoes
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to update configuracoes" ON configuracoes
  FOR UPDATE USING (true);

-- 006: Create conteudo_site
CREATE TABLE conteudo_site (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  categoria TEXT DEFAULT 'geral',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conteudo_site_chave ON conteudo_site(chave);
CREATE INDEX idx_conteudo_site_categoria ON conteudo_site(categoria);

CREATE TRIGGER update_conteudo_site_updated_at
  BEFORE UPDATE ON conteudo_site
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE conteudo_site ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on conteudo_site" ON conteudo_site
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to modify conteudo_site" ON conteudo_site
  FOR ALL USING (true);

INSERT INTO conteudo_site (chave, valor, categoria) VALUES
('hero_titulo', 'Seu refugio as margens do Canyon do Xingo', 'home'),
('hero_subtitulo', 'Descanse, respire e viva a natureza do sertao alagoano. Pousada aconchegante com piscina, area de lazer e a hospitalidade nordestina que voce merece.', 'home'),
('home_sobre_titulo', 'Bem-vindo ao Recanto do Matuto', 'home'),
('home_sobre_texto', 'Uma pousada nova e aconchegante em Piranhas, Alagoas. Construida com carinho para receber voce que busca tranquilidade, conforto e contato com a natureza as margens do Canyon do Xingo.', 'home'),
('home_sobre_imagem', 'https://placehold.co/800x600/2D6A4F/FDF8F0?text=Pousada+Recanto+do+Matuto', 'home'),
('home_sobre_media', '[]', 'home'),
('home_cta_titulo', 'Reserve agora e viva essa experiencia', 'home'),
('home_cta_subtitulo', 'Quartos a partir de R$ 180/noite', 'home'),
('sobre_titulo', 'Nossa Historia', 'sobre'),
('sobre_texto', 'A Pousada Recanto do Matuto Xingo nasceu do sonho de criar um espaco onde os visitantes pudessem se sentir em casa, cercados pela beleza natural do sertao alagoano. Localizada em Piranhas, a poucos minutos do Canyon do Xingo, nossa pousada oferece 10 quartos aconchegantes, todos com banheiro privativo, alem de piscina, area de redes, churrasqueira e chuveirrao.', 'sobre'),
('contato_como_chegar', 'De aviao: O aeroporto mais proximo e o de Aracaju (SE) ou Maceio (AL). De la, sao aproximadamente 3 horas de carro ate Piranhas. De carro: Piranhas fica as margens do Rio Sao Francisco, acessivel pela AL-220.', 'contato'),
('politica_cancelamento', 'Cancelamento gratuito ate 48 horas antes do check-in. Apos esse prazo, sera cobrada a primeira diaria como taxa.', 'geral'),
('regras_pousada', 'Check-in a partir das 14h. Check-out ate as 12h. Silencio apos as 22h. Pets nao permitidos. Cafe da manha incluso.', 'geral');

-- 007: Create galeria
CREATE TABLE galeria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  categoria TEXT DEFAULT 'pousada',
  destaque BOOLEAN DEFAULT false,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_galeria_categoria ON galeria(categoria);
CREATE INDEX idx_galeria_ordem ON galeria(ordem);

ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on galeria" ON galeria
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to modify galeria" ON galeria
  FOR ALL USING (true);

-- SEED: Dados iniciais dos quartos
INSERT INTO quartos (nome, slug, descricao, descricao_curta, categoria, preco_diaria, preco_fds, capacidade, tamanho_m2, amenidades, ativo, destaque, ordem) VALUES
('Quarto Xingo', 'quarto-xingo', 'Quarto aconchegante com vista para o jardim. Ideal para casais que buscam tranquilidade e conforto. Decoracao inspirada nas belezas naturais do Canyon do Xingo, com tons terrosos e elementos que remetem a natureza do sertao nordestino.', 'Aconchegante quarto com vista para o jardim', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, true, 1),
('Quarto Sertao', 'quarto-sertao', 'Quarto amplo inspirado na cultura sertaneja. Perfeito para quem quer viver a experiencia nordestina autentica. A decoracao traz elementos tipicos do sertao, como redes de descanso e artesanato local.', 'Quarto amplo com inspiracao sertaneja', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 2),
('Quarto Cangaco', 'quarto-cangaco', 'Quarto confortavel com decoracao que homenageia a historia do cangaco na regiao. Um tributo a rica historia do sertao nordestino e seus personagens marcantes.', 'Confortavel com tematica do cangaco', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 3),
('Quarto Sao Francisco', 'quarto-sao-francisco', 'Quarto espacoso com decoracao em tons do Rio Sao Francisco. Acomoda ate 3 hospedes com conforto. A atmosfera remete as aguas calmas e a vegetacao ribeirinha do Velho Chico.', 'Espacoso com tons do Rio Sao Francisco', 'superior', 250.00, 300.00, 3, 22, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, true, 4),
('Quarto Catingueira', 'quarto-catingueira', 'Quarto superior com acabamento premium e espaco extra para relaxar. Inspirado na catingueira, arvore simbolo da caatinga.', 'Superior com acabamento premium', 'superior', 250.00, 300.00, 3, 22, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 5),
('Quarto Mandacaru', 'quarto-mandacaru', 'Quarto charmoso que celebra a flora do sertao. Confortavel e arejado, com decoracao que traz a forca e beleza do mandacaru.', 'Charmoso com tema da flora sertaneja', 'superior', 250.00, 300.00, 2, 20, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 6),
('Suite Canyon', 'suite-canyon', 'Nossa suite mais especial. Espaco generoso, banheiro amplo e toda a tranquilidade que voce merece. A Suite Canyon e um verdadeiro refugio de luxo, com decoracao que remete as formacoes rochosas do Canyon do Xingo.', 'Suite premium com espaco generoso', 'suite', 350.00, 420.00, 2, 30, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV Smart', 'Frigobar', 'Ventilador', 'Roupao', 'Roupa de cama premium', 'Toalhas', 'Espelho grande'], true, true, 7),
('Suite Rio Bravo', 'suite-rio-bravo', 'Suite luxuosa com decoracao elegante e espaco para familias pequenas. Inspirada na forca do Rio Sao Francisco, tambem chamado de Rio Bravo pelos antigos navegadores.', 'Suite luxuosa para familias', 'suite', 350.00, 420.00, 4, 32, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV Smart', 'Frigobar', 'Ventilador', 'Roupao', 'Roupa de cama premium', 'Toalhas', 'Cama extra'], true, false, 8),
('Quarto Lampiao', 'quarto-lampiao', 'Quarto standard com todo o conforto necessario. Homenagem ao Rei do Cangaco, Virgulino Ferreira da Silva, o Lampiao. Decoracao rustica e acolhedora.', 'Standard confortavel com tematica Lampiao', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 9),
('Quarto Caatinga', 'quarto-caatinga', 'Quarto acolhedor com cores e texturas que remetem ao bioma Caatinga. Um tributo a vegetacao unica do semiarido brasileiro.', 'Acolhedor com cores da Caatinga', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 10);
