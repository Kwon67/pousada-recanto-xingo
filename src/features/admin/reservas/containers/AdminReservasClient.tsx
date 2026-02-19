'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  X,
  Eye,
  User,
  MapPin,
  CreditCard,
  Clock,
  Users,
  FileText,
  Bed,
  Trash2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPaymentMethod,
  formatPaymentStatus,
  formatStatus,
  formatPhone,
  formatCPF,
  formatNights,
  formatGuests,
  formatCategoria,
} from '@/lib/formatters';
import { atualizarStatusReserva, criarReservaManual, deletarReserva } from '@/lib/actions/reservas';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Reserva, StatusReserva } from '@/types/reserva';
import type { Quarto } from '@/types/quarto';

interface Props {
  reservasIniciais: Reserva[];
  quartos: Quarto[];
}

export default function AdminReservasClient({ reservasIniciais, quartos }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [busca, setBusca] = useState('');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showNovaReserva, setShowNovaReserva] = useState(false);
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showConfirmCode, setShowConfirmCode] = useState(false);
  const [confirmCodeInput, setConfirmCodeInput] = useState('');
  const { showToast } = useToast();

  const reservas = reservasIniciais;

  const statusOptions = [
    { value: '', label: 'Todos', count: reservas.length },
    { value: 'pendente', label: 'Pendentes', count: reservas.filter((r) => r.status === 'pendente').length },
    { value: 'confirmada', label: 'Confirmadas', count: reservas.filter((r) => r.status === 'confirmada').length },
    { value: 'concluida', label: 'Concluídas', count: reservas.filter((r) => r.status === 'concluida').length },
    { value: 'cancelada', label: 'Canceladas', count: reservas.filter((r) => r.status === 'cancelada').length },
  ];

  const filtered = reservas
    .filter((r) => (!statusFilter ? true : r.status === statusFilter))
    .filter((r) =>
      !busca
        ? true
        : r.hospede?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
          r.hospede?.email?.toLowerCase().includes(busca.toLowerCase()) ||
          r.hospede?.telefone?.includes(busca) ||
          r.quarto?.nome?.toLowerCase().includes(busca.toLowerCase())
    );

  const statusColors: Record<string, string> = {
    pendente: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
    concluida: 'bg-blue-100 text-blue-700',
  };

  const paymentStatusColors: Record<string, string> = {
    nao_iniciado: 'bg-gray-100 text-gray-700',
    pendente: 'bg-amber-100 text-amber-700',
    pago: 'bg-green-100 text-green-700',
    falhou: 'bg-red-100 text-red-700',
    cancelado: 'bg-rose-100 text-rose-700',
    expirado: 'bg-orange-100 text-orange-700',
  };

  const updateStatus = async (id: string, newStatus: StatusReserva) => {
    setSaving(true);
    const result = await atualizarStatusReserva(id, newStatus);
    setSaving(false);
    if (result.success) {
      showToast(result.message, 'success');
      setSelectedReserva(null);
      router.refresh();
    }
  };

  const openWhatsApp = (telefone: string, nome: string) => {
    const msg = encodeURIComponent(`Olá ${nome}! Aqui é da Pousada Recanto do Matuto Xingó. `);
    window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const result = await deletarReserva(id, deletePassword);
    setSaving(false);
    if (result.success) {
      showToast(result.message, 'success');
      setConfirmDeleteId(null);
      setDeletePassword('');
      setSelectedReserva(null);
      router.refresh();
    } else {
      showToast(result.message || 'Erro ao apagar reserva', 'error');
    }
  };

  const calcNoites = (checkIn: string, checkOut: string) => {
    return differenceInDays(parseISO(checkOut), parseISO(checkIn));
  };

  const totalReceitaRecebida = filtered
    .filter((r) => r.stripe_payment_status === 'pago')
    .reduce((acc, r) => acc + r.valor_total, 0);

  const totalReceitaPrevista = filtered
    .filter((r) => r.status !== 'cancelada')
    .reduce((acc, r) => acc + r.valor_total, 0);

  const handleNovaReserva = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await criarReservaManual({
      quarto_id: formData.get('quarto_id') as string,
      hospede_nome: formData.get('hospede_nome') as string,
      hospede_email: formData.get('hospede_email') as string,
      hospede_telefone: formData.get('hospede_telefone') as string,
      check_in: formData.get('check_in') as string,
      check_out: formData.get('check_out') as string,
      num_hospedes: Number(formData.get('num_hospedes')) || 2,
      valor_total: Number(formData.get('valor_total')) || 0,
      observacoes: (formData.get('observacoes') as string) || undefined,
    });

    setSaving(false);
    if (result.success) {
      showToast(result.message, 'success');
      setShowNovaReserva(false);
      router.refresh();
    } else {
      showToast(result.message || 'Erro ao criar reserva', 'error');
    }
  };

  // Calendar view
  const daysInMonth = 31;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} reservas · Recebido (Stripe): {formatCurrency(totalReceitaRecebida)} · Previsto: {formatCurrency(totalReceitaPrevista)}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'lista' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendario')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'calendario' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Calendário
            </button>
          </div>
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowNovaReserva(true)}
          >
            Nova Reserva
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou quarto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === opt.value ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Calendar View */}
      {viewMode === 'calendario' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendário
          </h2>
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                {d}
              </div>
            ))}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map((day) => {
              const hasReserva = reservas.some((r) => {
                const checkIn = new Date(r.check_in).getDate();
                const checkOut = new Date(r.check_out).getDate();
                return day >= checkIn && day <= checkOut;
              });
              return (
                <div
                  key={day}
                  className={`text-center py-2 rounded-lg text-sm ${
                    hasReserva
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'lista' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Hóspede</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Telefone</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Quarto</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden sm:table-cell">Check-in</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden sm:table-cell">Check-out</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Hóspedes</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Valor</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Pagamento</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{r.hospede?.nome}</p>
                      <p className="text-xs text-gray-400">{r.hospede?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {r.hospede?.telefone ? formatPhone(r.hospede.telefone) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{r.quarto?.nome}</td>
                    <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">
                      {formatDate(r.check_in)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">
                      {formatDate(r.check_out)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {r.num_hospedes}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatCurrency(r.valor_total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {formatStatus(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium ${
                            paymentStatusColors[r.stripe_payment_status || 'nao_iniciado'] ||
                            paymentStatusColors.nao_iniciado
                          }`}
                        >
                          {formatPaymentStatus(r.stripe_payment_status)}
                        </span>
                        {r.stripe_payment_status === 'pago' ? (
                          <span className="text-xs text-green-700">
                            Débito confirmado
                            {r.payment_approved_at
                              ? ` em ${formatDate(r.payment_approved_at, 'dd/MM HH:mm')}`
                              : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {formatPaymentMethod(r.stripe_payment_method)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedReserva(r); setShowConfirmCode(false); setConfirmCodeInput(''); setConfirmDeleteId(null); setDeletePassword(''); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhuma reserva encontrada</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reservation Detail Modal - SUPER COMPLETO */}
      <AnimatePresence>
        {selectedReserva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setSelectedReserva(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Detalhes da Reserva</h3>
                <button
                  onClick={() => setSelectedReserva(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Guest Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4" /> Hóspede
                  </h4>
                  <p className="text-gray-900 font-semibold">{selectedReserva.hospede?.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    {selectedReserva.hospede?.email}
                  </div>
                  {selectedReserva.hospede?.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      {formatPhone(selectedReserva.hospede.telefone)}
                    </div>
                  )}
                  {selectedReserva.hospede?.cpf && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CreditCard className="w-4 h-4" />
                      CPF: {formatCPF(selectedReserva.hospede.cpf)}
                    </div>
                  )}
                  {selectedReserva.hospede?.cidade && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {selectedReserva.hospede.cidade}
                    </div>
                  )}
                </div>

                {/* Room Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <h4 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                    <Bed className="w-4 h-4" /> Quarto
                  </h4>
                  <p className="text-gray-900 font-semibold">{selectedReserva.quarto?.nome}</p>
                  {selectedReserva.quarto?.categoria && (
                    <p className="text-sm text-gray-500">
                      Categoria: {formatCategoria(selectedReserva.quarto.categoria)}
                    </p>
                  )}
                </div>

                {/* Dates & Stay */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedReserva.check_in)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selectedReserva.check_out)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Noites</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatNights(calcNoites(selectedReserva.check_in, selectedReserva.check_out))}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Hóspedes
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatGuests(selectedReserva.num_hospedes)}
                    </p>
                  </div>
                </div>

                {/* Value */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(selectedReserva.valor_total)}</p>
                  {(() => {
                    const noites = calcNoites(selectedReserva.check_in, selectedReserva.check_out);
                    if (noites > 0) {
                      const diaria = selectedReserva.valor_total / noites;
                      return <p className="text-xs text-gray-400">~{formatCurrency(diaria)} / noite</p>;
                    }
                    return null;
                  })()}
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedReserva.status]}`}>
                    {formatStatus(selectedReserva.status)}
                  </span>
                </div>

                {/* Payment */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      paymentStatusColors[selectedReserva.stripe_payment_status || 'nao_iniciado'] ||
                      paymentStatusColors.nao_iniciado
                    }`}
                  >
                    {formatPaymentStatus(selectedReserva.stripe_payment_status)}
                  </span>
                  {selectedReserva.stripe_payment_status === 'pago' ? (
                    <p className="text-xs text-green-700 mt-2 font-medium">
                      Débito confirmado no Stripe.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-700 mt-2">
                      Débito ainda não confirmado no Stripe.
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Método: {formatPaymentMethod(selectedReserva.stripe_payment_method)}
                  </p>
                  {selectedReserva.payment_approved_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aprovado em {formatDateTime(selectedReserva.payment_approved_at)}
                    </p>
                  )}
                  {selectedReserva.stripe_payment_intent_id && (
                    <p className="text-xs text-gray-500 mt-1 break-all font-mono">
                      Stripe PI: {selectedReserva.stripe_payment_intent_id}
                    </p>
                  )}
                </div>

                {/* Observations */}
                {selectedReserva.observacoes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Observações
                    </p>
                    <p className="text-sm text-gray-700">{selectedReserva.observacoes}</p>
                  </div>
                )}

                {/* Created At */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Criada em
                  </p>
                  <p className="text-sm text-gray-700">{formatDateTime(selectedReserva.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  {/* WhatsApp */}
                  {selectedReserva.hospede?.telefone && (
                    <button
                      onClick={() => openWhatsApp(selectedReserva.hospede!.telefone, selectedReserva.hospede!.nome)}
                      className="w-full py-2.5 px-4 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chamar no WhatsApp
                    </button>
                  )}

                  {/* Status Actions */}
                  <div className="space-y-2">
                    {selectedReserva.status === 'pendente' && (
                      <>
                        {!showConfirmCode ? (
                          <button
                            onClick={() => setShowConfirmCode(true)}
                            disabled={saving}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" /> Confirmar Reserva
                          </button>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                            <p className="text-sm font-medium text-green-800">
                              Para confirmar, digite o código da reserva:
                            </p>
                            <p className="text-center font-mono text-lg font-bold text-green-700 bg-white rounded-lg py-2 border border-green-200 select-all">
                              {selectedReserva.id.slice(-8).toUpperCase()}
                            </p>
                            <input
                              type="text"
                              value={confirmCodeInput}
                              onChange={(e) => setConfirmCodeInput(e.target.value.toUpperCase())}
                              placeholder="Digite o código acima"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none text-sm text-center font-mono tracking-wider uppercase"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setShowConfirmCode(false); setConfirmCodeInput(''); }}
                                className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => updateStatus(selectedReserva.id, 'confirmada')}
                                disabled={saving || confirmCodeInput !== selectedReserva.id.slice(-8).toUpperCase()}
                                className="flex-1 py-2 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle className="w-4 h-4" /> {saving ? 'Confirmando...' : 'Confirmar'}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-2">
                      {selectedReserva.status === 'confirmada' && (
                        <button
                          onClick={() => updateStatus(selectedReserva.id, 'concluida')}
                          disabled={saving}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Marcar como Concluída
                        </button>
                      )}
                      {selectedReserva.status !== 'cancelada' && (
                        <button
                          onClick={() => updateStatus(selectedReserva.id, 'cancelada')}
                          disabled={saving}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Cancelar Reserva
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  {confirmDeleteId === selectedReserva.id ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Tem certeza que deseja apagar esta reserva?
                      </div>
                      <p className="text-xs text-red-600">Esta ação é irreversível. Digite a senha de administrador para confirmar.</p>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Senha de administrador"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none text-sm bg-white"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setConfirmDeleteId(null); setDeletePassword(''); }}
                          disabled={saving}
                          className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Não, manter
                        </button>
                        <button
                          onClick={() => handleDelete(selectedReserva.id)}
                          disabled={saving || !deletePassword}
                          className="flex-1 py-2 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" /> {saving ? 'Apagando...' : 'Apagar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(selectedReserva.id)}
                      className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Apagar reserva
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nova Reserva Modal */}
      <AnimatePresence>
        {showNovaReserva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setShowNovaReserva(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Nova Reserva</h3>
                <button onClick={() => setShowNovaReserva(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleNovaReserva} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do hóspede *</label>
                  <input name="hospede_nome" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input name="hospede_email" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone *</label>
                    <input name="hospede_telefone" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="(82) 99999-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quarto *</label>
                  <select name="quarto_id" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white">
                    <option value="">Selecione o quarto</option>
                    {quartos.filter((q) => q.ativo).map((q) => (
                      <option key={q.id} value={q.id}>{q.nome} — {formatCurrency(q.preco_diaria)}/noite</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-in *</label>
                    <input name="check_in" type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-out *</label>
                    <input name="check_out" type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hóspedes</label>
                    <select name="num_hospedes" defaultValue={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white">
                      <option value={1}>1 hóspede</option>
                      <option value={2}>2 hóspedes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor total (R$) *</label>
                    <input name="valor_total" type="number" required min={0} step="0.01" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações</label>
                  <textarea name="observacoes" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNovaReserva(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? 'Criando...' : 'Criar Reserva'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
