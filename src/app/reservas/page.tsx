'use client';

import { useEffect, useRef, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useReserva } from '@/hooks/useReserva';
import { useQuartos } from '@/hooks/useQuartos';
import { useDisponibilidade, useQuartosDisponiveis } from '@/hooks/useDisponibilidade';
import { formatDateLong, formatNights } from '@/lib/formatters';
import { calcularNoites } from '@/lib/utils';
import StepIndicator from '@/components/reservas/StepIndicator';
import CalendarioReserva from '@/components/reservas/CalendarioReserva';
import SeletorQuarto from '@/components/reservas/SeletorQuarto';
import FormHospede from '@/components/reservas/FormHospede';
import ResumoReserva from '@/components/reservas/ResumoReserva';
import StripeCheckout from '@/components/checkout/StripeCheckout';
import Button from '@/components/ui/app-button';
import { User, Users } from 'lucide-react';
import * as fbq from '@/lib/pixel';

const STEPS = ['Datas', 'Quarto', 'Dados', 'Confirmação', 'Pagamento'];

function ReservasContent() {
  const searchParams = useSearchParams();
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const {
    step,
    checkIn,
    checkOut,
    quarto,
    numHospedes,
    hospede,
    observacoes,
    noites,
    valorTotal,
    loading,
    error,
    setStep,
    nextStep,
    prevStep,
    setDatas,
    setQuarto,
    setNumHospedes,
    setHospede,
    setObservacoes,
    confirmarReserva,
  } = useReserva();

  const { allQuartos } = useQuartos();
  const { datasOcupadas } = useDisponibilidade();
  const { quartosDisponiveis } = useQuartosDisponiveis(checkIn, checkOut);

  // Filter available quartos
  const quartosDisponivelList = allQuartos.filter((q) =>
    quartosDisponiveis.includes(q.id)
  );

  // Initialize from URL params
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const quartoParam = searchParams.get('quarto');

    if (checkInParam && checkOutParam) {
      setDatas(new Date(checkInParam), new Date(checkOutParam));
    }
    if (guestsParam) {
      setNumHospedes(parseInt(guestsParam));
    }
    if (quartoParam && allQuartos.length > 0) {
      const foundQuarto = allQuartos.find((q) => q.id === quartoParam);
      if (foundQuarto) {
        setQuarto(foundQuarto);
        if (checkInParam && checkOutParam) {
          setStep(2);
        }
      }
    }
  }, [searchParams, allQuartos, setDatas, setNumHospedes, setQuarto, setStep]);

  // Handle smooth scroll on step change
  useEffect(() => {
    if (stepContainerRef.current) {
      const yOffset = -100; // Account for fixed header
      const element = stepContainerRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [step]);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleConfirm = async () => {
    const result = await confirmarReserva();
    if (result && result.clientSecret) {
      // Meta Pixel: Lead — reserva criada, checkout Stripe iniciado
      if (quarto) {
        fbq.event('Lead', {
          value: valorTotal,
          currency: 'BRL',
          content_name: quarto.nome,
          content_category: quarto.categoria,
        });
      }
      setClientSecret(result.clientSecret);
      setStep(5);
    }
  };

  const disabledDates = datasOcupadas.map((d) => new Date(d));

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 drop-shadow-sm">
            Fazer Reserva
          </h1>
          <p className="text-dark/60 text-sm font-bold uppercase tracking-widest max-w-2xl mx-auto">
            Siga os passos abaixo para garantir sua estada
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} steps={STEPS} />

        {/* Step Content */}
        <div ref={stepContainerRef} className="max-w-4xl mx-auto scroll-mt-24">
          {/* Step 1: Dates */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-2xl font-black uppercase tracking-widest text-dark mb-8 text-center">
                Selecione as datas
              </h2>

              <CalendarioReserva
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectDates={setDatas}
                disabledDates={disabledDates}
              />

              {checkIn && checkOut && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-white rounded-none border border-dark/10 space-y-6"
                >
                  <div>
                    <p className="text-text-light text-sm">Período selecionado</p>
                    <p className="font-semibold text-dark">
                      {formatDateLong(checkIn)} - {formatDateLong(checkOut)}
                    </p>
                    <p className="text-primary font-medium">
                      {formatNights(calcularNoites(checkIn, checkOut))}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-text mb-3">Quantidade de hóspedes</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 1, label: '1 hóspede', icon: <User className="w-5 h-5" /> },
                        { value: 2, label: '2 hóspedes', icon: <Users className="w-5 h-5" /> },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNumHospedes(opt.value)}
                          className={`flex items-center gap-3 p-4 rounded-none border transition-all duration-200 ${
                            numHospedes === opt.value
                              ? 'border-dark bg-dark text-white shadow-none'
                              : 'border-dark/10 bg-white text-dark/70 hover:border-dark/30 hover:bg-cream'
                          }`}
                        >
                          <div className={`p-2 rounded-none border ${
                            numHospedes === opt.value ? 'bg-white/10 border-white/20 text-white' : 'bg-cream border-dark/5 text-dark'
                          }`}>
                            {opt.icon}
                          </div>
                          <span className="font-medium text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={nextStep} className="w-full rounded-none tracking-widest uppercase font-bold text-sm bg-dark text-white hover:bg-white hover:text-dark border-2 border-dark transition-colors">
                    Continuar
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Room Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark/10">
                <h2 className="font-display text-2xl font-black uppercase tracking-widest text-dark">
                  Escolha seu quarto
                </h2>
                <p className="text-dark/60 font-bold text-xs uppercase tracking-widest">
                  {quartosDisponivelList.length} quartos
                </p>
              </div>

              <SeletorQuarto
                quartos={quartosDisponivelList}
                selectedId={quarto?.id || null}
                onSelect={setQuarto}
                onContinue={nextStep}
              />

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={prevStep} className="flex-1 rounded-none border-2 border-dark/20 uppercase tracking-widest text-xs font-bold text-dark hover:bg-dark hover:text-white transition-colors">
                  Voltar
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!quarto}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold border-2 border-dark bg-dark text-white hover:bg-white hover:text-dark transition-colors"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Guest Info */}
          {step === 3 && (
            <FormHospede
              initialData={hospede || undefined}
              observacoes={observacoes}
              onSubmit={(data, obs) => {
                setHospede(data);
                setObservacoes(obs);
                // Meta Pixel: InitiateCheckout — dados do hóspede preenchidos
                if (quarto) {
                  fbq.event('InitiateCheckout', {
                    value: valorTotal,
                    currency: 'BRL',
                    content_ids: [quarto.id],
                    content_type: 'product',
                    num_items: 1,
                  });
                }
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && checkIn && checkOut && quarto && hospede && (
            <div className="space-y-4">
              <ResumoReserva
                quarto={quarto}
                checkIn={checkIn}
                checkOut={checkOut}
                numHospedes={numHospedes}
                hospede={hospede}
                observacoes={observacoes}
                valorTotal={valorTotal}
                noites={noites}
                onConfirm={handleConfirm}
                onBack={prevStep}
                isLoading={loading}
              />
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 text-error text-center text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Pagamento Stripe */}
          {step === 5 && clientSecret && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl font-black uppercase tracking-widest text-dark mb-4 text-center">
                Pagamento do Sinal (50%)
              </h2>
              <p className="text-center text-dark/70 uppercase tracking-widest text-xs font-bold mb-8">
                Pague com segurança para garantir sua reserva
              </p>
              <StripeCheckout clientSecret={clientSecret} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservasPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-20 bg-cream min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-light">Carregando...</div>
      </div>
    }>
      <ReservasContent />
    </Suspense>
  );
}
