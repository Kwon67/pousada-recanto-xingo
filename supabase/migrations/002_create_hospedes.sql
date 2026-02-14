-- Create hospedes table
CREATE TABLE hospedes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  cidade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_hospedes_email ON hospedes(email);
CREATE INDEX idx_hospedes_cpf ON hospedes(cpf);

-- Enable Row Level Security
ALTER TABLE hospedes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read hospedes" ON hospedes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow anyone to insert (for reservations)
CREATE POLICY "Allow anyone to insert hospedes" ON hospedes
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify hospedes" ON hospedes
  FOR UPDATE USING (auth.role() = 'authenticated');
