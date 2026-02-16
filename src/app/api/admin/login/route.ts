import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSession, validateAdminCredentials } from '@/lib/admin-auth';
import { registrarAcessoAdmin } from '@/lib/admin-audit';
import {
  checkAdminLoginRateLimit,
  recordFailedAdminLoginAttempt,
  resetFailedAdminLoginAttempts,
} from '@/lib/admin-rate-limit';
import { isSameOriginRequest } from '@/lib/request-origin';

function setRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  retryAfterSeconds: number
) {
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(remaining, 0)));
  if (retryAfterSeconds > 0) {
    response.headers.set('Retry-After', String(retryAfterSeconds));
  }
}

function getMaxAttemptsFromEnv(): number {
  const fromEnv = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS);
  if (!Number.isFinite(fromEnv)) return 5;
  return Math.min(Math.max(Math.round(fromEnv), 3), 20);
}

async function delayOnFailure(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 450);
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Origem inválida para login.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Preencha usuário e senha.' },
        { status: 400 }
      );
    }

    const rateLimitState = await checkAdminLoginRateLimit(request, username);
    const maxAttempts = getMaxAttemptsFromEnv();

    if (!rateLimitState.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error:
            'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
          retryAfterSeconds: rateLimitState.retryAfterSeconds,
        },
        { status: 429 }
      );
      setRateLimitHeaders(
        response,
        maxAttempts,
        rateLimitState.remainingAttempts,
        rateLimitState.retryAfterSeconds
      );
      return response;
    }

    const result = await validateAdminCredentials(username, password);
    if (!result.success) {
      await delayOnFailure();
      const status = result.error.includes('não configuradas') ? 500 : 401;
      if (status !== 500) {
        recordFailedAdminLoginAttempt(request, username);
        await registrarAcessoAdmin({
          request,
          username,
          eventType: 'login_failed',
          path: '/admin/login',
        });
      }

      const updatedRateLimitState =
        status === 500 ? rateLimitState : await checkAdminLoginRateLimit(request, username);
      const blockedNow = status !== 500 && !updatedRateLimitState.allowed;
      const response = NextResponse.json(
        {
          success: false,
          error: blockedNow
            ? 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.'
            : result.error,
          retryAfterSeconds: updatedRateLimitState.retryAfterSeconds || undefined,
        },
        { status: blockedNow ? 429 : status }
      );

      setRateLimitHeaders(
        response,
        maxAttempts,
        updatedRateLimitState.remainingAttempts,
        updatedRateLimitState.retryAfterSeconds
      );

      return response;
    }

    resetFailedAdminLoginAttempts(request, username);
    const session = await getAdminSession(result.sessionValue);

    const response = NextResponse.json({
      success: true,
      user: { id: 'admin', email: username.toLowerCase(), name: 'Administrador' },
      session: {
        expiresAt: session?.expiresAt ?? null,
        issuedAt: session?.issuedAt ?? null,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, result.sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: result.maxAgeSeconds,
      priority: 'high',
    });

    await registrarAcessoAdmin({
      request,
      username,
      eventType: 'login',
      path: '/admin/login',
    });

    setRateLimitHeaders(response, maxAttempts, maxAttempts, 0);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Não foi possível fazer login.' },
      { status: 500 }
    );
  }
}
