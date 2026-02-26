import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getAdminSessionCookieNames, hasValidAdminSession } from '@/lib/admin-auth';
import { isSameOriginRequest } from '@/lib/request-origin';
import { validateCriticalServerEnv } from '@/lib/env-validation';

const DEFAULT_UPLOAD_FOLDER = 'pousada-recanto-xingo/quartos';
const ALLOWED_UPLOAD_ROOTS = [
  'pousada-recanto-xingo/quartos',
  'pousada-recanto-xingo/galeria',
  'pousada-recanto-xingo/conteudo',
];

function getSessionCookieValue(request: NextRequest): string | null {
  return getAdminSessionCookieNames()
    .map((cookieName) => request.cookies.get(cookieName)?.value ?? null)
    .find((cookieValue) => Boolean(cookieValue)) ?? null;
}

function isAllowedManagedPath(path: string): boolean {
  return ALLOWED_UPLOAD_ROOTS.some(
    (root) => path === root || path.startsWith(`${root}/`)
  );
}

function normalizeFolder(raw: FormDataEntryValue | null): string | null {
  if (!raw) return DEFAULT_UPLOAD_FOLDER;
  if (typeof raw !== 'string') return null;

  const normalized = raw.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return DEFAULT_UPLOAD_FOLDER;
  if (normalized.length > 160) return null;
  if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) return null;
  if (normalized.includes('..')) return null;

  return isAllowedManagedPath(normalized) ? normalized : null;
}

function normalizePublicId(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return null;
  if (normalized.length > 220) return null;
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(normalized)) return null;
  if (normalized.includes('..')) return null;
  if (!isAllowedManagedPath(normalized)) return null;

  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    validateCriticalServerEnv();

    if (!isSameOriginRequest(request, { requireOriginForStateChanging: true })) {
      return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
    }

    const session = getSessionCookieValue(request);
    if (!(await hasValidAdminSession(session))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = normalizeFolder(formData.get('folder'));

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'Pasta de upload inválida.' },
        { status: 400 }
      );
    }

    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif',
    ];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const isVideo = allowedVideoTypes.includes(file.type);
    const isImage = allowedImageTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP, AVIF, HEIC, HEIF, MP4, WebM ou MOV.' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? 60 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo ${isVideo ? '60MB' : '20MB'}.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use data URI with uploader.upload() — handles resource_type: 'auto' correctly
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: 'auto',
    };

    if (isImage) {
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto', format: 'auto' },
      ];
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    const message = error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateCriticalServerEnv();

    if (!isSameOriginRequest(request, { requireOriginForStateChanging: true })) {
      return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
    }

    const session = getSessionCookieValue(request);
    if (!(await hasValidAdminSession(session))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json() as { public_id?: unknown };
    const publicId = normalizePublicId(body?.public_id);

    if (!publicId) {
      return NextResponse.json(
        { error: 'public_id inválido.' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    );
  }
}
