export const SITE_CONFIG = {
  name: 'Pousada Recanto do Matuto Xingó',
  description: 'Seu refúgio às margens do Canyon do Xingó',
  url: 'https://pousada-recanto-xingo.vercel.app',
  phone: '(82) 98133-4027',
  phoneClean: '82981334027',
  email: 'kivora.dev@outlook.com',
  address: 'Piranhas, Alagoas',
  mapsLink: 'https://maps.app.goo.gl/JsXxNX8P2N5qaGF48',
  mapsEmbedLink:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.842043198745!2d-37.7761691!3d-9.6088661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70f33b4a458b90f%3A0xcd4fa1c1bba7eeec!2sPousada%20Recanto%20do%20Matuto!5e0!3m2!1spt-BR!2sbr!4v1771311080462!5m2!1spt-BR!2sbr',
  instagram: '@recantodomatutoxingo',
  checkIn: '14:00',
  checkOut: '12:00',
  developer: 'Kivora Inc.',
  year: new Date().getFullYear(),
};

export const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/quartos', label: 'Quartos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

export const CATEGORIAS_QUARTO = [
  { value: 'todos', label: 'Todos' },
  { value: 'standard', label: 'Standard' },
  { value: 'superior', label: 'Superior' },
  { value: 'suite', label: 'Suíte' },
];

export const CAPACIDADES = [
  { value: 1, label: '1 hóspede' },
  { value: 2, label: '2 hóspedes' },
  { value: 3, label: '3 hóspedes' },
  { value: 4, label: '4 hóspedes' },
];

export const STATUS_COLORS = {
  pendente: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning',
  },
  confirmada: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success',
  },
  cancelada: {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error',
  },
  concluida: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary',
  },
};

export const AMENIDADES_ICONS: Record<string, string> = {
  'Banheiro privativo': 'Bath',
  'Wi-Fi': 'Wifi',
  'Ar-condicionado': 'AirVent',
  'TV': 'Tv',
  'TV Smart': 'Tv',
  'Frigobar': 'Refrigerator',
  'Ventilador': 'Fan',
  'Roupão': 'Shirt',
  'Roupa de cama': 'BedDouble',
  'Roupa de cama premium': 'BedDouble',
  'Toalhas': 'Shirt',
  'Espelho grande': 'Square',
  'Cama extra': 'BedSingle',
};

export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/recantodomatutoxingo',
    icon: 'Instagram',
  },
  {
    name: 'WhatsApp',
    href: `https://wa.me/55${SITE_CONFIG.phoneClean}`,
    icon: 'MessageCircle',
  },
];

export const WHATSAPP_MESSAGE = 'Olá! Vim pelo site e gostaria de mais informações sobre a pousada.';

export const ASSUNTOS_CONTATO = [
  { value: 'reserva', label: 'Fazer uma reserva' },
  { value: 'informacao', label: 'Informações gerais' },
  { value: 'grupo', label: 'Reserva para grupo' },
  { value: 'evento', label: 'Evento especial' },
  { value: 'parceria', label: 'Parceria' },
  { value: 'outro', label: 'Outro assunto' },
];
