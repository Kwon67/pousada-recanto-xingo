import { Metadata } from 'next';
import { getGaleria, GaleriaItem } from '@/lib/actions/galeria';
import { getConteudoValor } from '@/lib/actions/conteudo';
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

const CANYON_CARD_FALLBACK: SobreCardImage = {
  url: 'https://placehold.co/800x600/1B3A4B/D4A843?text=Canyon+do+Xingo',
  alt: 'Canyon do Xingó',
};

const PUBLIC_GALERIA_CATEGORIES = new Set(['momentos', 'pousada', 'quartos', 'area_lazer', 'cafe']);

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isLikelyVideoUrl(url: string): boolean {
  return /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function sanitizeImageUrl(url: string | null | undefined): string | null {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return null;
  return isLikelyVideoUrl(sanitized) ? null : sanitized;
}

function hasCategory(categoria: string | null | undefined, target: string): boolean {
  if (!categoria) return false;
  return categoria
    .split(',')
    .map((value) => value.trim())
    .some((value) => value === target);
}

function getCategories(categoria: string | null | undefined): string[] {
  if (!categoria) return [];
  return categoria
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function toCandidates(items: GaleriaItem[], defaultAlt: string): SobreCardImage[] {
  return items
    .map((item) => {
      const url = sanitizeImageUrl(item.url);
      if (!url) return null;
      return {
        url,
        alt: item.alt?.trim() || defaultAlt,
      };
    })
    .filter((item): item is SobreCardImage => Boolean(item));
}

export default async function SobrePage() {
  const [galeria, sobreCanyonImagem] = await Promise.all([
    getGaleria(),
    getConteudoValor('sobre_canyon_imagem'),
  ]);

  const sortedGaleria = [...galeria]
    .sort((a, b) => a.ordem - b.ordem);

  const orderedGaleria = sortedGaleria
    .filter((item) => {
      const categories = getCategories(item.categoria);
      if (categories.length === 0) return true;
      return categories.some((category) => PUBLIC_GALERIA_CATEGORIES.has(category));
    })
    .sort((a, b) => a.ordem - b.ordem);

  const momentosItems = orderedGaleria.filter((item) => {
    const categories = getCategories(item.categoria);
    if (categories.length === 0) return true;
    return categories.includes('momentos');
  });
  const pousadaItems = orderedGaleria.filter((item) => hasCategory(item.categoria, 'pousada'));
  const areaItems = orderedGaleria.filter((item) => hasCategory(item.categoria, 'area_lazer'));
  const quartoItems = orderedGaleria.filter((item) => hasCategory(item.categoria, 'quartos'));
  const destaqueItems = orderedGaleria.filter((item) => item.destaque);
  const canyonCategoryItems = sortedGaleria.filter((item) =>
    hasCategory(item.categoria, 'sobre_canyon')
  );
  const canyonKeywordItems = orderedGaleria.filter((item) =>
    /canyon|xingo/i.test(`${item.alt ?? ''} ${item.url ?? ''}`)
  );
  const piscinaItems = [...areaItems, ...momentosItems]
    .filter((item) => /piscina/i.test(item.alt ?? '') || /piscina/i.test(item.url));

  const pousadaCandidates = toCandidates([...pousadaItems, ...momentosItems], 'Pousada');
  const areaCandidates = toCandidates([...areaItems, ...momentosItems], 'Área de lazer');
  const piscinaCandidates = toCandidates(piscinaItems, 'Piscina');
  const quartoCandidates = toCandidates([...quartoItems, ...momentosItems], 'Quarto');
  const destaqueCandidates = toCandidates(destaqueItems, 'Foto em destaque');

  const homeSobreCandidates: SobreCardImage[] = [];
  const canyonCandidates = toCandidates(
    [...canyonCategoryItems, ...canyonKeywordItems, ...destaqueItems],
    CANYON_CARD_FALLBACK.alt
  );

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

  const canyonCard: SobreCardImage = {
    ...(canyonCandidates[0] ?? {
      url: sanitizeImageUrl(sobreCanyonImagem) ?? CANYON_CARD_FALLBACK.url,
      alt: CANYON_CARD_FALLBACK.alt,
    }),
  };

  return <SobreClient sobreCards={sobreCards} canyonCard={canyonCard} />;
}
