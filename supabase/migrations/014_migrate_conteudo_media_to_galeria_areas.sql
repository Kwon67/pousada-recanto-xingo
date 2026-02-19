-- Migrate media references from conteudo_site into area-specific galeria categories.
-- This allows managing all images/videos from Admin > Galeria only.

-- 1) Migrate JSON media arrays (home_sobre_media + home_estrutura_*_media).
WITH json_key_map AS (
  SELECT * FROM (
    VALUES
      ('home_sobre_media', 'home_sobre', 'Home - Sobre'),
      ('home_estrutura_1_media', 'home_estrutura_1', 'Estrutura - Piscina'),
      ('home_estrutura_2_media', 'home_estrutura_2', 'Estrutura - Área de Redes'),
      ('home_estrutura_3_media', 'home_estrutura_3', 'Estrutura - Churrasqueira'),
      ('home_estrutura_4_media', 'home_estrutura_4', 'Estrutura - Chuveirão'),
      ('home_estrutura_5_media', 'home_estrutura_5', 'Estrutura - Espaço Amplo'),
      ('home_estrutura_6_media', 'home_estrutura_6', 'Estrutura - Banheiro Privativo')
  ) AS t(chave, categoria, alt_padrao)
),
json_sources AS (
  SELECT
    km.categoria,
    km.alt_padrao,
    CASE
      WHEN cs.valor IS NULL OR btrim(cs.valor) = '' THEN '[]'::jsonb
      ELSE cs.valor::jsonb
    END AS payload
  FROM json_key_map km
  LEFT JOIN conteudo_site cs ON cs.chave = km.chave
),
json_items AS (
  SELECT
    js.categoria,
    NULLIF(btrim(item->>'url'), '') AS url,
    COALESCE(NULLIF(btrim(item->>'alt'), ''), js.alt_padrao) AS alt,
    ROW_NUMBER() OVER (PARTITION BY js.categoria ORDER BY ordinality) AS seq
  FROM json_sources js
  CROSS JOIN LATERAL jsonb_array_elements(js.payload) WITH ORDINALITY AS arr(item, ordinality)
),
json_to_insert AS (
  SELECT categoria, url, alt, seq
  FROM json_items
  WHERE url IS NOT NULL
)
INSERT INTO galeria (url, alt, categoria, ordem, destaque)
SELECT
  j.url,
  j.alt,
  j.categoria,
  COALESCE((SELECT MAX(g.ordem) FROM galeria g WHERE g.categoria = j.categoria), -1) + j.seq,
  false
FROM json_to_insert j
WHERE NOT EXISTS (
  SELECT 1
  FROM galeria g
  WHERE g.categoria = j.categoria
    AND g.url = j.url
);

-- 2) Migrate legacy single-image keys (fallback URLs).
WITH legacy_key_map AS (
  SELECT * FROM (
    VALUES
      ('home_sobre_imagem', 'home_sobre', 'Home - Sobre'),
      ('home_estrutura_piscina_imagem', 'home_estrutura_1', 'Estrutura - Piscina'),
      ('home_estrutura_area_redes_imagem', 'home_estrutura_2', 'Estrutura - Área de Redes'),
      ('home_estrutura_churrasqueira_imagem', 'home_estrutura_3', 'Estrutura - Churrasqueira'),
      ('home_estrutura_chuveirao_imagem', 'home_estrutura_4', 'Estrutura - Chuveirão'),
      ('home_estrutura_espaco_amplo_imagem', 'home_estrutura_5', 'Estrutura - Espaço Amplo'),
      ('home_estrutura_banheiro_privativo_imagem', 'home_estrutura_6', 'Estrutura - Banheiro Privativo')
  ) AS t(chave, categoria, alt_padrao)
),
legacy_items AS (
  SELECT
    lk.categoria,
    NULLIF(btrim(cs.valor), '') AS url,
    lk.alt_padrao AS alt
  FROM legacy_key_map lk
  LEFT JOIN conteudo_site cs ON cs.chave = lk.chave
),
legacy_ranked AS (
  SELECT
    li.categoria,
    li.url,
    li.alt,
    ROW_NUMBER() OVER (PARTITION BY li.categoria ORDER BY li.url) AS seq
  FROM legacy_items li
  WHERE li.url IS NOT NULL
)
INSERT INTO galeria (url, alt, categoria, ordem, destaque)
SELECT
  lr.url,
  lr.alt,
  lr.categoria,
  COALESCE((SELECT MAX(g.ordem) FROM galeria g WHERE g.categoria = lr.categoria), -1) + lr.seq,
  false
FROM legacy_ranked lr
WHERE NOT EXISTS (
  SELECT 1
  FROM galeria g
  WHERE g.categoria = lr.categoria
    AND g.url = lr.url
);
