-- Create enum for room categories
CREATE TYPE categoria_quarto AS ENUM ('standard', 'superior', 'suite');

-- Create quartos table
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

-- Create index for faster queries
CREATE INDEX idx_quartos_slug ON quartos(slug);
CREATE INDEX idx_quartos_ativo ON quartos(ativo);
CREATE INDEX idx_quartos_destaque ON quartos(destaque);
CREATE INDEX idx_quartos_categoria ON quartos(categoria);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_quartos_updated_at
  BEFORE UPDATE ON quartos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE quartos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access on quartos" ON quartos
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify quartos" ON quartos
  FOR ALL USING (auth.role() = 'authenticated');
