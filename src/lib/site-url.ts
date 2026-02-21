const FALLBACK_SITE_URL = 'https://recantoxingo.com.br';

export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    FALLBACK_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
