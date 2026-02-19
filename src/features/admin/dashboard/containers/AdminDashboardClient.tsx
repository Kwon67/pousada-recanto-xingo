'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Users,
  Bell,
  AlertTriangle,
  Phone,
  BedDouble,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserRound,
  Smartphone,
  Monitor,
  Globe,
  PlusCircle,
  ImagePlus,
  FileText,
  Cog,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  formatPaymentStatus,
  formatPhone,
  formatStatus,
} from '@/lib/formatters';
import type { Reserva } from '@/types/reserva';
import type { Quarto } from '@/types/quarto';
import type { AdminAccessLog, AdminAccessEventType } from '@/types/admin';

interface Estatisticas {
  totalReservas: number;
  reservasPendentes: number;
  receitaMes: number;
  taxaOcupacao: number;
}

interface StatsCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface Props {
  estatisticas: Estatisticas;
  reservas: Reserva[];
  quartos: Quarto[];
  acessosAdmin: AdminAccessLog[];
}

type RoomAvailabilityStatus = 'ocupado' | 'pendente' | 'disponivel' | 'inativo';

interface RoomStatusItem {
  quarto: Quarto;
  status: RoomAvailabilityStatus;
  reservaAtiva?: Reserva;
}

const STATUS_PRIORITY: Record<RoomAvailabilityStatus, number> = {
  ocupado: 0,
  pendente: 1,
  disponivel: 2,
  inativo: 3,
};

const RESERVA_CLASSIFICATION_PRIORITY: Record<string, number> = {
  confirmada: 3,
  pendente: 2,
  concluida: 1,
  cancelada: 0,
};

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toISODatePart(value: string): string {
  return value.slice(0, 10);
}

function getDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Dispositivo não identificado';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getEventLabel(eventType: AdminAccessEventType): string {
  if (eventType === 'login') return 'Login';
  if (eventType === 'access') return 'Acesso';
  if (eventType === 'logout') return 'Logout';
  return 'Falha de login';
}

function getEventTone(eventType: AdminAccessEventType): string {
  if (eventType === 'login') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (eventType === 'access') return 'border-slate-300 bg-slate-100 text-slate-700';
  if (eventType === 'logout') return 'border-slate-300 bg-white text-slate-600';
  return 'border-rose-200 bg-rose-50 text-rose-700';
}

