# Pousada Recanto do Matuto Xingó

Projeto em Next.js + Supabase com reservas e painel admin.

## Rodar local

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Configure no `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL="Pousada Recanto do Matuto <no-reply@seudominio.com>"
ADMIN_NOTIFICATION_EMAIL=

ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_DELETE_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_SITE_URL=https://pousada-recanto-xingo.vercel.app

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PAYMENT_METHOD_TYPES=card,pix
STRIPE_WEBHOOK_TOLERANCE_SECONDS=300
```

## Stripe (checkout + webhook)

Webhook do Stripe:

```text
POST /api/stripe/webhook
```

Eventos necessários:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

Localmente com Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Depois copie o `whsec_...` retornado e salve em `STRIPE_WEBHOOK_SECRET`.

## Banco (Supabase)

A migration de pagamento Stripe está em:

```text
supabase/migrations/016_add_stripe_pagamentos_reservas.sql
```

Aplicar com seu fluxo de migrations do Supabase antes de usar em produção.

## Deploy na Vercel

1. Suba o repositório na Vercel.
2. Configure todas as variáveis acima em `Project Settings > Environment Variables`.
3. Faça deploy.
4. Crie o webhook no Stripe apontando para:

```text
https://pousada-recanto-xingo.vercel.app/api/stripe/webhook
```

5. Copie o `whsec_...` do endpoint e salve em `STRIPE_WEBHOOK_SECRET`.
6. Redeploy para carregar o segredo do webhook.
