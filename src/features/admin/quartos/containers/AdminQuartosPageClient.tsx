'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
} from 'lucide-react';
import { formatCurrency, formatCategoria } from '@/lib/formatters';
import Button from '@/components/ui/app-button';
import { useToast } from '@/components/ui/Toast';
import { getQuartos, toggleAtivoQuarto, deletarQuarto } from '@/lib/actions/quartos';
import type { Quarto } from '@/types/quarto';

export default function AdminQuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const carregarQuartos = useCallback(async () => {
    try {
      const data = await getQuartos();
      setQuartos(data as unknown as Quarto[]);
    } catch {
      showToast('Erro ao carregar quartos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarQuartos();
  }, [carregarQuartos]);

  const quartosFiltrados = quartos
    .filter((q) =>
      filtroCategoria === 'todos' ? true : q.categoria === filtroCategoria
    )
    .filter((q) => q.nome.toLowerCase().includes(busca.toLowerCase()));

  const toggleAtivo = async (id: string) => {
    const quarto = quartos.find((q) => q.id === id);
    if (!quarto) return;
    const novoAtivo = !quarto.ativo;
    setQuartos(quartos.map((q) =>
      q.id === id ? { ...q, ativo: novoAtivo } : q
    ));
    try {
      await toggleAtivoQuarto(id, novoAtivo);
      showToast(
        novoAtivo ? `${quarto.nome} ativado` : `${quarto.nome} desativado`,
        'success'
      );
    } catch {
      setQuartos(quartos.map((q) =>
        q.id === id ? { ...q, ativo: !novoAtivo } : q
      ));
      showToast('Erro ao alterar status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const quarto = quartos.find((q) => q.id === id);
    setDeleteId(null);
    try {
      await deletarQuarto(id);
      setQuartos(quartos.filter((q) => q.id !== id));
      showToast(`${quarto?.nome} excluído com sucesso!`, 'success');
    } catch {
      showToast('Erro ao excluir quarto', 'error');
    }
  };

  const categorias = ['todos', 'standard', 'superior', 'suite'];
  const categoriaBadgeColors: Record<string, string> = {
    standard: 'border border-[var(--color-badge-standard)]/20 text-[var(--color-badge-standard)] bg-[var(--color-badge-standard)]/5',
    superior: 'border border-[var(--color-badge-superior)]/20 text-[var(--color-badge-superior)] bg-[var(--color-badge-superior)]/5',
    suite: 'border border-[var(--color-badge-suite)]/20 text-[var(--color-badge-suite)] bg-[var(--color-badge-suite)]/5',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-light">Carregando acomodações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Acomodações</h1>
          <p className="text-gray-400 text-sm mt-1 font-light">
            {quartos.length} {quartos.length === 1 ? 'acomodação cadastrada' : 'acomodações cadastradas'} · {quartos.filter((q) => q.ativo).length} {quartos.filter((q) => q.ativo).length === 1 ? 'ativa' : 'ativas'}
          </p>
        </div>
        <Link href="/admin/quartos/novo">
          <Button leftIcon={<Plus className="w-5 h-5" />}>
            Nova Acomodação
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        style={{ boxShadow: 'var(--shadow-elegant)' }}
        className="bg-white rounded-[var(--radius-xl)] p-5 border border-gray-100/50 flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar acomodação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Pesquisar acomodações"
            style={{ transition: 'var(--transition-elegant)' }}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              style={{ transition: 'var(--transition-elegant)' }}
              className={`px-4 py-2 rounded-[var(--radius-lg)] text-sm font-medium whitespace-nowrap ${
                filtroCategoria === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/50'
              }`}
            >
              {cat === 'todos' ? 'Todos' : formatCategoria(cat)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quartosFiltrados.map((quarto, index) => (
          <motion.div
            key={quarto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.03 }}
            style={{ 
              boxShadow: 'var(--shadow-elegant)',
              transition: 'var(--transition-elegant)'
            }}
            className={`bg-white rounded-[var(--radius-xl)] border overflow-hidden hover:shadow-[var(--shadow-elegant-md)] ${
              !quarto.ativo ? 'opacity-60 border-gray-200/50' : 'border-gray-100/50'
            }`}
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quarto.imagem_principal}
                alt={`Foto do ${quarto.nome} - ${quarto.descricao_curta}`}
                className="w-full h-full object-cover"
              />
              {quarto.destaque && (
                <div style={{ transition: 'var(--transition-elegant)' }} className="absolute top-3 left-3 bg-amber-400/90 backdrop-blur-sm text-amber-900 px-3 py-1.5 rounded-[var(--radius-lg)] text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  <Star className="w-3.5 h-3.5" /> Destaque
                </div>
              )}
              <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-[var(--radius-lg)] text-xs font-medium backdrop-blur-sm ${categoriaBadgeColors[quarto.categoria]}`}>
                {formatCategoria(quarto.categoria)}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-base">{quarto.nome}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] font-medium border ${quarto.ativo ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-gray-50 text-gray-500 border-gray-200/50'}`}>
                  {quarto.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-light leading-relaxed">
                {quarto.descricao_curta}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-primary text-lg">
                    {formatCurrency(quarto.preco_diaria)}
                  </span>
                  <span className="text-gray-400 font-light">/noite</span>
                </div>
                <span className="text-gray-400 font-light">
                  {quarto.capacidade} {quarto.capacidade === 1 ? 'hóspede' : 'hóspedes'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-2">
              <Link href={`/admin/quartos/${quarto.id}`} className="flex-1">
                <button style={{ transition: 'var(--transition-elegant)' }} className="w-full px-4 py-2.5 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center gap-2">
                  <Pencil className="w-4 h-4" /> Editar
                </button>
              </Link>
              <button
                onClick={() => toggleAtivo(quarto.id)}
                style={{ transition: 'var(--transition-elegant)' }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-[var(--radius-lg)] border border-gray-200/50"
                aria-label={quarto.ativo ? `Desativar ${quarto.nome}` : `Ativar ${quarto.nome}`}
                title={quarto.ativo ? 'Desativar' : 'Ativar'}
              >
                {quarto.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDeleteId(quarto.id)}
                style={{ transition: 'var(--transition-elegant)' }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-500 hover:bg-red-50 rounded-[var(--radius-lg)] border border-red-200/50"
                aria-label={`Excluir ${quarto.nome}`}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {quartosFiltrados.length === 0 && (
        <div style={{ boxShadow: 'var(--shadow-elegant)' }} className="text-center py-16 bg-white rounded-[var(--radius-xl)] border border-gray-100/50">
          <p className="text-gray-400 font-light">Nenhuma acomodação encontrada</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/30 backdrop-blur-sm p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ boxShadow: 'var(--shadow-elegant-xl)' }}
              className="bg-white rounded-[var(--radius-xl)] p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 id="modal-title" className="text-lg font-semibold text-center text-gray-900 mb-3">
                Excluir acomodação?
              </h3>
              <p className="text-sm text-gray-400 text-center mb-8 font-light leading-relaxed">
                Esta ação não pode ser desfeita. A acomodação será removida permanentemente do sistema.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  style={{ transition: 'var(--transition-elegant)' }}
                  className="flex-1 py-3 px-4 rounded-[var(--radius-lg)] border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  style={{ transition: 'var(--transition-elegant)' }}
                  className="flex-1 py-3 px-4 rounded-[var(--radius-lg)] bg-red-500 text-white text-sm font-medium hover:bg-red-600 shadow-sm"
                >
                  Sim, excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
