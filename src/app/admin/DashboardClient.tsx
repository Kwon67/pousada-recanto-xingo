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
import { formatCurrency, formatDate, formatStatus, formatPhone } from '@/lib/formatters';
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
  if (eventType === 'login') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (eventType === 'access') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (eventType === 'logout') return 'bg-slate-200 text-slate-700 border-slate-300';
  return 'bg-red-100 text-red-700 border-red-200';
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Taxa de ocupação',
      value: `${estatisticas.taxaOcupacao}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Receita do mês',
      value: formatCurrency(estatisticas.receitaMes),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Pendentes',
      value: estatisticas.reservasPendentes,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ], [estatisticas]);

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
    pendente: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
    concluida: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral da pousada • {dashboardDateLabel}
        </p>
      </motion.div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link
              href={action.href}
              className="group block rounded-2xl border border-gray-200 bg-white px-4 py-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">{action.helper}</p>
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
            className="block bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-600" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                  {pendentes.length}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-base">
                  {pendentes.length} {pendentes.length === 1 ? 'reserva pendente' : 'reservas pendentes'} aguardando confirmação
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  Clique aqui para revisar e aprovar as reservas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pending reservations quick list */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {pendentes.slice(0, 3).map((r) => (
                <div key={r.id} className="bg-white rounded-xl px-3 py-2 text-sm border border-gray-100">
                  <p className="font-medium text-gray-700 truncate">{r.hospede?.nome}</p>
                  <p className="text-gray-400 text-xs">{r.quarto?.nome} · {formatDate(r.check_in)}</p>
                </div>
              ))}
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Auditoria de Acesso Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Autoatualiza a cada 30 segundos e quando a aba volta ao foco.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex w-fit items-center rounded-full px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium">
              {acessosRecentes.length} registro(s)
            </span>
            <span className="inline-flex w-fit items-center rounded-full px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium border border-red-100">
              {falhasRecentes} falha(s) recentes
            </span>
          </div>
        </div>

        {ultimoAcesso ? (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs text-gray-600">Última atividade registrada</p>
            <p className="mt-1 text-sm text-gray-900">
              <span className="font-semibold">{ultimoAcesso.username}</span>
              {' • '}
              {getEventLabel(ultimoAcesso.event_type)}
              {' • '}
              {formatDate(ultimoAcesso.created_at, 'dd/MM/yyyy HH:mm')}
            </p>
            <p className="mt-1 text-xs text-gray-600 truncate">
              {ultimoAcesso.ip ? `IP: ${ultimoAcesso.ip}` : 'IP não identificado'}
              {ultimoAcesso.path ? ` • Rota: ${ultimoAcesso.path}` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {acessosRecentes.map((acesso) => {
            const isMobile = getDeviceLabel(acesso.user_agent) === 'Mobile';
            return (
              <div
                key={acesso.id}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <UserRound className="w-4 h-4 text-gray-500" />
                    {acesso.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${getEventTone(acesso.event_type)}`}>
                      {getEventLabel(acesso.event_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-600 border border-gray-200">
                      {isMobile ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5" />
                      )}
                      {getDeviceLabel(acesso.user_agent)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formatDate(acesso.created_at, 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {acesso.ip || 'IP não identificado'}
                  {acesso.path ? ` • ${acesso.path}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupation Chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-6">Resumo de Reservas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Pendentes', count: pendentes.length, color: 'bg-amber-100 text-amber-700' },
              { label: 'Confirmadas', count: confirmadas.length, color: 'bg-green-100 text-green-700' },
              { label: 'Concluídas', count: reservas.filter(r => r.status === 'concluida').length, color: 'bg-blue-100 text-blue-700' },
              { label: 'Canceladas', count: reservas.filter(r => r.status === 'cancelada').length, color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-gray-50">
                <p className={`text-2xl font-bold`}>{item.count}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${item.color}`}>
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Próximos Check-ins</h2>
          <div className="space-y-4">
            {proximosCheckins.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhum check-in próximo
              </p>
            ) : (
              proximosCheckins.map((reserva) => (
                <div key={reserva.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {reserva.hospede?.nome}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(reserva.check_in)} · {reserva.quarto?.nome}
                    </p>
                    {reserva.hospede?.telefone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
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
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Reservas Recentes</h2>
          <a
            href="/admin/reservas"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Hóspede</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Telefone</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium hidden sm:table-cell">Quarto</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Check-in</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Hóspedes</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Valor</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentReservas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{r.hospede?.nome}</p>
                    <p className="text-xs text-gray-400">{r.hospede?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                    {r.hospede?.telefone ? formatPhone(r.hospede.telefone) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">{r.quarto?.nome}</td>
                  <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{formatDate(r.check_in)}</td>
                  <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{r.num_hospedes}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(r.valor_total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
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
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Disponibilidade de Hoje</h2>
            <p className="text-xs text-gray-500 mt-1">
              Atualizada automaticamente com base nas reservas ativas
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
            {quartosComStatus.length} quartos monitorados
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Ocupados</p>
            <p className="mt-1 text-2xl font-bold text-amber-900">{resumoQuartos.ocupados}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">Pendentes</p>
            <p className="mt-1 text-2xl font-bold text-orange-900">{resumoQuartos.pendentes}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Disponíveis</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{resumoQuartos.disponiveis}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Inativos</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{resumoQuartos.inativos}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {quartosComStatus.map((item) => {
            const ocupado = item.status === 'ocupado';
            const pendente = item.status === 'pendente';
            const disponivel = item.status === 'disponivel';

            const cardClass = ocupado
              ? 'border-amber-200 bg-amber-50'
              : pendente
                ? 'border-orange-200 bg-orange-50'
                : disponivel
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50';

            const badgeClass = ocupado
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : pendente
                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                : disponivel
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-200 text-slate-700 border border-slate-300';

            return (
              <div
                key={item.quarto.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-sm ${cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.quarto.nome}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ocupado
                        ? 'Ocupado hoje'
                        : pendente
                          ? 'Reserva pendente hoje'
                          : disponivel
                            ? 'Disponível hoje'
                            : 'Inativo'}
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
                  <div className="mt-3 rounded-lg bg-white/70 px-3 py-2">
                    <p className="text-xs text-gray-700 truncate">
                      Hóspede: <span className="font-medium">{item.reservaAtiva.hospede?.nome || 'Não informado'}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {pendente
                        ? `Confirmação pendente para ${formatDate(item.reservaAtiva.check_in)}`
                        : `Saída prevista: ${formatDate(item.reservaAtiva.check_out)}`}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-600">
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
