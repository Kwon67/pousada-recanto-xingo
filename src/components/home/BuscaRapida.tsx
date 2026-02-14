'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Users } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import { addDays } from 'date-fns';

export default function BuscaRapida() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn.toISOString());
    if (checkOut) params.set('checkOut', checkOut.toISOString());
    params.set('guests', guests.toString());

    router.push(`/reservas?${params.toString()}`);
  };

  const today = new Date();

  return (
    <section className="relative z-30 -mt-10 pb-8 sm:-mt-14 md:-mt-24">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-end">
            {/* Check-in */}
            <div className="relative">
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (checkOut && date >= checkOut) {
                    setCheckOut(addDays(date, 1));
                  }
                }}
                minDate={today}
              />
            </div>

            {/* Check-out */}
            <div className="relative">
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={setCheckOut}
                minDate={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Hóspedes</label>
              <div className="flex gap-2">
                {[
                  { value: 1, label: '1', icon: <User className="w-4 h-4" /> },
                  { value: 2, label: '2', icon: <Users className="w-4 h-4" /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGuests(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                      guests === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-cream-dark bg-white text-text-light hover:border-primary/40'
                    }`}
                  >
                    {opt.icon}
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              fullWidth
              size="lg"
              leftIcon={<Search className="w-5 h-5" />}
              className="md:self-end"
            >
              Verificar disponibilidade
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
