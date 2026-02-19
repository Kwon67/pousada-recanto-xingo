import Hero from '@/components/home/Hero';
import BuscaRapida from '@/components/home/BuscaRapida';
import QuartosDestaque from '@/components/home/QuartosDestaque';
import Estrutura, { type MediaItem } from '@/components/home/Estrutura';
import Experiencias from '@/components/home/Experiencias';
import SobrePreview from '@/components/home/SobrePreview';
import Galeria from '@/components/home/Galeria';
import Depoimentos from '@/components/home/Depoimentos';
import Localizacao from '@/components/home/Localizacao';
import CTAReserva from '@/components/home/CTAReserva';
import { getAvaliacoes } from '@/lib/actions/avaliacoes';
import { getGaleria } from '@/lib/actions/galeria';
import type { Avaliacao } from '@/types/avaliacao';

import { Metadata } from 'next';
import { getConteudoValor } from '@/lib/actions/conteudo';
import { getMetadataBase } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const titulo = await getConteudoValor('hero_titulo');
  const subtitulo = await getConteudoValor('hero_subtitulo');

  const title = titulo ? `${titulo} | Pousada Recanto do Matuto` : 'Pousada Recanto do Matuto';
  const description = subtitulo || 'Sua pousada no sertão alagoano.';

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

function isLikelyVideoUrl(url: string): boolean {
  return /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const MOMENTOS_CATEGORIES = new Set(['momentos', 'pousada', 'quartos', 'area_lazer', 'cafe']);

function isMomentosCategory(categoria: string | null | undefined): boolean {
  if (!categoria) return true;
  const cats = categoria.split(',').map(c => c.trim());
  return cats.some(c => MOMENTOS_CATEGORIES.has(c));
}

export default async function HomePage() {
  const [avaliacoesRaw, galeriaRaw, homeSobreImagemPadrao] = await Promise.all([
    getAvaliacoes({ aprovada: true }),
    getGaleria(),
    getConteudoValor('home_sobre_imagem'),
  ]);

  const avaliacoes = (avaliacoesRaw as Avaliacao[])
    .filter((item) => item.aprovada)
    .slice(0, 10);

  const galeria = galeriaRaw
    .filter((item) => isMomentosCategory(item.categoria))
    .map((item) => ({
      id: item.id,
      url: item.url,
      alt: item.alt || 'Foto da pousada',
      type: isLikelyVideoUrl(item.url) ? 'video' as const : 'image' as const,
    }));

  const estruturaMediaOverrides: Record<string, MediaItem[]> = {};
  for (const id of ['1', '2', '3', '4', '5', '6']) {
    const targetCategory = `home_structure_${id}`;
    const mediaFromGaleria = galeriaRaw
      .filter((item) => {
        const cats = (item.categoria || '').split(',').map(c => c.trim());
        return cats.includes(`home_estrutura_${id}`) || cats.includes(targetCategory);
      })
      .map((item) => ({
        url: item.url.trim(),
        type: isLikelyVideoUrl(item.url) ? 'video' as const : 'image' as const,
      }))
      .filter((item) => item.url.length > 0);

    if (mediaFromGaleria.length > 0) {
      estruturaMediaOverrides[id] = mediaFromGaleria;
    }
  }

  const homeSobreMediaFromGaleriaArea: MediaItem[] = galeriaRaw
    .filter((item) => {
      const cats = (item.categoria || '').split(',').map(c => c.trim());
      return cats.includes('home_sobre');
    })
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({ url: item.url, type: isLikelyVideoUrl(item.url) ? 'video' as const : 'image' as const }))
    .filter((item) => item.url?.trim())
    .map((item) => ({ ...item, url: item.url.trim() }))
    .slice(0, 7);

  const homeSobreMediaFromDestaque: MediaItem[] = galeriaRaw
    .filter((item) => item.destaque)
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({ url: item.url, type: isLikelyVideoUrl(item.url) ? 'video' as const : 'image' as const }))
    .filter((item) => item.url?.trim())
    .map((item) => ({ ...item, url: item.url.trim() }))
    .slice(0, 7);

  const homeSobreMedia = (
    homeSobreMediaFromDestaque.length > 0
      ? homeSobreMediaFromDestaque
      : homeSobreMediaFromGaleriaArea
  ).slice(0, 7);
  const homeSobreImage = homeSobreMedia.find((item) => item.type === 'image')?.url;
  
  // Buscar imagem de fundo do Hero da galeria (suporta tags múltiplas)
  const heroBackgroundItem = galeriaRaw.find((item) => {
    const cats = (item.categoria || '').split(',').map(c => c.trim());
    return cats.includes('hero_background');
  });
  const heroBackgroundImage = heroBackgroundItem?.url?.trim() || homeSobreImage?.trim() || homeSobreImagemPadrao?.trim();

  const heroLogoItem = galeriaRaw.find((item) => {
    const cats = (item.categoria || '').split(',').map(c => c.trim());
    return cats.includes('hero_logo');
  });
  const heroLogoUrl = heroLogoItem?.url || 'https://res.cloudinary.com/diuh0ditl/image/upload/v1771538229/recantodomatuto_keg3sl.png';

  return (
    <>
      <Hero backgroundImageUrl={heroBackgroundImage} logoUrl={heroLogoUrl} />
      <BuscaRapida />
      <QuartosDestaque />
      <Estrutura mediaOverrides={estruturaMediaOverrides} />
      <Experiencias />
      <SobrePreview imageUrl={homeSobreImage} media={homeSobreMedia} />
      <Galeria images={galeria} />
      <Depoimentos avaliacoes={avaliacoes} />
      <Localizacao />
      <CTAReserva />
    </>
  );
}
