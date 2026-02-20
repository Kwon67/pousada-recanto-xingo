'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Clock,
  ExternalLink,
  Plane,
  Car,
  Bus,
  CheckCircle,
} from 'lucide-react';
import { SITE_CONFIG, ASSUNTOS_CONTATO } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/app-button';

const contatoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  assunto: z.string().min(1, 'Selecione um assunto'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContatoForm = z.infer<typeof contatoSchema>;

export default function ContatoPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContatoForm>({
    resolver: zodResolver(contatoSchema),
  });

  const onSubmit = async (data: ContatoForm) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(data);
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
  };

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
         >
           <p className="text-dark/60 font-bold uppercase tracking-widest text-[10px] mb-2">Fale Conosco</p>
           <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-dark mb-4 drop-shadow-sm">
             Entre em Contato
           </h1>
           <p className="text-text-light text-lg max-w-2xl mx-auto font-medium">
             Estamos aqui para ajudar. Envie sua mensagem ou entre em contato diretamente
             pelo WhatsApp.
           </p>
         </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-none border-2 border-dark/10 shadow-none p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 border-2 border-success/30 rounded-none flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-widest text-dark mb-2">
                    Mensagem enviada!
                  </h3>
                  <p className="text-text-light font-medium mb-6">
                    Obrigado pelo contato. Responderemos em breve.
                  </p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Enviar nova mensagem
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome"
                    error={errors.nome?.message}
                    {...register('nome')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="seu@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      error={errors.telefone?.message}
                      {...register('telefone')}
                    />
                  </div>

                  <Select
                    label="Assunto"
                    placeholder="Selecione um assunto"
                    options={ASSUNTOS_CONTATO}
                    error={errors.assunto?.message}
                    {...register('assunto')}
                  />

                  <Textarea
                    label="Mensagem"
                    placeholder="Escreva sua mensagem..."
                    rows={5}
                    error={errors.mensagem?.message}
                    {...register('mensagem')}
                  />

                  <Button type="submit" fullWidth size="lg" loading={isLoading}>
                    Enviar mensagem
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Info Card */}
            <div className="bg-dark rounded-none p-8 text-white dark-dots">
              <h3 className="font-display text-xl font-black uppercase tracking-widest mb-6">
                Informações de Contato
              </h3>

              <div className="space-y-5">
                <a
                  href={SITE_CONFIG.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary hover:translate-x-1 transition-all"
                >
                  <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/50">Endereço</p>
                    <p className="text-white/90 text-sm font-medium mt-1">{SITE_CONFIG.address}</p>
                  </div>
                </a>

                <a
                  href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary hover:translate-x-1 transition-all"
                >
                  <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/50">Telefone / WhatsApp</p>
                    <p className="text-white/90 text-sm font-medium mt-1">{SITE_CONFIG.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-start gap-4 hover:text-secondary hover:translate-x-1 transition-all"
                >
                  <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/50">Email</p>
                    <p className="text-white/90 text-sm font-medium mt-1">{SITE_CONFIG.email}</p>
                  </div>
                </a>

                <a
                  href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary hover:translate-x-1 transition-all"
                >
                  <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/50">Instagram</p>
                    <p className="text-white/90 text-sm font-medium mt-1">{SITE_CONFIG.instagram}</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/50">Horários</p>
                    <p className="text-white/90 text-sm font-medium mt-1">
                      Check-in: a partir das {SITE_CONFIG.checkIn}
                    </p>
                    <p className="text-white/90 text-sm font-medium">
                      Check-out: até às {SITE_CONFIG.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to get there */}
            <div className="bg-white rounded-none border-2 border-dark/10 shadow-none p-6 mt-6">
              <h3 className="font-display text-lg font-black uppercase tracking-widest text-dark mb-6 border-b border-dark/10 pb-4">
                Como chegar
              </h3>
              <div className="space-y-5">
                {[
                  {
                    icon: <Plane className="w-4 h-4" />,
                    title: 'De avião',
                    desc: 'Aeroporto de Maceió (280km) ou Aracaju (200km)',
                  },
                  {
                    icon: <Car className="w-4 h-4" />,
                    title: 'De carro',
                    desc: 'Via BR-101 e AL-225',
                  },
                  {
                    icon: <Bus className="w-4 h-4" />,
                    title: 'De ônibus',
                    desc: 'Linhas regulares de Maceió e Aracaju',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 border border-primary/20 rounded-none flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-dark text-[10px] uppercase tracking-widest">{item.title}</p>
                      <p className="text-text-light text-xs font-medium mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="relative rounded-none border-2 border-dark/10 overflow-hidden shadow-none h-[400px]"
         >
           <iframe
             src={SITE_CONFIG.mapsEmbedLink}
             className="w-full h-full filter grayscale-[30%] contrast-125"
             style={{ border: 0 }}
             allowFullScreen
             loading="lazy"
             referrerPolicy="no-referrer-when-downgrade"
             title="Localização da Pousada"
           />
           <a
             href={SITE_CONFIG.mapsLink}
             target="_blank"
             rel="noopener noreferrer"
             className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center gap-2 rounded-none bg-dark text-white border-2 border-dark/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest shadow-none hover:bg-white hover:text-dark transition-colors"
             aria-label="Abrir localização no Google Maps"
           >
             <MapPin className="w-4 h-4" />
             <span className="sm:hidden">Abrir Maps</span>
             <span className="hidden sm:inline">Abrir no Google Maps</span>
             <ExternalLink className="w-4 h-4" />
           </a>
         </motion.div>
      </div>
    </div>
  );
}
