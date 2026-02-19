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

export function calcularValorTotal(precoPorNoite: number, checkIn: Date, checkOut: Date) {
  return precoPorNoite * calcularNoites(checkIn, checkOut);
}
