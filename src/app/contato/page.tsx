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
  Plane,
  Car,
  Bus,
  CheckCircle,
} from 'lucide-react';
import { SITE_CONFIG, ASSUNTOS_CONTATO } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

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
          <p className="text-primary font-medium mb-2">Fale Conosco</p>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Entre em Contato
          </h1>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
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
            <div className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-dark mb-2">
                    Mensagem enviada!
                  </h3>
                  <p className="text-text-light mb-6">
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
            <div className="bg-dark rounded-2xl p-8 text-white">
              <h3 className="font-display text-xl font-semibold mb-6">
                Informações de Contato
              </h3>

              <div className="space-y-5">
                <a
                  href={`https://maps.google.com/?q=Piranhas,Alagoas`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className="text-white/70 text-sm">{SITE_CONFIG.address}</p>
                  </div>
                </a>

                <a
                  href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Telefone / WhatsApp</p>
                    <p className="text-white/70 text-sm">{SITE_CONFIG.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-start gap-4 hover:text-secondary transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-white/70 text-sm">{SITE_CONFIG.email}</p>
                  </div>
                </a>

                <a
                  href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-secondary transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-white/70 text-sm">{SITE_CONFIG.instagram}</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Horários</p>
                    <p className="text-white/70 text-sm">
                      Check-in: a partir das {SITE_CONFIG.checkIn}
                    </p>
                    <p className="text-white/70 text-sm">
                      Check-out: até às {SITE_CONFIG.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to get there */}
            <div className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-6">
              <h3 className="font-display text-lg font-semibold text-dark mb-4">
                Como chegar
              </h3>
              <div className="space-y-4">
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
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-dark text-sm">{item.title}</p>
                      <p className="text-text-light text-xs">{item.desc}</p>
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
          className="rounded-2xl overflow-hidden shadow-lg h-[400px]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31259.68037387799!2d-37.76975!3d-9.6285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7093f47f1c3a4cd%3A0x6fab1d7f45ef3a0!2sPiranhas%2C%20AL!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da Pousada"
          />
        </motion.div>
      </div>
    </div>
  );
}
