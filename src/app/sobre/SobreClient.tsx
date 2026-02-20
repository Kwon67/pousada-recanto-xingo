'use client';

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

export type SobreCardImage = {
  url: string;
  alt: string;
};

export default function SobreClient({
  sobreCards
}: {
  sobreCards: Record<'pousada' | 'area' | 'piscina' | 'quarto', SobreCardImage>
}) {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${sobreCards.pousada.url})`,
          }}
        />
        <div className="absolute inset-0 bg-dark/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-sm">
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
              <div className="inline-flex items-center gap-2 text-dark/60 font-bold uppercase tracking-widest text-[10px] mb-2">
                <Building2 className="w-4 h-4" />
                <span>Sobre Nós</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-dark leading-tight">
                Uma pousada construída com{' '}
                <span className="text-primary italic font-black">amor e dedicação</span>
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
                    className="w-full rounded-none border border-dark/10 shadow-none filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                  />
                  <img
                    src={sobreCards.area.url}
                    alt={sobreCards.area.alt}
                    className="w-full rounded-none border border-dark/10 shadow-none filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src={sobreCards.piscina.url}
                    alt={sobreCards.piscina.alt}
                    className="w-full rounded-none border border-dark/10 shadow-none filter grayscale-[20%] hover:grayscale-0 transition-all duration-500 pt-4"
                  />
                  <img
                    src={sobreCards.quarto.url}
                    alt={sobreCards.quarto.alt}
                    className="w-full rounded-none border border-dark/10 shadow-none filter grayscale-[20%] hover:grayscale-0 transition-all duration-500 pt-2"
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
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 drop-shadow-sm">
              Por que escolher o <span className="text-primary italic">Recanto</span>?
            </h2>
            <p className="text-dark/60 font-bold uppercase tracking-widest text-[10px] mx-auto">
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
                className="bg-cream rounded-none border border-dark/10 p-6 hover:border-dark hover:bg-white transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-transparent border-2 border-primary/20 flex items-center justify-center text-primary mb-6">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-widest text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-text-light text-sm leading-relaxed font-medium">{item.desc}</p>
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
                className="w-full rounded-none border border-white/10 shadow-none filter grayscale-[20%] hover:grayscale-0 transition-duration-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
                Sobre a <span className="text-secondary italic">Região</span>
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

              <div className="flex items-center gap-6 pt-6 mt-6 border-t border-white/10">
                <div className="text-center">
                  <p className="font-display text-4xl font-black tracking-tighter text-secondary">50m</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">Paredões do Canyon</p>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="text-center">
                  <p className="font-display text-4xl font-black tracking-tighter text-secondary">2.7k</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">Km Rio S. Fco</p>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="text-center">
                  <p className="font-display text-4xl font-black tracking-tighter text-secondary">+300</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">Anos de história</p>
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
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 drop-shadow-sm">
              Venha nos visitar
            </h2>
            <p className="text-dark/60 font-bold uppercase tracking-widest text-[10px] mb-8 pb-4 border-b border-dark/10">
              Estamos esperando você de braços abertos. Reserve agora e viva essa
              experiência única no sertão alagoano.
            </p>
            <Link href="/reservas">
              <Button size="lg" className="w-full sm:w-auto">Reservar Agora</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
