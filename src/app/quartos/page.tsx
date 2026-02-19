import { Metadata } from 'next';
import { getQuartos } from '@/lib/actions/quartos';
import { getConfiguracoesPublic } from '@/lib/actions/configuracoes';
import { getMetadataBase, getSiteUrl } from '@/lib/site-url';
import QuartosClient from './QuartosClient';

const SITE_URL = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const [quartos, config] = await Promise.all([
    getQuartos(),
    getConfiguracoesPublic(),
  ]);

  const ativos = quartos.filter((q) => q.ativo);
  const cidade = config.endereco || 'Piranhas, Alagoas';
  const precoMin = ativos.length > 0 ? Math.min(...ativos.map((q) => q.preco_diaria)) : 180;
  const title = `Quartos e Suítes – Pousada em ${cidade} | Recanto do Matuto`;
  const description = `Conheça os ${ativos.length} quartos da Pousada Recanto do Matuto em ${cidade}. Standard, Superior e Suítes a partir de R$ ${precoMin}/noite. Todos com banheiro privativo, ar-condicionado e Wi-Fi.`;
  const url = `${SITE_URL}/quartos`;
  const imagens = ativos.filter((q) => q.imagem_principal).slice(0, 4).map((q) => ({
    url: q.imagem_principal,
    width: 800,
    height: 600,
    alt: q.nome,
  }));

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    keywords: [
      `pousada em ${cidade}`,
      'pousada Piranhas Alagoas',
      'hospedagem Canyon do Xingó',
      'quartos pousada sertão',
      'suítes Piranhas AL',
      'acomodações Xingó',
      'hotel em Piranhas',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: config.nome_pousada || 'Pousada Recanto do Matuto Xingó',
      images: imagens,
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imagens.map((i) => i.url),
    },
  };
}

export default async function QuartosPage() {
  const [quartos, config] = await Promise.all([
    getQuartos(),
    getConfiguracoesPublic(),
  ]);

  const ativos = quartos.filter((q) => q.ativo);
  const precoMin = ativos.length > 0 ? Math.min(...ativos.map((q) => q.preco_diaria)) : 180;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: config.nome_pousada || 'Pousada Recanto do Matuto Xingó',
    description: config.descricao || 'Pousada aconchegante em Piranhas, Alagoas.',
    url: SITE_URL,
    telephone: config.telefone,
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Piranhas',
      addressRegion: 'AL',
      addressCountry: 'BR',
      streetAddress: config.endereco || 'Piranhas, Alagoas',
    },
    geo: config.latitude && config.longitude
      ? {
          '@type': 'GeoCoordinates',
          latitude: config.latitude,
          longitude: config.longitude,
        }
      : undefined,
    checkinTime: config.horario_checkin || '14:00',
    checkoutTime: config.horario_checkout || '12:00',
    numberOfRooms: ativos.length,
    priceRange: `R$ ${precoMin}+`,
    makesOffer: ativos.map((q) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'HotelRoom',
        name: q.nome,
        description: q.descricao_curta || q.descricao,
        image: q.imagem_principal || undefined,
        url: `${SITE_URL}/quartos/${q.slug}`,
        occupancy: {
          '@type': 'QuantitativeValue',
          value: q.capacidade,
          unitText: 'pessoa(s)',
        },
        amenityFeature: q.amenidades.map((a) => ({
          '@type': 'LocationFeatureSpecification',
          name: a,
          value: true,
        })),
      },
      priceCurrency: 'BRL',
      price: q.preco_diaria,
      unitCode: 'DAY',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/reservas`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <QuartosClient />
    </>
  );
}
