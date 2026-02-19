import { getEstatisticas, getReservas } from '@/lib/actions/reservas';
import { getQuartos } from '@/lib/actions/quartos';
import { getUltimosAcessosAdmin } from '@/lib/actions/admin-auditoria';
import AdminDashboardClient from '@/features/admin/dashboard/containers/AdminDashboardClient';
import { AdminRealtimeReservasRefresh } from '@/hooks/useRealtimeReservas';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [estatisticas, reservas, quartos, acessosAdmin] = await Promise.all([
    getEstatisticas(),
    getReservas(),
    getQuartos(),
    getUltimosAcessosAdmin(24),
  ]);

  return (
    <>
      <AdminRealtimeReservasRefresh />
      <AdminDashboardClient
        estatisticas={estatisticas}
        reservas={reservas}
        quartos={quartos}
        acessosAdmin={acessosAdmin}
      />
    </>
  );
}
