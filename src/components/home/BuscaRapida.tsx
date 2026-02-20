'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Users } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/button';
import { addDays } from 'date-fns';
import { motion } from 'framer-motion';

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
    <section className="relative z-50 -mt-10 pb-8 sm:-mt-16 md:-mt-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[#0A161E] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-md p-6 lg:p-8 relative"
        >
          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none noise-bg mix-blend-overlay"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
            {/* Check-in */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-widest text-white/50 uppercase mb-3">Chegada</label>
              <div className="dark-theme-picker">
                <DatePicker
                  label=""
                  value={checkIn}
                  onChange={(date) => {
                    setCheckIn(date);
                    if (checkOut && date >= checkOut) {
                      setCheckOut(addDays(date, 1));
                    }
                  }}
                  minDate={today}
                  className="bg-cream border-transparent text-dark hover:border-primary/30 rounded-none"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-widest text-white/50 uppercase mb-3">Partida</label>
              <div className="dark-theme-picker">
                <DatePicker
                  label=""
                  value={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                  className="bg-cream border-transparent text-dark hover:border-primary/30 rounded-none"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-semibold tracking-widest text-white/50 uppercase mb-3">Hóspedes</label>
              <div className="flex gap-3">
                {[
                  { value: 1, label: '01', icon: <User className="w-4 h-4" /> },
                  { value: 2, label: '02', icon: <Users className="w-4 h-4" /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGuests(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-none border transition-all duration-300 ${
                      guests === opt.value
                        ? 'border-secondary bg-secondary text-black'
                        : 'border-white/10 bg-transparent text-white/70 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    {opt.icon}
                    <span className="font-display font-bold text-sm tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              variant="luxury"
              className="md:self-end w-full h-[50px] text-sm uppercase tracking-widest font-bold rounded-none"
            >
              <Search className="w-4 h-4 mr-2" />
              Pesquisar
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
