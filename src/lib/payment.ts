export interface ReservaPaymentSnapshot {
  valor_total: number;
  valor_pago?: number | null;
  stripe_payment_status?: string | null;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getExpectedDepositAmount(valorTotal: number): number {
  return roundCurrency(valorTotal / 2);
}

export function getReservaPaidAmount(reserva: ReservaPaymentSnapshot): number {
  if (typeof reserva.valor_pago === 'number' && reserva.valor_pago > 0) {
    return roundCurrency(reserva.valor_pago);
  }

  if (reserva.stripe_payment_status === 'pago') {
    return getExpectedDepositAmount(reserva.valor_total);
  }

  return 0;
}

export function getReservaOutstandingAmount(reserva: ReservaPaymentSnapshot): number {
  return Math.max(roundCurrency(reserva.valor_total - getReservaPaidAmount(reserva)), 0);
}

export function normalizePaymentMethod(method?: string | null): string | null {
  if (!method) return null;

  const normalized = method.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (!normalized) return null;

  if (['pix'].includes(normalized)) return 'pix';
  if (
    [
      'card',
      'cartao',
      'cartaocredito',
      'creditcard',
      'credit',
      'credito',
      'debitcard',
      'debit',
      'debito',
    ].includes(normalized)
  ) {
    return 'card';
  }
  if (['boleto'].includes(normalized)) return 'boleto';

  return method.trim().toLowerCase();
}

