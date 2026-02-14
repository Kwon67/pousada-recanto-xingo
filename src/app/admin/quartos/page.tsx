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
import Button from '@/components/ui/Button';
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
    standard: 'bg-blue-100 text-blue-700',
    superior: 'bg-purple-100 text-purple-700',
    suite: 'bg-amber-100 text-amber-700',
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Carregando quartos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quartos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {quartos.length} quartos cadastrados · {quartos.filter((q) => q.ativo).length} ativos
          </p>
        </div>
        <Link href="/admin/quartos/novo">
          <Button leftIcon={<Plus className="w-5 h-5" />}>
            Novo Quarto
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar quarto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filtroCategoria === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'todos' ? 'Todos' : formatCategoria(cat)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {quartosFiltrados.map((quarto, index) => (
          <motion.div
            key={quarto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
              !quarto.ativo ? 'opacity-60 border-gray-200' : 'border-gray-100'
            }`}
          >
            {/* Image */}
            <div className="relative h-40 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quarto.imagem_principal}
                alt={quarto.nome}
                className="w-full h-full object-cover"
              />
              {quarto.destaque && (
                <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Destaque
                </div>
              )}
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${categoriaBadgeColors[quarto.categoria]}`}>
                {formatCategoria(quarto.categoria)}
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{quarto.nome}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${quarto.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {quarto.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {quarto.descricao_curta}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-primary text-lg">
                    {formatCurrency(quarto.preco_diaria)}
                  </span>
                  <span className="text-gray-400">/noite</span>
                </div>
                <span className="text-gray-400">
                  {quarto.capacidade} {quarto.capacidade === 1 ? 'hóspede' : 'hóspedes'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex gap-2">
              <Link href={`/admin/quartos/${quarto.id}`} className="flex-1">
                <button className="w-full px-3 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              </Link>
              <button
                onClick={() => toggleAtivo(quarto.id)}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                title={quarto.ativo ? 'Desativar' : 'Ativar'}
              >
                {quarto.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDeleteId(quarto.id)}
                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {quartosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">Nenhum quarto encontrado</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                Excluir quarto?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Essa ação não pode ser desfeita. O quarto será removido permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
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
