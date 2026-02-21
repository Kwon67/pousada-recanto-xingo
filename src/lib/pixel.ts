export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/** Dispara PageView — chamado automaticamente pelo script no layout */
export function pageview(): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

/** Dispara um evento padrão do Meta Pixel */
export function event(name: string, options: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
}
