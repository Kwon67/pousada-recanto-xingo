-- Create avaliacoes table
CREATE TABLE avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospede_id UUID REFERENCES hospedes(id) ON DELETE SET NULL,
  quarto_id UUID REFERENCES quartos(id) ON DELETE SET NULL,
  nota INT CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  aprovada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_avaliacoes_hospede ON avaliacoes(hospede_id);
CREATE INDEX idx_avaliacoes_quarto ON avaliacoes(quarto_id);
CREATE INDEX idx_avaliacoes_aprovada ON avaliacoes(aprovada);
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota);

-- Enable Row Level Security
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for approved reviews
CREATE POLICY "Allow public read access on approved avaliacoes" ON avaliacoes
  FOR SELECT USING (aprovada = true);

-- Create policy to allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read all avaliacoes" ON avaliacoes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow anyone to insert (for submitting reviews)
CREATE POLICY "Allow anyone to insert avaliacoes" ON avaliacoes
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify avaliacoes" ON avaliacoes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete avaliacoes" ON avaliacoes
  FOR DELETE USING (auth.role() = 'authenticated');
