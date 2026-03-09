import { HOSPEDIN_BOOKING_URL } from './constants';
import { event as fbEvent } from './pixel';

/**
 * Dispara eventos de tracking e abre o Motor de Reservas Hospedin em nova aba.
 * @param location — identificador de onde o clique aconteceu (ex: "navbar", "hero", "footer")
 */
export function trackAndOpenBooking(location: string): void {
  // GA4 event (descomentar quando configurar o Google Analytics)
  // window.gtag?.('event', 'click_reserve_button', { location });

  // Meta Pixel — InitiateCheckout
  fbEvent('InitiateCheckout', {
    content_category: 'booking',
    content_name: location,
  });

  window.open(HOSPEDIN_BOOKING_URL, '_blank', 'noopener,noreferrer');
}
