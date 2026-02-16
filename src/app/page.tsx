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
import { getConteudo } from '@/lib/actions/conteudo';
import type { Avaliacao } from '@/types/avaliacao';

export const dynamic = 'force-dynamic';

const LEGACY_IMAGE_KEYS: Record<string, string> = {
  '1': 'home_estrutura_piscina_imagem',
  '2': 'home_estrutura_area_redes_imagem',
  '3': 'home_estrutura_churrasqueira_imagem',
  '4': 'home_estrutura_chuveirao_imagem',
  '5': 'home_estrutura_espaco_amplo_imagem',
  '6': 'home_estrutura_banheiro_privativo_imagem',
};

function parseMedia(raw: string): MediaItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MediaItem[];
  } catch { /* ignore */ }
  return [];
}

export default async function HomePage() {
  const [avaliacoesRaw, galeriaRaw, conteudoMap] = await Promise.all([
    getAvaliacoes({ aprovada: true }),
    getGaleria(),
    getConteudo(),
  ]);

  const avaliacoes = (avaliacoesRaw as Avaliacao[])
    .filter((item) => item.aprovada)
    .slice(0, 10);

  const galeria = galeriaRaw.map((item) => ({
    id: item.id,
    url: item.url,
    alt: item.alt || 'Foto da pousada',
  }));

  const estruturaMediaOverrides: Record<string, MediaItem[]> = {};
  for (const id of ['1', '2', '3', '4', '5', '6']) {
    const mediaKey = `home_estrutura_${id}_media`;
    const mediaRaw = conteudoMap[mediaKey]?.valor ?? '[]';
    const media = parseMedia(mediaRaw);

    if (media.length > 0) {
      estruturaMediaOverrides[id] = media;
    } else {
      const legacyKey = LEGACY_IMAGE_KEYS[id];
      const legacyUrl = conteudoMap[legacyKey]?.valor?.trim();
      if (legacyUrl) {
        estruturaMediaOverrides[id] = [{ url: legacyUrl, type: 'image' }];
      }
    }
  }

  return (
    <>
      <Hero />
      <BuscaRapida />
      <QuartosDestaque />
      <Estrutura mediaOverrides={estruturaMediaOverrides} />
      <Experiencias />
      <SobrePreview />
      <Galeria images={galeria} />
      <Depoimentos avaliacoes={avaliacoes} />
      <Localizacao />
      <CTAReserva />
    </>
  );
}
