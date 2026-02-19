import { getReservas } from '@/lib/actions/reservas';
import { getQuartos } from '@/lib/actions/quartos';
import AdminReservasClient from '@/features/admin/reservas/containers/AdminReservasClient';
import { AdminRealtimeReservasRefresh } from '@/hooks/useRealtimeReservas';

export const dynamic = 'force-dynamic';

export default async function AdminReservasPage() {
  const [reservas, quartos] = await Promise.all([
    getReservas(),
    getQuartos(),
  ]);

  return (
    <>
      <AdminRealtimeReservasRefresh />
      <AdminReservasClient reservasIniciais={reservas} quartos={quartos} />
    </>
  );
}
