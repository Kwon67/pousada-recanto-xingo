import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getMetadataBase, getSiteUrl } from "@/lib/site-url";
import { FB_PIXEL_ID } from "@/lib/pixel";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const SITE_URL = getSiteUrl();
const METADATA_BASE = getMetadataBase();

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    default: "Pousada Recanto do Matuto Xingó | Piranhas, Alagoas",
    template: "%s | Pousada Recanto do Matuto Xingó",
  },
  description:
    "Seu refúgio às margens do Canyon do Xingó. Pousada aconchegante em Piranhas, Alagoas, com 10 quartos, piscina, área de lazer e hospitalidade nordestina.",
  keywords: [
    "pousada",
    "Xingó",
    "Canyon do Xingó",
    "Piranhas",
    "Alagoas",
    "hospedagem",
    "turismo",
    "Rio São Francisco",
    "sertão",
    "nordeste",
  ],
  authors: [{ name: "Kivora Inc." }],
  creator: "Kivora Inc.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Pousada Recanto do Matuto Xingó",
    title: "Pousada Recanto do Matuto Xingó | Piranhas, Alagoas",
    description:
      "Seu refúgio às margens do Canyon do Xingó. Pousada aconchegante em Piranhas, Alagoas, com 10 quartos, piscina, área de lazer e hospitalidade nordestina.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pousada Recanto do Matuto Xingó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pousada Recanto do Matuto Xingó | Piranhas, Alagoas",
    description:
      "Seu refúgio às margens do Canyon do Xingó. Pousada aconchegante em Piranhas, Alagoas.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1B3A4B',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased bg-cream overflow-x-hidden`}
      >
        {/* Meta Pixel */}
        {FB_PIXEL_ID && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <div className="relative overflow-x-hidden w-full">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
