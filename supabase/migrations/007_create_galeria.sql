-- Create galeria table
CREATE TABLE galeria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  categoria TEXT DEFAULT 'pousada',
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_galeria_categoria ON galeria(categoria);
CREATE INDEX idx_galeria_ordem ON galeria(ordem);

-- Enable RLS
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Allow public read access on galeria" ON galeria
  FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "Allow authenticated users to modify galeria" ON galeria
  FOR ALL USING (auth.role() = 'authenticated');
