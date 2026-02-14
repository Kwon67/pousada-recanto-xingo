-- Seed data for Pousada Recanto do Matuto Xingó

-- Insert quartos
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

-- Insert sample hospedes
INSERT INTO hospedes (nome, email, telefone, cpf, cidade) VALUES
('Maria das Dores Silva', 'maria@email.com', '(81) 99999-1234', '123.456.789-00', 'Recife, PE'),
('José Firmino de Oliveira', 'jose@email.com', '(82) 99999-5678', '234.567.890-11', 'Maceió, AL'),
('Ana Cláudia Ferreira', 'ana@email.com', '(71) 99999-9012', '345.678.901-22', 'Salvador, BA'),
('Carlos Eduardo Santos', 'carlos@email.com', '(79) 99999-3456', '456.789.012-33', 'Aracaju, SE'),
('Francisca Souza Lima', 'francisca@email.com', '(85) 99999-7890', '567.890.123-44', 'Fortaleza, CE');

-- Insert sample avaliacoes
INSERT INTO avaliacoes (hospede_id, nota, comentario, aprovada)
SELECT id, 5, 'Lugar maravilhoso! A pousada é novinha, muito limpa e organizada. A localização é perfeita, pertinho do canyon. Os donos são muito atenciosos e nos fizeram sentir em casa. Já estou planejando voltar!', true
FROM hospedes WHERE nome = 'Maria das Dores Silva';

INSERT INTO avaliacoes (hospede_id, nota, comentario, aprovada)
SELECT id, 5, 'Passamos o fim de semana em família e foi incrível! A piscina é ótima, as crianças adoraram. Os quartos são confortáveis e a hospitalidade é nota 10. O passeio de catamarã no canyon é imperdível!', true
FROM hospedes WHERE nome = 'José Firmino de Oliveira';

INSERT INTO avaliacoes (hospede_id, nota, comentario, aprovada)
SELECT id, 5, 'A suíte Canyon é simplesmente perfeita! Vista linda, cama super confortável e o banheiro é um sonho. A pousada tem um clima acolhedor que só o nordeste sabe oferecer. Recomendo demais!', true
FROM hospedes WHERE nome = 'Ana Cláudia Ferreira';

INSERT INTO avaliacoes (hospede_id, nota, comentario, aprovada)
SELECT id, 5, 'Fui conhecer o Xingó e encontrei essa pousada maravilhosa! Tudo muito novo e bem cuidado. A área das redes é perfeita para relaxar depois dos passeios. O café da manhã regional é delicioso!', true
FROM hospedes WHERE nome = 'Carlos Eduardo Santos';

INSERT INTO avaliacoes (hospede_id, nota, comentario, aprovada)
SELECT id, 5, 'Experiência inesquecível! A pousada é um verdadeiro recanto, como o nome diz. Equipe super simpática, estrutura excelente e localização privilegiada. Vale cada centavo!', true
FROM hospedes WHERE nome = 'Francisca Souza Lima';
