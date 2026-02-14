'use client';

import { useState, useEffect, useMemo } from 'react';
import { getQuartos, getQuartoBySlug } from '@/lib/actions/quartos';
import type { Quarto, FiltroQuartos } from '@/types/quarto';

export function useQuartos(filtros?: FiltroQuartos) {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuartos = async () => {
      try {
        setLoading(true);
        const data = await getQuartos();
        setQuartos((data as unknown as Quarto[]).filter((q) => q.ativo));
        setError(null);
      } catch {
        setError('Erro ao carregar quartos');
      } finally {
        setLoading(false);
      }
    };

    fetchQuartos();
  }, []);

  const quartosFiltrados = useMemo(() => {
    if (!filtros) return quartos;

    return quartos.filter((quarto) => {
      if (filtros.categoria && filtros.categoria !== 'todos') {
        if (quarto.categoria !== filtros.categoria) return false;
      }

      if (filtros.precoMin !== undefined) {
        if (quarto.preco_diaria < filtros.precoMin) return false;
      }

      if (filtros.precoMax !== undefined) {
        if (quarto.preco_diaria > filtros.precoMax) return false;
      }

      if (filtros.capacidade !== undefined) {
        if (quarto.capacidade < filtros.capacidade) return false;
      }

      return true;
    });
  }, [quartos, filtros]);

  const quartosDestaque = useMemo(() => {
    return quartos.filter((q) => q.destaque).slice(0, 3);
  }, [quartos]);

  return {
    quartos: quartosFiltrados,
    quartosDestaque,
    allQuartos: quartos,
    loading,
    error,
  };
}

export function useQuarto(slug: string) {
  const [quarto, setQuarto] = useState<Quarto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuarto = async () => {
      try {
        setLoading(true);
        const found = await getQuartoBySlug(slug);
        if (found) {
          setQuarto(found);
          setError(null);
        } else {
          setError('Quarto não encontrado');
        }
      } catch {
        setError('Erro ao carregar quarto');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchQuarto();
    }
  }, [slug]);

  return { quarto, loading, error };
}
