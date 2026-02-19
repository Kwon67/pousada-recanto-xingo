-- Unifica categorias públicas antigas da galeria em uma única categoria: `momentos`.
-- Mantém intactas as áreas específicas da Home (home_sobre, home_estrutura_*).

UPDATE galeria
SET categoria = 'momentos'
WHERE categoria IN ('pousada', 'quartos', 'area_lazer', 'cafe');

-- Opcionalmente normaliza registros sem categoria para também cair em `momentos`.
UPDATE galeria
SET categoria = 'momentos'
WHERE categoria IS NULL OR btrim(categoria) = '';
