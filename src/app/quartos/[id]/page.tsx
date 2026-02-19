import { Metadata } from 'next';
import { getQuartoBySlug } from '@/lib/actions/quartos';
import { getConfiguracoesPublic } from '@/lib/actions/configuracoes';
import { getMetadataBase, getSiteUrl } from '@/lib/site-url';
import QuartoClient from './QuartoClient';

interface QuartoPageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = getSiteUrl();

export async function generateMetadata({ params }: QuartoPageProps): Promise<Metadata> {
  const { id } = await params;
  const [quarto, config] = await Promise.all([
    getQuartoBySlug(id),
    getConfiguracoesPublic(),
  ]);

  if (!quarto) {
    return {
      metadataBase: getMetadataBase(),
      title: 'Quarto não encontrado | Pousada Recanto do Matuto',
      description: 'O quarto que você procura não foi encontrado.',
    };
  }

  const cidade = config.endereco || 'Piranhas, Alagoas';
  const categoriaLabel = { standard: 'Standard', superior: 'Superior', suite: 'Suíte' }[quarto.categoria] || quarto.categoria;
  const title = `${quarto.nome} – ${categoriaLabel} | Pousada em ${cidade}`;
  const description = `${quarto.descricao_curta || quarto.descricao}. A partir de R$ ${quarto.preco_diaria}/noite para ${quarto.capacidade} pessoa(s). Reserve na Pousada Recanto do Matuto em ${cidade}.`;
  const url = `${SITE_URL}/quartos/${quarto.slug}`;
  const images = quarto.imagem_principal
    ? [{ url: quarto.imagem_principal, width: 800, height: 600, alt: quarto.nome }]
    : [];

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    keywords: [
      quarto.nome,
      `pousada em ${cidade}`,
      'pousada Piranhas Alagoas',
      'hospedagem Canyon do Xingó',
      'quarto pousada sertão',
      `quarto ${categoriaLabel.toLowerCase()}`,
      ...quarto.amenidades.slice(0, 5),
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: config.nome_pousada || 'Pousada Recanto do Matuto Xingó',
      images,
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: quarto.imagem_principal ? [quarto.imagem_principal] : [],
    },
  };
}

export default async function QuartoPage({ params }: QuartoPageProps) {
  const { id } = await params;
  const [quarto, config] = await Promise.all([
    getQuartoBySlug(id),
    getConfiguracoesPublic(),
  ]);

  const jsonLd = quarto
    ? {
        '@context': 'https://schema.org',
        '@type': 'HotelRoom',
        name: quarto.nome,
        description: quarto.descricao || quarto.descricao_curta,
        image: quarto.imagem_principal || undefined,
        url: `${SITE_URL}/quartos/${quarto.slug}`,
        numberOfRooms: 1,
        bed: {
          '@type': 'BedDetails',
          numberOfBeds: 1,
          typeOfBed: quarto.categoria === 'suite' ? 'King' : 'Queen',
        },
        occupancy: {
          '@type': 'QuantitativeValue',
          value: quarto.capacidade,
          unitText: 'pessoa(s)',
        },
        floorSize: {
          '@type': 'QuantitativeValue',
          value: quarto.tamanho_m2,
          unitCode: 'MTK',
        },
        amenityFeature: quarto.amenidades.map((a) => ({
          '@type': 'LocationFeatureSpecification',
          name: a,
          value: true,
        })),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BRL',
          price: quarto.preco_diaria,
          unitCode: 'DAY',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2026-12-31',
          url: `${SITE_URL}/reservas`,
        },
        containedInPlace: {
          '@type': 'LodgingBusiness',
          name: config.nome_pousada || 'Pousada Recanto do Matuto Xingó',
          description: config.descricao || undefined,
          telephone: config.telefone,
          email: config.email,
          url: SITE_URL,
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
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <QuartoClient id={id} />
    </>
  );
}
