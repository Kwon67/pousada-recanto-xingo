import { getEstatisticas, getReservas } from '@/lib/actions/reservas';
import { getQuartos } from '@/lib/actions/quartos';
import { getUltimosAcessosAdmin } from '@/lib/actions/admin-auditoria';
import AdminDashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [estatisticas, reservas, quartos, acessosAdmin] = await Promise.all([
    getEstatisticas(),
    getReservas(),
    getQuartos(),
    getUltimosAcessosAdmin(24),
  ]);

  return (
    <AdminDashboardClient
      estatisticas={estatisticas}
      reservas={reservas}
      quartos={quartos}
      acessosAdmin={acessosAdmin}
    />
  );
}
