'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Utensils,
  Wind,
  Leaf,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/app-button';
import Link from 'next/link';
import EssenceMark from '@/components/icons/EssenceMark';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

const diferenciais = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Hospitalidade Nordestina',
    desc: 'Recebemos você como se fosse da família. Atendimento caloroso e acolhedor que só o Nordeste sabe oferecer.',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Localização Privilegiada',
    desc: 'A poucos minutos do Canyon do Xingó e do Rio São Francisco, em Piranhas, uma das cidades mais charmosas de Alagoas.',
  },
  {
    icon: <EssenceMark className="w-6 h-6" />,
    title: 'Conforto e Limpeza',
    desc: 'Quartos novos, bem equipados e impecavelmente limpos. Sua satisfação é nossa prioridade.',
  },
  {
    icon: <Utensils className="w-6 h-6" />,
    title: 'Gastronomia Regional',
    desc: 'Sabores autênticos do sertão para você. Café da manhã regional e indicações dos melhores restaurantes.',
  },
  {
    icon: <Wind className="w-6 h-6" />,
    title: 'Espaço Amplo e Arejado',
    desc: 'Ambiente espaçoso com boa ventilação natural e áreas de convivência confortáveis.',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Contato com a Natureza',
    desc: 'Cercados pela beleza do sertão, com paisagens deslumbrantes e ar puro.',
  },
];

type GaleriaPublicItem = {
  id: string;
  url: string;
  alt: string | null;
  categoria: string | null;
  ordem: number;
  destaque: boolean;
};

type SobreCardImage = {
  url: string;
  alt: string;
};

const SOBRE_CARD_FALLBACKS: Record<'pousada' | 'area' | 'piscina' | 'quarto', SobreCardImage> = {
  pousada: {
    url: 'https://placehold.co/400x500/2D6A4F/FDF8F0?text=Pousada+1',
    alt: 'Pousada',
  },
  area: {
    url: 'https://placehold.co/400x300/D4A843/1B3A4B?text=Area+de+Lazer',
    alt: 'Área de lazer',
  },
  piscina: {
    url: 'https://placehold.co/400x300/1B3A4B/FDF8F0?text=Piscina',
    alt: 'Piscina',
  },
  quarto: {
    url: 'https://placehold.co/400x500/E07A5F/FDF8F0?text=Quarto',
    alt: 'Quarto',
  },
};

const PUBLIC_GALERIA_CATEGORIES = new Set(['momentos', 'pousada', 'quartos', 'area_lazer', 'cafe']);

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toCandidates(items: GaleriaPublicItem[], defaultAlt: string): SobreCardImage[] {
  return items
    .map((item) => {
      const url = sanitizeUrl(item.url);
      if (!url) return null;
      return {
        url,
        alt: item.alt?.trim() || defaultAlt,
      };
    })
    .filter((item): item is SobreCardImage => Boolean(item));
}

