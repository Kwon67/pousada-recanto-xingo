'use client';

import { motion } from 'framer-motion';
import { estruturaMock } from '@/data/mock';

type IconProps = {
  className?: string;
};

function PoolIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <rect x="8" y="8" width="48" height="48" rx="14" stroke="currentColor" strokeWidth="2.4" opacity="0.3" />
      <path
        d="M23 18v23"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M23 18h11c5.5 0 10 4.5 10 10s-4.5 10-10 10H23"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 45c3 0 3-1.6 6-1.6s3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M14 50c3 0 3-1.6 6-1.6s3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="49" cy="15" r="3" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function HammockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M14 16v30m36-30v30" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 30c5 10 19 10 24 0" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 30c6 4 18 4 24 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M10 48h44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M17 12l3 4m27-4l-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function GrillIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M18 27h28l-3 11H21l-3-11Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M22 22h20m-18 4h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M27 38l-4 12m14-12 4 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 14c2 3 1 5-1 7 3-1 6 2 5 5-2 2-6 2-8-1-2-3 0-7 4-11Z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function ShowerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M20 14v11h12c5 0 9 4 9 9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M41 34h8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M38 39c0 2-2 3-2 5m8-5c0 2-2 3-2 5m8-5c0 2-2 3-2 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 50h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      <circle cx="20" cy="14" r="3" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function SpaceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M22 22h20v20H22z" stroke="currentColor" strokeWidth="2.4" />
      <path d="M14 22h6m-6 0 3-3m-3 3 3 3m36-3h-6m6 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 42h6m-6 0 3-3m-3 3 3 3m36-3h-6m6 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 22v20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function PrivateBathIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M14 34h36v6a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8v-6Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 34V29a5 5 0 0 1 5-5h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 22h8a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M46 18v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
      <path d="M26 41h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
      <circle cx="51" cy="16" r="5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  Waves: <PoolIcon className="h-8 w-8" />,
  Armchair: <HammockIcon className="h-8 w-8" />,
  Flame: <GrillIcon className="h-8 w-8" />,
  Droplets: <ShowerIcon className="h-8 w-8" />,
  Maximize2: <SpaceIcon className="h-8 w-8" />,
  Bath: <PrivateBathIcon className="h-8 w-8" />,
};

type EstruturaProps = {
  imageOverrides?: Record<string, string>;
};

export default function Estrutura({ imageOverrides }: EstruturaProps) {
  const estruturaItems = estruturaMock.map((item) => {
    const imagemOverride = imageOverrides?.[item.id]?.trim();
    return {
      ...item,
      imagem: imagemOverride || item.imagem,
    };
  });

  return (
    <section className="relative overflow-hidden bg-dark py-20">
      {/* Background Pattern — organic dots */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>
      {/* Gradient glow accents */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
            Tudo que você precisa para <span className="text-secondary">relaxar</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Nossa pousada oferece uma estrutura completa para que você aproveite cada momento da
            sua estadia com conforto e tranquilidade.
          </p>
        </motion.div>

        {/* Estrutura Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {estruturaItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-secondary/55">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imagem}
                    alt={item.titulo}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/25 to-transparent" />

                  {/* Icon */}
                  <div className="absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-linear-to-br from-secondary to-secondary-dark text-dark shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                    <div className="absolute inset-[3px] rounded-xl border border-dark/15" />
                    <div className="relative transition-transform duration-300 group-hover:scale-110">
                      {iconMap[item.icone]}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 font-display text-xl font-semibold text-white transition-colors group-hover:text-secondary">
                    {item.titulo}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">{item.descricao}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
