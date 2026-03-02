'use client';

import { useEffect } from 'react';

interface AbacatePayCheckoutProps {
  paymentUrl: string;
}

export default function AbacatePayCheckout({ paymentUrl }: AbacatePayCheckoutProps) {
  useEffect(() => {
    // Redirect to AbacatePay payment page
    window.location.href = paymentUrl;
  }, [paymentUrl]);

  return (
    <div className="w-full bg-white rounded-none border border-dark/10 p-8 text-center">
      <div className="animate-pulse mb-4">
        <div className="w-16 h-16 bg-dark/10 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-8 h-8 text-dark/40 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
      <p className="text-dark font-bold uppercase tracking-widest text-sm mb-2">
        Redirecionando para pagamento...
      </p>
      <p className="text-dark/60 text-xs uppercase tracking-widest">
        Você será levado para a página de pagamento PIX
      </p>
      <a
        href={paymentUrl}
        className="inline-block mt-6 text-sm font-bold uppercase tracking-widest text-dark underline hover:no-underline"
      >
        Clique aqui se não for redirecionado
      </a>
    </div>
  );
}
