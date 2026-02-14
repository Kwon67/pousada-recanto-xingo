'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDatasOcupadas, getQuartosDisponiveisIds } from '@/lib/actions/disponibilidade';
import { eachDayOfInterval, format } from 'date-fns';

interface DisponibilidadeResult {
  disponivel: boolean;
  datasOcupadas: string[];
}

export function useDisponibilidade(quartoId?: string) {
  const [datasOcupadas, setDatasOcupadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDatasOcupadas = async () => {
      setLoading(true);
      try {
        const ocupadas = await getDatasOcupadas(quartoId);
        setDatasOcupadas(ocupadas);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasOcupadas();
  }, [quartoId]);

  const verificarDisponibilidade = useCallback(
    (checkIn: Date, checkOut: Date): DisponibilidadeResult => {
      const datasReservadas = eachDayOfInterval({ start: checkIn, end: checkOut });
      const conflitos = datasReservadas.filter((data) =>
        datasOcupadas.includes(format(data, 'yyyy-MM-dd'))
      );

      return {
        disponivel: conflitos.length === 0,
        datasOcupadas: conflitos.map((d) => format(d, 'yyyy-MM-dd')),
      };
    },
    [datasOcupadas]
  );

  const isDataOcupada = useCallback(
    (date: Date): boolean => {
      return datasOcupadas.includes(format(date, 'yyyy-MM-dd'));
    },
    [datasOcupadas]
  );

  return {
    datasOcupadas,
    loading,
    verificarDisponibilidade,
    isDataOcupada,
  };
}

export function useQuartosDisponiveis(checkIn: Date | null, checkOut: Date | null) {
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuartosDisponiveis([]);
      return;
    }

    const fetchQuartosDisponiveis = async () => {
      setLoading(true);
      try {
        const checkInStr = format(checkIn, 'yyyy-MM-dd');
        const checkOutStr = format(checkOut, 'yyyy-MM-dd');
        const disponiveis = await getQuartosDisponiveisIds(checkInStr, checkOutStr);
        setQuartosDisponiveis(disponiveis);
      } finally {
        setLoading(false);
      }
    };

    fetchQuartosDisponiveis();
  }, [checkIn, checkOut]);

  return { quartosDisponiveis, loading };
}
