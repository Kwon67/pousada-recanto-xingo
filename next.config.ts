import type { NextConfig } from 'next';

function getOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getHost(value: string | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function buildContentSecurityPolicy(): string {
  const supabaseOrigin = getOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseHost = getHost(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : null;

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'script-src': uniqueValues([
      "'self'",
      "'unsafe-inline'",
      'https://js.stripe.com',
      'https://connect.facebook.net',
      'https://www.googletagmanager.com',
    ]),
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': uniqueValues([
      "'self'",
      'data:',
      'blob:',
      'https://res.cloudinary.com',
      'https://www.facebook.com',
      'https://placehold.co',
    ]),
    'font-src': uniqueValues(["'self'", 'data:', 'https://fonts.gstatic.com']),
    'connect-src': uniqueValues([
      "'self'",
      supabaseOrigin,
      supabaseWss,
      'https://api.stripe.com',
      'https://r.stripe.com',
      'https://m.stripe.network',
      'https://connect.facebook.net',
      'https://www.facebook.com',
      'https://graph.facebook.com',
    ]),
    'frame-src': uniqueValues([
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://checkout.stripe.com',
    ]),
    'media-src': uniqueValues(["'self'", 'blob:', 'data:', 'https://res.cloudinary.com']),
    'form-action': ["'self'"],
  };

  if (process.env.NODE_ENV === 'production') {
    directives['upgrade-insecure-requests'] = [];
  }

  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

function buildSecurityHeaders() {
  const headers = [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ];

  if (process.env.NODE_ENV === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: '60mb',
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
