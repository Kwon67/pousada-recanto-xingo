import type { NextRequest } from 'next/server';

export const LEGACY_ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_COOKIE =
  process.env.NODE_ENV === 'production' ? '__Host-admin_session' : LEGACY_ADMIN_SESSION_COOKIE;

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12;
const MIN_SESSION_TTL_SECONDS = 60 * 15;
const MAX_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const DEV_FALLBACK_SECRET = generateRandomHex(32);

interface AdminSessionPayload {
  u: string;
  iat: number;
  exp: number;
  sid: string;
}

export interface AdminSession {
  username: string;
  issuedAt: number;
  expiresAt: number;
  sessionId: string;
}

interface AdminValidationSuccess {
  success: true;
  sessionValue: string;
  maxAgeSeconds: number;
}

interface AdminValidationError {
  success: false;
  error: string;
}

type AdminValidationResult = AdminValidationSuccess | AdminValidationError;

function generateRandomHex(byteLength: number): string {
  if (!globalThis.crypto?.getRandomValues) {
    return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }

  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (base64.length % 4)) % 4;
  return `${base64}${'='.repeat(paddingLength)}`;
}

function encodeBase64Url(value: string): string {
  return toBase64Url(bytesToBase64(textEncoder.encode(value)));
}

function decodeBase64Url(value: string): string {
  return textDecoder.decode(base64ToBytes(fromBase64Url(value)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index] ^ b[index];
  }
  return mismatch === 0;
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', textEncoder.encode(input));
  return new Uint8Array(digest);
}

async function secureStringEqual(a: string, b: string): Promise<boolean> {
  const [aHash, bHash] = await Promise.all([sha256(a), sha256(b)]);
  return constantTimeEqual(aHash, bHash);
}

async function signPayload(payloadBase64Url: string, secret: string): Promise<Uint8Array> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(payloadBase64Url)
  );

  return new Uint8Array(signature);
}

function getSessionTtlSeconds(): number {
  const fromEnv = Number(process.env.ADMIN_SESSION_TTL_SECONDS);
  if (!Number.isFinite(fromEnv)) return DEFAULT_SESSION_TTL_SECONDS;
  return Math.min(Math.max(Math.round(fromEnv), MIN_SESSION_TTL_SECONDS), MAX_SESSION_TTL_SECONDS);
}

function getAdminEnv() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  // Fallback only for local/dev to avoid lockout when env is missing.
  if (process.env.NODE_ENV !== 'production') {
    return {
      username: username || 'admin',
      password: password || 'admin123',
      secret: secret || DEV_FALLBACK_SECRET,
    };
  }

  return {
    username,
    password,
    secret,
  };
}

export function getAdminSessionCookieNames(): string[] {
  const names = [ADMIN_SESSION_COOKIE, LEGACY_ADMIN_SESSION_COOKIE];
  return Array.from(new Set(names));
}

function getSessionCookieValue(request: NextRequest): string | null {
  for (const cookieName of getAdminSessionCookieNames()) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) return cookieValue;
  }

  return null;
}

function buildSessionPayload(username: string, maxAgeSeconds: number): AdminSessionPayload {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    u: username,
    iat: nowSeconds,
    exp: nowSeconds + maxAgeSeconds,
    sid: generateRandomHex(16),
  };
}

async function createSessionToken(payload: AdminSessionPayload, secret: string): Promise<string> {
  const payloadBase64Url = encodeBase64Url(JSON.stringify(payload));
  const signature = await signPayload(payloadBase64Url, secret);
  const signatureBase64Url = toBase64Url(bytesToBase64(signature));
  return `${payloadBase64Url}.${signatureBase64Url}`;
}

async function parseSessionToken(
  sessionValue: string,
  secret: string,
  expectedUsername?: string
): Promise<AdminSessionPayload | null> {
  const parts = sessionValue.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const [payloadPart, signaturePart] = parts;

  let providedSignature: Uint8Array;
  try {
    providedSignature = base64ToBytes(fromBase64Url(signaturePart));
  } catch {
    return null;
  }

  const expectedSignature = await signPayload(payloadPart, secret);

  if (!constantTimeEqual(providedSignature, expectedSignature)) return null;

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(decodeBase64Url(payloadPart)) as AdminSessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload.u !== 'string' ||
    typeof payload.sid !== 'string' ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) return null;
  if (payload.iat > nowSeconds + 60) return null;
  if (expectedUsername && payload.u !== expectedUsername) return null;

  return payload;
}

export async function createAdminSession(username: string): Promise<{
  sessionValue: string;
  maxAgeSeconds: number;
}> {
  const { secret } = getAdminEnv();
  if (!secret) {
    throw new Error('Segredo de sessão admin não configurado no servidor.');
  }

  const maxAgeSeconds = getSessionTtlSeconds();
  const payload = buildSessionPayload(username, maxAgeSeconds);
  const sessionValue = await createSessionToken(payload, secret);
  return { sessionValue, maxAgeSeconds };
}

export async function getAdminSession(sessionValue?: string | null): Promise<AdminSession | null> {
  const { username: expectedUsername, secret } = getAdminEnv();
  if (!sessionValue || !secret) return null;

  const payload = await parseSessionToken(sessionValue, secret, expectedUsername);
  if (!payload) return null;

  return {
    username: payload.u,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
    sessionId: payload.sid,
  };
}

export async function hasValidAdminSession(sessionValue?: string | null): Promise<boolean> {
  return Boolean(await getAdminSession(sessionValue));
}

export async function getAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  return getAdminSession(getSessionCookieValue(request));
}

export async function hasAdminSessionFromRequest(request: NextRequest): Promise<boolean> {
  return hasValidAdminSession(getSessionCookieValue(request));
}

export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<AdminValidationResult> {
  const env = getAdminEnv();

  if (!env.username || !env.password || !env.secret) {
    return { success: false, error: 'Credenciais do admin não configuradas no servidor.' };
  }

  const [usernameMatches, passwordMatches] = await Promise.all([
    secureStringEqual(username, env.username),
    secureStringEqual(password, env.password),
  ]);

  if (!usernameMatches || !passwordMatches) {
    return { success: false, error: 'Usuário ou senha inválidos.' };
  }

  const session = await createAdminSession(env.username);
  return {
    success: true,
    sessionValue: session.sessionValue,
    maxAgeSeconds: session.maxAgeSeconds,
  };
}
