const REQUIRED_ENV_PRODUCTION = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RESEND_API_KEY',
] as const;

const RECOMMENDED_ENV_PRODUCTION = [
  'ADMIN_DELETE_PASSWORD',
  'RESERVA_PUBLIC_TOKEN_SECRET',
  'ADMIN_ALLOWED_ORIGINS',
] as const;

let alreadyValidated = false;

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function validateCriticalServerEnv(): void {
  if (alreadyValidated) return;
  alreadyValidated = true;

  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missingRequired: string[] = REQUIRED_ENV_PRODUCTION.filter(
    (key) => !hasText(process.env[key])
  );

  if (!hasText(process.env.SUPABASE_SECRET_KEY) && !hasText(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    missingRequired.push('SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missingRequired.length > 0) {
    throw new Error(
      `Configuração de ambiente incompleta em produção. Variáveis ausentes: ${missingRequired.join(', ')}.`
    );
  }

  const missingRecommended = RECOMMENDED_ENV_PRODUCTION.filter(
    (key) => !hasText(process.env[key])
  );

  if (missingRecommended.length > 0) {
    console.warn(
      `[security] Variáveis recomendadas ausentes em produção: ${missingRecommended.join(', ')}.`
    );
  }
}
