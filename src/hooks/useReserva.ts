'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { calcularValorTotal, calcularNoites } from '@/lib/utils';
import { criarReserva } from '@/lib/actions/reservas';
import type { Quarto } from '@/types/quarto';
import type { NovoHospede } from '@/types/hospede';

interface ReservaState {
  step: number;
  checkIn: Date | null;
  checkOut: Date | null;
  quarto: Quarto | null;
  numHospedes: number;
  hospede: NovoHospede | null;
  observacoes: string;
}

const initialState: ReservaState = {
  step: 1,
  checkIn: null,
  checkOut: null,
  quarto: null,
  numHospedes: 2,
  hospede: null,
  observacoes: '',
};

export function useReserva() {
  const [state, setState] = useState<ReservaState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 4) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const setDatas = useCallback((checkIn: Date, checkOut: Date) => {
    setState((prev) => ({ ...prev, checkIn, checkOut }));
  }, []);

  const setQuarto = useCallback((quarto: Quarto) => {
    setState((prev) => ({ ...prev, quarto }));
  }, []);

  const setNumHospedes = useCallback((numHospedes: number) => {
    setState((prev) => ({ ...prev, numHospedes }));
  }, []);

  const setHospede = useCallback((hospede: NovoHospede) => {
    setState((prev) => ({ ...prev, hospede }));
  }, []);

  const setObservacoes = useCallback((observacoes: string) => {
    setState((prev) => ({ ...prev, observacoes }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const noites = state.checkIn && state.checkOut
    ? calcularNoites(state.checkIn, state.checkOut)
    : 0;

  const valorTotal = state.checkIn && state.checkOut && state.quarto
    ? calcularValorTotal(
        state.checkIn,
        state.checkOut,
        state.quarto.preco_diaria,
        state.quarto.preco_fds
      )
    : 0;

  const confirmarReserva = useCallback(async () => {
    if (!state.checkIn || !state.checkOut || !state.quarto || !state.hospede) {
      setError('Dados incompletos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await criarReserva({
        quarto_id: state.quarto.id,
        quarto_nome: state.quarto.nome,
        hospede_nome: state.hospede.nome,
        hospede_email: state.hospede.email,
        hospede_telefone: state.hospede.telefone,
        hospede_cpf: state.hospede.cpf,
        hospede_cidade: state.hospede.cidade,
        check_in: format(state.checkIn, 'yyyy-MM-dd'),
        check_out: format(state.checkOut, 'yyyy-MM-dd'),
        num_hospedes: state.numHospedes,
        noites,
        valor_total: valorTotal,
        observacoes: state.observacoes || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Erro ao confirmar reserva');
        return null;
      }

      if (!result.clientSecret) {
        setError('Não foi possível iniciar o checkout no Stripe.');
        return null;
      }

      return {
        id: result.reservaId!,
        clientSecret: result.clientSecret,
        quarto: state.quarto,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        numHospedes: state.numHospedes,
        hospede: state.hospede,
        valorTotal,
        noites,
      };
    } catch {
      setError('Erro ao confirmar reserva. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state, valorTotal, noites]);

  return {
    ...state,
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
    reset,
    confirmarReserva,
  };
}