export default function SobrePage() {
  const [galeria, setGaleria] = useState<GaleriaPublicItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadMedia = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('galeria')
          .select('id,url,alt,categoria,ordem,destaque')
          .order('ordem');

        if (!mounted) return;

        if (!error && data) {
          setGaleria(data as GaleriaPublicItem[]);
        }
      } catch {
        // Keep placeholders when Supabase is unavailable on client.
      }
    };

    void loadMedia();

    return () => {
      mounted = false;
    };
  }, []);

  const sobreCards = useMemo(() => {
    const orderedGaleria = [...galeria]
      .filter((item) => !item.categoria || PUBLIC_GALERIA_CATEGORIES.has(item.categoria))
      .sort((a, b) => a.ordem - b.ordem);

    const momentosItems = orderedGaleria.filter(
      (item) => !item.categoria || item.categoria === 'momentos'
    );
    const pousadaItems = orderedGaleria.filter((item) => item.categoria === 'pousada');
    const areaItems = orderedGaleria.filter((item) => item.categoria === 'area_lazer');
    const quartoItems = orderedGaleria.filter((item) => item.categoria === 'quartos');
    const destaqueItems = orderedGaleria.filter((item) => item.destaque);
    const piscinaItems = [...areaItems, ...momentosItems]
      .filter((item) => /piscina/i.test(item.alt ?? '') || /piscina/i.test(item.url));

    const pousadaCandidates = toCandidates([...pousadaItems, ...momentosItems], 'Pousada');
    const areaCandidates = toCandidates([...areaItems, ...momentosItems], 'Área de lazer');
    const piscinaCandidates = toCandidates(piscinaItems, 'Piscina');
    const quartoCandidates = toCandidates([...quartoItems, ...momentosItems], 'Quarto');
    const destaqueCandidates = toCandidates(destaqueItems, 'Foto em destaque');

    const homeSobreCandidates: SobreCardImage[] = [];

    const genericFallbackPool = [
      ...homeSobreCandidates,
      ...destaqueCandidates,
      ...pousadaCandidates,
      ...areaCandidates,
      ...quartoCandidates,
    ];

    const usedUrls = new Set<string>();
    const pickUnique = (groups: SobreCardImage[][], fallback: SobreCardImage) => {
      for (const group of groups) {
        for (const item of group) {
          if (item?.url && !usedUrls.has(item.url)) {
            usedUrls.add(item.url);
            return item;
          }
        }
      }

      for (const item of genericFallbackPool) {
        if (item?.url && !usedUrls.has(item.url)) {
          usedUrls.add(item.url);
          return item;
        }
      }

      return fallback;
    };

    return {
      pousada: pickUnique(
        [pousadaCandidates, destaqueCandidates, homeSobreCandidates, areaCandidates],
        SOBRE_CARD_FALLBACKS.pousada
      ),
      area: pickUnique(
        [areaCandidates, destaqueCandidates, homeSobreCandidates, pousadaCandidates],
        SOBRE_CARD_FALLBACKS.area
      ),
      piscina: pickUnique(
        [piscinaCandidates, areaCandidates, destaqueCandidates, homeSobreCandidates],
        SOBRE_CARD_FALLBACKS.piscina
      ),
      quarto: pickUnique(
        [quartoCandidates, destaqueCandidates, homeSobreCandidates, pousadaCandidates],
        SOBRE_CARD_FALLBACKS.quarto
      ),
    };
  }, [galeria]);

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://placehold.co/1920x800/1B3A4B/2D6A4F?text=Pousada+Recanto+do+Matuto)',
          }}
        />
        <div className="absolute inset-0 bg-dark/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Nossa História
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto px-4">
            Conheça o Recanto do Matuto e nossa paixão por receber bem
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-cream noise-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <Building2 className="w-5 h-5" />
                <span>Sobre Nós</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
                Uma pousada construída com{' '}
                <span className="text-primary">amor e dedicação</span>
              </h2>
              <div className="space-y-4 text-text-light leading-relaxed">
                <p>
                  A Pousada Recanto do Matuto nasceu do sonho de criar um espaço acolhedor
                  para receber os visitantes que vêm conhecer as belezas do Canyon do Xingó
                  e da região de Piranhas, em Alagoas.
                </p>
                <p>
                  Somos uma pousada nova, inaugurada com a missão de oferecer conforto,
                  tranquilidade e a autêntica hospitalidade nordestina. Cada detalhe foi
                  pensado para que você se sinta em casa, do primeiro ao último dia da sua
                  estadia.
                </p>
                <p>
                  Nosso nome, &quot;Matuto&quot;, é uma homenagem carinhosa ao povo do sertão
                  nordestino – simples, trabalhador e de coração generoso. Aqui, você
                  encontrará essa essência em cada atendimento, cada sorriso e cada
                  cuidado.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src={sobreCards.pousada.url}
                    alt={sobreCards.pousada.alt}
                    className="w-full rounded-2xl shadow-lg"
                  />
                  <img
                    src={sobreCards.area.url}
                    alt={sobreCards.area.alt}
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src={sobreCards.piscina.url}
                    alt={sobreCards.piscina.alt}
                    className="w-full rounded-2xl shadow-lg"
                  />
                  <img
                    src={sobreCards.quarto.url}
                    alt={sobreCards.quarto.alt}
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
              Por que escolher o <span className="text-primary">Recanto</span>?
            </h2>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              Diferenciais que fazem da sua estadia uma experiência inesquecível
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diferenciais.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-cream rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-text-light text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Region Section */}
      <section className="bg-dark py-20 dark-dots">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://placehold.co/800x600/1B3A4B/D4A843?text=Canyon+do+Xingo"
                alt="Canyon do Xingó"
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Sobre a <span className="text-secondary">Região</span>
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  <strong className="text-white">Piranhas</strong> é uma cidade histórica
                  às margens do Rio São Francisco, conhecida por sua arquitetura colonial
                  preservada e por ser palco de importantes momentos da história do
                  cangaço.
                </p>
                <p>
                  O <strong className="text-white">Canyon do Xingó</strong> é uma das
                  formações geológicas mais impressionantes do Brasil, com paredões de até
                  50 metros de altura esculpidos pelas águas do Velho Chico ao longo de
                  milhões de anos.
                </p>
                <p>
                  A região oferece experiências únicas: passeios de catamarã pelo canyon,
                  trilhas, museus, gastronomia típica e a famosa Rota do Cangaço, que
                  conta a história de Lampião e Maria Bonita.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-secondary">50m</p>
                  <p className="text-white/60 text-sm">Paredões do Canyon</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-secondary">2.700km</p>
                  <p className="text-white/60 text-sm">Rio São Francisco</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-secondary">+300</p>
                  <p className="text-white/60 text-sm">Anos de história</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream noise-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
              Venha nos visitar
            </h2>
            <p className="text-text-light text-lg mb-8">
              Estamos esperando você de braços abertos. Reserve agora e viva essa
              experiência única no sertão alagoano.
            </p>
            <Link href="/reservas">
              <Button size="lg">Fazer minha reserva</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
