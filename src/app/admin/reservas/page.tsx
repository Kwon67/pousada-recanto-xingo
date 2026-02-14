import { getReservas } from '@/lib/actions/reservas';
import { getQuartos } from '@/lib/actions/quartos';
import AdminReservasClient from './ReservasClient';

export const dynamic = 'force-dynamic';

export default async function AdminReservasPage() {
  const [reservas, quartos] = await Promise.all([
    getReservas(),
    getQuartos(),
  ]);

  return <AdminReservasClient reservasIniciais={reservas} quartos={quartos} />;
}
