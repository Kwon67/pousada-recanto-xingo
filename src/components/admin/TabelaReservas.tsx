'use client';

import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Reserva } from '@/types/reserva';
import { formatCurrency, formatDate, formatDateTime, formatStatus, formatPhone } from '@/lib/formatters';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface TabelaReservasProps {
  reservas: Reserva[];
  onViewDetails?: (reserva: Reserva) => void;
}

export default function TabelaReservas({ reservas, onViewDetails }: TabelaReservasProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'cancelada':
        return 'error';
      case 'concluida':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg shadow-dark/5 overflow-hidden"
    >
      <div className="p-6 border-b border-cream-dark">
        <h2 className="font-display text-xl font-bold text-dark">
          Últimas Reservas
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cream">
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Criada em
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Hóspede
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light hidden lg:table-cell">
                Telefone
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Quarto
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light hidden md:table-cell">
                Check-in
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light hidden md:table-cell">
                Check-out
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light hidden lg:table-cell">
                Hóspedes
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Valor
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-light">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva, index) => (
              <tr
                key={reserva.id}
                className={cn(
                  'border-b border-cream-dark hover:bg-cream/50 transition-colors',
                  index === reservas.length - 1 && 'border-b-0'
                )}
              >
                <td className="px-6 py-4 text-sm text-text">
                  {formatDateTime(reserva.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-dark">
                      {reserva.hospede?.nome || 'N/A'}
                    </p>
                    <p className="text-xs text-text-light">
                      {reserva.hospede?.email || ''}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text hidden lg:table-cell">
                  {reserva.hospede?.telefone ? formatPhone(reserva.hospede.telefone) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {reserva.quarto?.nome || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-text hidden md:table-cell">
                  {formatDate(reserva.check_in)}
                </td>
                <td className="px-6 py-4 text-sm text-text hidden md:table-cell">
                  {formatDate(reserva.check_out)}
                </td>
                <td className="px-6 py-4 text-sm text-text hidden lg:table-cell">
                  {reserva.num_hospedes}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(reserva.status)} size="sm">
                    {formatStatus(reserva.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-dark">
                  {formatCurrency(reserva.valor_total)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetails?.(reserva)}
                    className="p-2 hover:bg-cream rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4 text-text-light" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reservas.length === 0 && (
        <div className="p-12 text-center text-text-light">
          Nenhuma reserva encontrada
        </div>
      )}
    </motion.div>
  );
}
