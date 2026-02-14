import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

export const metadata: Metadata = {
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
    url: "https://recantodomatutoxingo.com.br",
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
        <Script id="scroll-reset-on-reload" strategy="beforeInteractive">
          {`
            if ('scrollRestoration' in window.history) {
              window.history.scrollRestoration = 'manual';
            }
            const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            resetScroll();
            window.addEventListener('load', resetScroll, { once: true });
            window.addEventListener('pageshow', resetScroll);
          `}
        </Script>
        <div className="overflow-x-hidden w-full">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
