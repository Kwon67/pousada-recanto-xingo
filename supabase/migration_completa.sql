-- ==========================================
-- MIGRATION COMPLETA - Pousada Recanto do Matuto Xingó
-- Cole tudo isso no SQL Editor do Supabase
-- ==========================================

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
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  nome_pousada TEXT DEFAULT 'Pousada Recanto do Matuto Xingó',
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
  'Pousada Recanto do Matuto Xingó',
  'Seu refúgio às margens do Canyon do Xingó. Pousada nova e aconchegante em Piranhas, Alagoas, com 10 quartos, piscina, área de lazer e hospitalidade nordestina.',
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
('hero_titulo', 'Seu refúgio às margens do Canyon do Xingó', 'home'),
('hero_subtitulo', 'Descanse, respire e viva a natureza do sertão alagoano. Pousada aconchegante com piscina, área de lazer e a hospitalidade nordestina que você merece.', 'home'),
('home_sobre_titulo', 'Bem-vindo ao Recanto do Matuto', 'home'),
('home_sobre_texto', 'Uma pousada nova e aconchegante em Piranhas, Alagoas. Construída com carinho para receber você que busca tranquilidade, conforto e contato com a natureza às margens do Canyon do Xingó.', 'home'),
('home_cta_titulo', 'Reserve agora e viva essa experiência', 'home'),
('home_cta_subtitulo', 'Quartos a partir de R$ 180/noite', 'home'),
('sobre_titulo', 'Nossa História', 'sobre'),
('sobre_texto', 'A Pousada Recanto do Matuto Xingó nasceu do sonho de criar um espaço onde os visitantes pudessem se sentir em casa, cercados pela beleza natural do sertão alagoano. Localizada em Piranhas, a poucos minutos do Canyon do Xingó, nossa pousada oferece 10 quartos aconchegantes, todos com banheiro privativo, além de piscina, área de redes, churrasqueira e chuveirão.', 'sobre'),
('contato_como_chegar', 'De avião: O aeroporto mais próximo é o de Aracaju (SE) ou Maceió (AL). De lá, são aproximadamente 3 horas de carro até Piranhas. De carro: Piranhas fica às margens do Rio São Francisco, acessível pela AL-220.', 'contato'),
('politica_cancelamento', 'Cancelamento gratuito até 48 horas antes do check-in. Após esse prazo, será cobrada a primeira diária como taxa.', 'geral'),
('regras_pousada', 'Check-in a partir das 14h. Check-out até as 12h. Silêncio após as 22h. Pets não permitidos. Café da manhã incluso.', 'geral');

-- 007: Create galeria
CREATE TABLE galeria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  categoria TEXT DEFAULT 'pousada',
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
('Quarto Xingó', 'quarto-xingo', 'Quarto aconchegante com vista para o jardim. Ideal para casais que buscam tranquilidade e conforto. Decoração inspirada nas belezas naturais do Canyon do Xingó, com tons terrosos e elementos que remetem à natureza do sertão nordestino.', 'Aconchegante quarto com vista para o jardim', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, true, 1),
('Quarto Sertão', 'quarto-sertao', 'Quarto amplo inspirado na cultura sertaneja. Perfeito para quem quer viver a experiência nordestina autêntica. A decoração traz elementos típicos do sertão, como redes de descanso e artesanato local.', 'Quarto amplo com inspiração sertaneja', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 2),
('Quarto Cangaço', 'quarto-cangaco', 'Quarto confortável com decoração que homenageia a história do cangaço na região. Um tributo à rica história do sertão nordestino e seus personagens marcantes.', 'Confortável com temática do cangaço', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 3),
('Quarto São Francisco', 'quarto-sao-francisco', 'Quarto espaçoso com decoração em tons do Rio São Francisco. Acomoda até 3 hóspedes com conforto. A atmosfera remete às águas calmas e à vegetação ribeirinha do Velho Chico.', 'Espaçoso com tons do Rio São Francisco', 'superior', 250.00, 300.00, 3, 22, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, true, 4),
('Quarto Catingueira', 'quarto-catingueira', 'Quarto superior com acabamento premium e espaço extra para relaxar. Inspirado na catingueira, árvore símbolo da caatinga.', 'Superior com acabamento premium', 'superior', 250.00, 300.00, 3, 22, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 5),
('Quarto Mandacaru', 'quarto-mandacaru', 'Quarto charmoso que celebra a flora do sertão. Confortável e arejado, com decoração que traz a força e beleza do mandacaru.', 'Charmoso com tema da flora sertaneja', 'superior', 250.00, 300.00, 2, 20, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Frigobar', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 6),
('Suíte Canyon', 'suite-canyon', 'Nossa suíte mais especial. Espaço generoso, banheiro amplo e toda a tranquilidade que você merece. A Suíte Canyon é um verdadeiro refúgio de luxo, com decoração que remete às formações rochosas do Canyon do Xingó.', 'Suíte premium com espaço generoso', 'suite', 350.00, 420.00, 2, 30, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV Smart', 'Frigobar', 'Ventilador', 'Roupão', 'Roupa de cama premium', 'Toalhas', 'Espelho grande'], true, true, 7),
('Suíte Rio Bravo', 'suite-rio-bravo', 'Suíte luxuosa com decoração elegante e espaço para famílias pequenas. Inspirada na força do Rio São Francisco, também chamado de Rio Bravo pelos antigos navegadores.', 'Suíte luxuosa para famílias', 'suite', 350.00, 420.00, 4, 32, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV Smart', 'Frigobar', 'Ventilador', 'Roupão', 'Roupa de cama premium', 'Toalhas', 'Cama extra'], true, false, 8),
('Quarto Lampião', 'quarto-lampiao', 'Quarto standard com todo o conforto necessário. Homenagem ao Rei do Cangaço, Virgulino Ferreira da Silva, o Lampião. Decoração rústica e acolhedora.', 'Standard confortável com temática Lampião', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 9),
('Quarto Caatinga', 'quarto-caatinga', 'Quarto acolhedor com cores e texturas que remetem ao bioma Caatinga. Um tributo à vegetação única do semiárido brasileiro.', 'Acolhedor com cores da Caatinga', 'standard', 180.00, 220.00, 2, 18, ARRAY['Banheiro privativo', 'Wi-Fi', 'Ar-condicionado', 'TV', 'Ventilador', 'Roupa de cama', 'Toalhas'], true, false, 10);
