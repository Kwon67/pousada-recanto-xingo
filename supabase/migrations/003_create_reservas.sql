-- Create enum for reservation status
CREATE TYPE status_reserva AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');

-- Create reservas table
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

-- Create indexes
CREATE INDEX idx_reservas_quarto ON reservas(quarto_id);
CREATE INDEX idx_reservas_hospede ON reservas(hospede_id);
CREATE INDEX idx_reservas_status ON reservas(status);
CREATE INDEX idx_reservas_check_in ON reservas(check_in);
CREATE INDEX idx_reservas_check_out ON reservas(check_out);
CREATE INDEX idx_reservas_dates ON reservas(check_in, check_out);

-- Enable Row Level Security
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read reservas" ON reservas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow anyone to insert (for making reservations)
CREATE POLICY "Allow anyone to insert reservas" ON reservas
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to modify
CREATE POLICY "Allow authenticated users to modify reservas" ON reservas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete reservas" ON reservas
  FOR DELETE USING (auth.role() = 'authenticated');