export default function AdminDashboardClient({
  estatisticas,
  reservas,
  quartos,
  acessosAdmin,
}: Props) {
  const router = useRouter();
  const pendentes = useMemo(() => reservas.filter((r) => r.status === 'pendente'), [reservas]);
  const confirmadas = useMemo(() => reservas.filter((r) => r.status === 'confirmada'), [reservas]);
  const pagamentosAprovados = useMemo(
    () => reservas.filter((r) => r.stripe_payment_status === 'pago'),
    [reservas]
  );
  const pagamentosPendentes = useMemo(
    () =>
      reservas.filter(
        (r) =>
          r.status === 'pendente' &&
          (r.stripe_payment_status === 'pendente' ||
            r.stripe_payment_status === 'nao_iniciado' ||
            !r.stripe_payment_status)
      ),
    [reservas]
  );
  const reservasConfirmadasSemDebito = useMemo(
    () => reservas.filter((r) => r.status === 'confirmada' && r.stripe_payment_status !== 'pago'),
    [reservas]
  );
  const ultimoPagamentoAprovado = useMemo(() => {
    if (pagamentosAprovados.length === 0) return null;

    return [...pagamentosAprovados].sort((a, b) => {
      const aDate = a.payment_approved_at || a.created_at;
      const bDate = b.payment_approved_at || b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];
  }, [pagamentosAprovados]);
  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const quickActions = useMemo(
    () => [
      {
        href: '/admin/reservas',
        label: 'Nova reserva manual',
        helper: 'Criar atendimento rápido',
        icon: PlusCircle,
      },
      {
        href: '/admin/quartos',
        label: 'Gerenciar quartos',
        helper: 'Atualizar preço e disponibilidade',
        icon: Cog,
      },
      {
        href: '/admin/galeria',
        label: 'Atualizar galeria',
        helper: 'Subir fotos e organizar destaque',
        icon: ImagePlus,
      },
      {
        href: '/admin/conteudo',
        label: 'Editar conteúdo',
        helper: 'Ajustar textos e chamadas do site',
        icon: FileText,
      },
    ],
    []
  );
  const dashboardDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      }).format(new Date()),
    []
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 30000);

    const onFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  const stats: StatsCard[] = useMemo(() => [
    {
      label: 'Reservas este mês',
      value: estatisticas.totalReservas,
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-slate-700',
      bgColor: 'border-slate-200 bg-slate-100',
    },
    {
      label: 'Taxa de ocupação',
      value: `${estatisticas.taxaOcupacao}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-emerald-700',
      bgColor: 'border-emerald-200/80 bg-emerald-50',
    },
    {
      label: 'Receita recebida',
      value: formatCurrency(estatisticas.receitaMes),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-blue-700',
      bgColor: 'border-blue-200/80 bg-blue-50',
    },
    {
      label: 'Pagamentos pendentes',
      value: pagamentosPendentes.length,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-amber-700',
      bgColor: 'border-amber-200/80 bg-amber-50',
    },
  ], [estatisticas, pagamentosPendentes]);

  const proximosCheckins = useMemo(() => confirmadas.slice(0, 4), [confirmadas]);
  const recentReservas = useMemo(() => reservas.slice(0, 6), [reservas]);
  const acessosRecentes = useMemo(() => acessosAdmin.slice(0, 8), [acessosAdmin]);
  const ultimoAcesso = acessosRecentes[0] ?? null;
  const falhasRecentes = useMemo(
    () => acessosAdmin.filter((acesso) => acesso.event_type === 'login_failed').length,
    [acessosAdmin]
  );
  const reservasAtivasHoje = useMemo(
    () =>
      reservas.filter((reserva) => {
        if (reserva.status !== 'confirmada' && reserva.status !== 'pendente') return false;
        const checkIn = toISODatePart(reserva.check_in);
        const checkOut = toISODatePart(reserva.check_out);
        return checkIn <= todayISO && checkOut > todayISO;
      }),
    [reservas, todayISO]
  );

  const reservaAtivaPorQuarto = useMemo(() => {
    const map = new Map<string, Reserva>();

    for (const reserva of reservasAtivasHoje) {
      const atual = map.get(reserva.quarto_id);
      const prioridadeAtual = atual ? RESERVA_CLASSIFICATION_PRIORITY[atual.status] ?? -1 : -1;
      const prioridadeNova = RESERVA_CLASSIFICATION_PRIORITY[reserva.status] ?? -1;
      const mustReplace =
        !atual ||
        prioridadeNova > prioridadeAtual ||
        (prioridadeNova === prioridadeAtual &&
          toISODatePart(reserva.check_out) > toISODatePart(atual.check_out));

      if (mustReplace) {
        map.set(reserva.quarto_id, reserva);
      }
    }

    return map;
  }, [reservasAtivasHoje]);

  const quartosComStatus = useMemo<RoomStatusItem[]>(
    () =>
      quartos
        .map((quarto) => {
          if (!quarto.ativo) {
            return { quarto, status: 'inativo' as const };
          }

          const reservaAtiva = reservaAtivaPorQuarto.get(quarto.id);
          if (reservaAtiva) {
            if (reservaAtiva.status === 'pendente') {
              return { quarto, status: 'pendente' as const, reservaAtiva };
            }
            return { quarto, status: 'ocupado' as const, reservaAtiva };
          }

          return { quarto, status: 'disponivel' as const };
        })
        .sort(
          (a, b) =>
            STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
            a.quarto.ordem - b.quarto.ordem
        ),
    [quartos, reservaAtivaPorQuarto]
  );

  const resumoQuartos = useMemo(
    () =>
      quartosComStatus.reduce(
        (acc, item) => {
          if (item.status === 'ocupado') acc.ocupados += 1;
          if (item.status === 'pendente') acc.pendentes += 1;
          if (item.status === 'disponivel') acc.disponiveis += 1;
          if (item.status === 'inativo') acc.inativos += 1;
          return acc;
        },
        { ocupados: 0, pendentes: 0, disponiveis: 0, inativos: 0 }
      ),
    [quartosComStatus]
  );

  const statusColors: Record<string, string> = {
    pendente: 'border border-amber-200 bg-amber-50 text-amber-700',
    confirmada: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelada: 'border border-rose-200 bg-rose-50 text-rose-700',
    concluida: 'border border-slate-300 bg-slate-100 text-slate-700',
  };
  const paymentStatusColors: Record<string, string> = {
    nao_iniciado: 'border border-slate-300 bg-slate-100 text-slate-700',
    pendente: 'border border-amber-200 bg-amber-50 text-amber-700',
    pago: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    falhou: 'border border-rose-200 bg-rose-50 text-rose-700',
    cancelado: 'border border-rose-200 bg-rose-50 text-rose-700',
    expirado: 'border border-orange-200 bg-orange-50 text-orange-700',
  };

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da pousada • {dashboardDateLabel}
        </p>
      </motion.div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link
              href={action.href}
              className="group block rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 transition-all hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
              <p className="mt-1 text-xs text-slate-500">{action.helper}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Pending Reservations Notification Banner */}
      <AnimatePresence>
        {pendentes.length > 0 && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-sm transition-all hover:border-amber-300/80 hover:bg-amber-50/60"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-white">
                  <Bell className="w-6 h-6 text-amber-700" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-500 text-[10px] font-semibold text-white">
                  {pendentes.length}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">
                  {pendentes.length} {pendentes.length === 1 ? 'reserva pendente' : 'reservas pendentes'} aguardando confirmação
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Clique aqui para revisar e aprovar as reservas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <ArrowRight className="w-5 h-5 text-slate-500 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Pending reservations quick list */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pendentes.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-xl border border-amber-200/70 bg-white/95 px-3 py-2 text-sm">
                  <p className="truncate font-medium text-slate-800">{r.hospede?.nome}</p>
                  <p className="text-xs text-slate-500">{r.quarto?.nome} · {formatDate(r.check_in)}</p>
                </div>
              ))}
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ultimoPagamentoAprovado && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-sm transition-all hover:border-emerald-300/80 hover:bg-emerald-50/60"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-white">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">
                  Débito confirmado no Stripe
                </p>
                <p className="mt-0.5 text-sm text-slate-700">
                  {ultimoPagamentoAprovado.hospede?.nome || 'Hóspede'} •{' '}
                  {ultimoPagamentoAprovado.quarto?.nome || 'Quarto'} •{' '}
                  {formatCurrency(ultimoPagamentoAprovado.valor_total)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ultimoPagamentoAprovado.payment_approved_at
                    ? `Aprovado em ${formatDate(ultimoPagamentoAprovado.payment_approved_at, 'dd/MM/yyyy HH:mm')}`
                    : 'Aprovação recebida'}
                  {' • '}
                  Método: {formatPaymentMethod(ultimoPagamentoAprovado.stripe_payment_method)}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reservasConfirmadasSemDebito.length > 0 && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-sm transition-all hover:border-rose-300/80 hover:bg-rose-50/60"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-200 bg-white">
                <AlertTriangle className="w-6 h-6 text-rose-700" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">
                  {reservasConfirmadasSemDebito.length}{' '}
                  {reservasConfirmadasSemDebito.length === 1
                    ? 'reserva confirmada sem débito'
                    : 'reservas confirmadas sem débito'}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Revise o pagamento no Stripe antes de considerar o valor como recebido.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 transition-transform group-hover:translate-x-1" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reservasConfirmadasSemDebito.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-rose-200/70 bg-white/95 px-3 py-2 text-sm"
                >
                  <p className="truncate font-medium text-slate-800">{r.hospede?.nome}</p>
                  <p className="text-xs text-slate-500">
                    {r.quarto?.nome} • {formatPaymentStatus(r.stripe_payment_status)}
                  </p>
                </div>
              ))}
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-xl border p-3 ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              Auditoria de Acesso Admin
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Autoatualiza a cada 30 segundos e quando a aba volta ao foco.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {acessosRecentes.length} registro(s)
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              {falhasRecentes} falha(s) recentes
            </span>
          </div>
        </div>

        {ultimoAcesso ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-xs text-slate-500">Última atividade registrada</p>
            <p className="mt-1 text-sm text-slate-900">
              <span className="font-semibold">{ultimoAcesso.username}</span>
              {' • '}
              {getEventLabel(ultimoAcesso.event_type)}
              {' • '}
              {formatDate(ultimoAcesso.created_at, 'dd/MM/yyyy HH:mm')}
            </p>
            <p className="mt-1 truncate text-xs text-slate-600">
              {ultimoAcesso.ip ? `IP: ${ultimoAcesso.ip}` : 'IP não identificado'}
              {ultimoAcesso.path ? ` • Rota: ${ultimoAcesso.path}` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Nenhuma atividade registrada ainda.</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {acessosRecentes.map((acesso) => {
            const isMobile = getDeviceLabel(acesso.user_agent) === 'Mobile';
            return (
              <div
                key={acesso.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <UserRound className="w-4 h-4 text-slate-500" />
                    {acesso.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${getEventTone(acesso.event_type)}`}>
                      {getEventLabel(acesso.event_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                      {isMobile ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5" />
                      )}
                      {getDeviceLabel(acesso.user_agent)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {formatDate(acesso.created_at, 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                  <Globe className="w-3.5 h-3.5" />
                  {acesso.ip || 'IP não identificado'}
                  {acesso.path ? ` • ${acesso.path}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Occupation Chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 font-semibold text-slate-900">Resumo de Reservas</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Pagamentos debitados', count: pagamentosAprovados.length, color: 'border border-emerald-200 bg-emerald-50 text-emerald-700' },
              { label: 'Pendentes', count: pendentes.length, color: 'border border-amber-200 bg-amber-50 text-amber-700' },
              { label: 'Confirmadas', count: confirmadas.length, color: 'border border-emerald-200 bg-emerald-50 text-emerald-700' },
              { label: 'Concluídas', count: reservas.filter(r => r.status === 'concluida').length, color: 'border border-slate-300 bg-slate-100 text-slate-700' },
              { label: 'Canceladas', count: reservas.filter(r => r.status === 'cancelada').length, color: 'border border-rose-200 bg-rose-50 text-rose-700' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-900">{item.count}</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.color}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-slate-900">Próximos Check-ins</h2>
          <div className="space-y-4">
            {proximosCheckins.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Nenhum check-in próximo
              </p>
            ) : (
              proximosCheckins.map((reserva) => (
                <div key={reserva.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:bg-slate-100/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
                    <Users className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {reserva.hospede?.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(reserva.check_in)} · {reserva.quarto?.nome}
                    </p>
                    {reserva.hospede?.telefone && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="w-3 h-3" />
                        {formatPhone(reserva.hospede.telefone)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Reservas Recentes</h2>
          <a
            href="/admin/reservas"
            className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Hóspede</th>
                <th className="hidden px-6 py-3 text-left font-medium text-slate-500 lg:table-cell">Telefone</th>
                <th className="hidden px-6 py-3 text-left font-medium text-slate-500 sm:table-cell">Quarto</th>
                <th className="hidden px-6 py-3 text-left font-medium text-slate-500 md:table-cell">Check-in</th>
                <th className="hidden px-6 py-3 text-left font-medium text-slate-500 md:table-cell">Hóspedes</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Valor</th>
                <th className="hidden px-6 py-3 text-left font-medium text-slate-500 md:table-cell">Pagamento</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReservas.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{r.hospede?.nome}</p>
                    <p className="text-xs text-slate-500">{r.hospede?.email}</p>
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 lg:table-cell">
                    {r.hospede?.telefone ? formatPhone(r.hospede.telefone) : '-'}
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 sm:table-cell">{r.quarto?.nome}</td>
                  <td className="hidden px-6 py-4 text-slate-600 md:table-cell">{formatDate(r.check_in)}</td>
                  <td className="hidden px-6 py-4 text-slate-600 md:table-cell">{r.num_hospedes}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{formatCurrency(r.valor_total)}</td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        paymentStatusColors[r.stripe_payment_status || 'nao_iniciado'] ||
                        paymentStatusColors.nao_iniciado
                      }`}
                    >
                      {formatPaymentStatus(r.stripe_payment_status)}
                    </span>
                    {r.stripe_payment_status === 'pago' ? (
                      <p className="mt-1 text-[11px] text-emerald-700">
                        Débito confirmado
                        {r.payment_approved_at
                          ? ` em ${formatDate(r.payment_approved_at, 'dd/MM HH:mm')}`
                          : ''}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatPaymentMethod(r.stripe_payment_method)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[r.status]}`}>
                      {formatStatus(r.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Room Availability Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Disponibilidade de Hoje</h2>
            <p className="mt-1 text-xs text-slate-500">
              Leitura em tempo real baseada nas reservas ativas e quartos inativos
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {quartosComStatus.length} quartos monitorados
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ocupados</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{resumoQuartos.ocupados}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-slate-900" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pendentes</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{resumoQuartos.pendentes}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-amber-500/70" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Disponíveis</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{resumoQuartos.disponiveis}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-emerald-500/70" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Inativos</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{resumoQuartos.inativos}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-slate-400/80" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {quartosComStatus.map((item) => {
            const ocupado = item.status === 'ocupado';
            const pendente = item.status === 'pendente';
            const disponivel = item.status === 'disponivel';

            const cardClass = ocupado
              ? 'border-slate-300 bg-white'
              : pendente
                ? 'border-amber-200/80 bg-amber-50/50'
                : disponivel
                  ? 'border-emerald-200/70 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/70';

            const badgeClass = ocupado
              ? 'border border-slate-900 bg-slate-900 text-white'
              : pendente
                ? 'border border-amber-200 bg-amber-100 text-amber-800'
                : disponivel
                  ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                  : 'border border-slate-300 bg-slate-200 text-slate-700';

            return (
              <div
                key={item.quarto.id}
                className={`rounded-2xl border p-4 transition-all hover:shadow-sm ${cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.quarto.nome}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ocupado
                        ? 'Com hóspede em estadia hoje'
                        : pendente
                          ? 'Reserva aguardando confirmação'
                          : disponivel
                            ? 'Sem conflito de reserva para hoje'
                            : 'Quarto desativado no painel'}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClass}`}>
                    {ocupado ? (
                      <BedDouble className="w-3.5 h-3.5" />
                    ) : pendente ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : disponivel ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {ocupado ? 'Ocupado' : pendente ? 'Pendente' : disponivel ? 'Livre' : 'Inativo'}
                  </span>
                </div>

                {(ocupado || pendente) && item.reservaAtiva ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2">
                    <p className="truncate text-xs text-slate-600">
                      Hóspede <span className="font-medium text-slate-900">{item.reservaAtiva.hospede?.nome || 'Não informado'}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pendente
                        ? `Confirmação pendente para ${formatDate(item.reservaAtiva.check_in)}`
                        : `Saída prevista: ${formatDate(item.reservaAtiva.check_out)}`}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    {disponivel
                      ? 'Sem conflito de reserva para hoje.'
                      : 'Quarto desativado manualmente no painel.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
