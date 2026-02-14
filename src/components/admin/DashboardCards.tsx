'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

function DashboardCard({ title, value, icon, trend, trendUp, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-lg shadow-dark/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-light text-sm mb-1">{title}</p>
          <p className="font-display text-3xl font-bold text-dark">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-success' : 'text-error'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface DashboardCardsProps {
  totalReservas: number;
  taxaOcupacao: number;
  receitaMes: number;
  reservasPendentes: number;
}

export default function DashboardCards({
  totalReservas,
  taxaOcupacao,
  receitaMes,
  reservasPendentes,
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Reservas este mês"
        value={totalReservas}
        icon={<Calendar className="w-6 h-6" />}
        trend="+12% vs mês anterior"
        trendUp
        delay={0}
      />
      <DashboardCard
        title="Taxa de Ocupação"
        value={`${taxaOcupacao}%`}
        icon={<TrendingUp className="w-6 h-6" />}
        trend="+5% vs mês anterior"
        trendUp
        delay={0.1}
      />
      <DashboardCard
        title="Receita do Mês"
        value={formatCurrency(receitaMes)}
        icon={<DollarSign className="w-6 h-6" />}
        trend="+18% vs mês anterior"
        trendUp
        delay={0.2}
      />
      <DashboardCard
        title="Reservas Pendentes"
        value={reservasPendentes}
        icon={<Clock className="w-6 h-6" />}
        delay={0.3}
      />
    </div>
  );
}
