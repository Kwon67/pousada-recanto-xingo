import Hero from '@/components/home/Hero';
import BuscaRapida from '@/components/home/BuscaRapida';
import QuartosDestaque from '@/components/home/QuartosDestaque';
import Estrutura from '@/components/home/Estrutura';
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

  const estruturaImageOverrides = {
    '1': conteudoMap.home_estrutura_piscina_imagem?.valor ?? '',
    '2': conteudoMap.home_estrutura_area_redes_imagem?.valor ?? '',
    '3': conteudoMap.home_estrutura_churrasqueira_imagem?.valor ?? '',
    '4': conteudoMap.home_estrutura_chuveirao_imagem?.valor ?? '',
    '5': conteudoMap.home_estrutura_espaco_amplo_imagem?.valor ?? '',
    '6': conteudoMap.home_estrutura_banheiro_privativo_imagem?.valor ?? '',
  };

  return (
    <>
      <Hero />
      <BuscaRapida />
      <QuartosDestaque />
      <Estrutura imageOverrides={estruturaImageOverrides} />
      <Experiencias />
      <SobrePreview />
      <Galeria images={galeria} />
      <Depoimentos avaliacoes={avaliacoes} />
      <Localizacao />
      <CTAReserva />
    </>
  );
}
