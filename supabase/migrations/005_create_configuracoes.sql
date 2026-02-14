-- Create configuracoes table
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

-- Insert default configuration
INSERT INTO configuracoes (nome_pousada, descricao, instagram, latitude, longitude) VALUES (
  'Pousada Recanto do Matuto Xingó',
  'Seu refúgio às margens do Canyon do Xingó. Pousada nova e aconchegante em Piranhas, Alagoas, com 10 quartos, piscina, área de lazer e hospitalidade nordestina.',
  '@recantodomatutoxingo',
  -9.6258,
  -37.7572
);

-- Enable Row Level Security
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access on configuracoes" ON configuracoes
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify configuracoes" ON configuracoes
  FOR UPDATE USING (auth.role() = 'authenticated');
