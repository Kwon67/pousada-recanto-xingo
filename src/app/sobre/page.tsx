import { Metadata } from 'next';
import { getGaleria, GaleriaItem } from '@/lib/actions/galeria';
import { getMetadataBase, getSiteUrl } from '@/lib/site-url';
import SobreClient, { SobreCardImage } from './SobreClient';

const SITE_URL = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const title = `Nossa História | Pousada Recanto do Matuto`;
  const description = `Conheça o Recanto do Matuto e nossa paixão por receber bem. Uma pousada construída com amor e dedicação no coração do sertão alagoano.`;
  
  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/sobre`,
      siteName: 'Pousada Recanto do Matuto',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

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

function toCandidates(items: GaleriaItem[], defaultAlt: string): SobreCardImage[] {
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

export default async function SobrePage() {
  const galeria = await getGaleria();

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

  const sobreCards: Record<'pousada' | 'area' | 'piscina' | 'quarto', SobreCardImage> = {
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

  return <SobreClient sobreCards={sobreCards} />;
}
