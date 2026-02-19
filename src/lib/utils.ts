import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWhatsAppLink(phone: string, message?: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = new URL(`https://wa.me/${cleanPhone}`);
  if (message) {
    url.searchParams.set('text', message);
  }
  return url.toString();
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calcularNoites(checkIn: Date, checkOut: Date) {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function calcularValorTotal(
  arg1: number | Date,
  arg2: Date,
  arg3: Date | number,
  arg4?: number
) {
  // Backward compatibility: supports both (preco, checkIn, checkOut)
  // and (checkIn, checkOut, precoDiaria, precoFds).
  if (typeof arg1 === 'number' && arg3 instanceof Date) {
    return arg1 * calcularNoites(arg2, arg3);
  }

  if (!(arg1 instanceof Date) || typeof arg3 !== 'number') {
    throw new Error('Assinatura inválida para calcularValorTotal');
  }

  const checkIn = arg1;
  const checkOut = arg2;
  const precoDiaria = arg3;
  const precoFds = arg4 ?? precoDiaria;

  let total = 0;
  const currentDate = new Date(checkIn);

  while (currentDate < checkOut) {
    total += isWeekend(currentDate) ? precoFds : precoDiaria;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return total;
}
