'use client';

import { useEffect, Suspense } from 'react';
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
import Button from '@/components/ui/Button';
import { User, Users } from 'lucide-react';

const STEPS = ['Datas', 'Quarto', 'Dados', 'Confirmação'];

function ReservasContent() {
  const searchParams = useSearchParams();

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

  const handleConfirm = async () => {
    const result = await confirmarReserva();
    if (result) {
      window.location.href = result.checkoutUrl;
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
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
            Fazer Reserva
          </h1>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Siga os passos abaixo para reservar seu quarto no Recanto do Matuto
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} steps={STEPS} />

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Dates */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-2xl font-bold text-dark mb-6 text-center">
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
                  className="mt-6 p-6 bg-white rounded-2xl shadow-lg shadow-dark/5 space-y-6"
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
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                            numHospedes === opt.value
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-cream-dark bg-white text-text-light hover:border-primary/40 hover:bg-primary/2'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            numHospedes === opt.value ? 'bg-primary/10' : 'bg-cream'
                          }`}>
                            {opt.icon}
                          </div>
                          <span className="font-medium text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={nextStep} className="w-full">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-dark">
                  Escolha seu quarto
                </h2>
                <p className="text-text-light">
                  {quartosDisponivelList.length} quarto(s) disponível(is)
                </p>
              </div>

              <SeletorQuarto
                quartos={quartosDisponivelList}
                selectedId={quarto?.id || null}
                onSelect={setQuarto}
              />

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!quarto}
                  className="flex-1"
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
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && checkIn && checkOut && quarto && hospede && (
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
