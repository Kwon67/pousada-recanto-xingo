'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  X,
  MessageSquare,
  Search,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import {
  getAvaliacoes,
  criarAvaliacao,
  toggleAprovada as toggleAprovadaAction,
  deletarAvaliacao,
} from '@/lib/actions/avaliacoes';
import type { Avaliacao } from '@/types/avaliacao';
import Button from '@/components/ui/app-button';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/features/admin/shared/components/ConfirmDialog';
import DataState from '@/features/admin/shared/components/DataState';
import EmptyState from '@/features/admin/shared/components/EmptyState';
import PageHeader from '@/features/admin/shared/components/PageHeader';

interface NovaAvaliacaoForm {
  hospede_nome: string;
  nota: string;
  comentario: string;
}

const initialForm: NovaAvaliacaoForm = {
  hospede_nome: '',
  nota: '5',
  comentario: '',
};

export default function AdminAvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'aprovadas' | 'ocultas'>('todas');
  const [showNova, setShowNova] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<NovaAvaliacaoForm>(initialForm);
  const { showToast } = useToast();

  const carregarAvaliacoes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvaliacoes();
      setAvaliacoes(data as Avaliacao[]);
    } catch {
      showToast('Erro ao carregar avaliações.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarAvaliacoes();
  }, [carregarAvaliacoes]);

  const filtered = useMemo(() => {
    return avaliacoes
      .filter((a) => {
        if (filtroStatus === 'aprovadas') return a.aprovada;
        if (filtroStatus === 'ocultas') return !a.aprovada;
        return true;
      })
      .filter((a) => {
        if (!busca) return true;
        const query = busca.toLowerCase();
        return (
          a.hospede?.nome?.toLowerCase().includes(query) ||
          a.comentario?.toLowerCase().includes(query)
        );
      });
  }, [avaliacoes, busca, filtroStatus]);

  const mediaNotas = useMemo(() => {
    if (avaliacoes.length === 0) return '0';
    const total = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
    return (total / avaliacoes.length).toFixed(1);
  }, [avaliacoes]);

  const handleToggleAprovada = async (avaliacao: Avaliacao) => {
    const novoValor = !avaliacao.aprovada;

    setAvaliacoes((prev) =>
      prev.map((a) => (a.id === avaliacao.id ? { ...a, aprovada: novoValor } : a))
    );

    const result = await toggleAprovadaAction(avaliacao.id, novoValor);
    if (!result?.success) {
      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === avaliacao.id ? { ...a, aprovada: avaliacao.aprovada } : a))
      );
      showToast(result?.message || 'Erro ao atualizar avaliação.', 'error');
      return;
    }

    showToast(
      novoValor ? 'Avaliação aprovada e visível no site.' : 'Avaliação ocultada do site.',
      'success'
    );
  };

  const handleDelete = async (id: string) => {
    const result = await deletarAvaliacao(id);
    if (!result?.success) {
      showToast(result?.message || 'Erro ao excluir avaliação.', 'error');
      return;
    }

    setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
    showToast('Avaliação excluída com sucesso!', 'success');
  };

  const handleNovaAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.hospede_nome.trim() || !form.comentario.trim()) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await criarAvaliacao({
      hospede_nome: form.hospede_nome.trim(),
      nota: Number(form.nota),
      comentario: form.comentario.trim(),
      aprovada: true,
    });
    setSubmitting(false);

    if (!result?.success) {
      showToast(result?.message || 'Erro ao criar avaliação.', 'error');
      return;
    }

    showToast('Avaliação adicionada com sucesso!', 'success');
    setShowNova(false);
    setForm(initialForm);
    await carregarAvaliacoes();
  };

  if (loading) {
    return <DataState title="Avaliações" message="Carregando avaliações..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avaliações"
        subtitle={`${avaliacoes.length} avaliações · Média: ${mediaNotas}`}
        actions={(
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowNova(true)}
          >
            Adicionar Avaliação
          </Button>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-amber-500">{mediaNotas}</p>
          <p className="text-sm text-gray-500 mt-1">Nota média</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-green-600">{avaliacoes.filter((a) => a.aprovada).length}</p>
          <p className="text-sm text-gray-500 mt-1">Aprovadas</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-400">{avaliacoes.filter((a) => !a.aprovada).length}</p>
          <p className="text-sm text-gray-500 mt-1">Ocultas</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou comentário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
          />
        </div>
        <div className="flex gap-2">
          {['todas', 'aprovadas', 'ocultas'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroStatus(filtro as 'todas' | 'aprovadas' | 'ocultas')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filtroStatus === filtro
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {filtro === 'todas' ? 'Todas' : filtro === 'aprovadas' ? 'Aprovadas' : 'Ocultas'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((av, index) => (
          <motion.div
            key={av.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              av.aprovada ? 'border-gray-100' : 'border-gray-200 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{av.hospede?.nome || 'Hóspede'}</p>
                    <p className="text-xs text-gray-400">
                      {av.hospede?.cidade || 'Cidade não informada'} · {formatDate(av.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < av.nota ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {av.comentario}
                </p>

                {!av.aprovada && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <EyeOff className="w-3 h-3" /> Oculta do site
                  </span>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleToggleAprovada(av)}
                  className={`p-2 rounded-lg transition-colors ${
                    av.aprovada
                      ? 'text-green-500 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={av.aprovada ? 'Ocultar do site' : 'Aprovar e mostrar no site'}
                >
                  {av.aprovada ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeleteId(av.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            title="Nenhuma avaliação encontrada"
            icon={<MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Excluir avaliação?"
        description="Essa ação não pode ser desfeita."
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            void handleDelete(deleteId);
          }
        }}
      />

      <AnimatePresence>
        {showNova && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setShowNova(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Nova Avaliação</h3>
                <button onClick={() => setShowNova(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleNovaAvaliacao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do hóspede *</label>
                  <input
                    required
                    value={form.hospede_nome}
                    onChange={(e) => setForm((prev) => ({ ...prev, hospede_nome: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nota *</label>
                  <select
                    required
                    value={form.nota}
                    onChange={(e) => setForm((prev) => ({ ...prev, nota: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                  >
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★☆ (4)</option>
                    <option value="3">★★★☆☆ (3)</option>
                    <option value="2">★★☆☆☆ (2)</option>
                    <option value="1">★☆☆☆☆ (1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Comentário *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.comentario}
                    onChange={(e) => setForm((prev) => ({ ...prev, comentario: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                    placeholder="O que o hóspede disse..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNova(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <Button type="submit" className="flex-1" loading={submitting}>Adicionar</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
