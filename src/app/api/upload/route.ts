import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getAdminSessionCookieNames, hasValidAdminSession } from '@/lib/admin-auth';
import { isSameOriginRequest } from '@/lib/request-origin';

function getSessionCookieValue(request: NextRequest): string | null {
  return getAdminSessionCookieNames()
    .map((cookieName) => request.cookies.get(cookieName)?.value ?? null)
    .find((cookieValue) => Boolean(cookieValue)) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
    }

    const session = getSessionCookieValue(request);
    if (!(await hasValidAdminSession(session))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'pousada-recanto-xingo/quartos';

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const isVideo = allowedVideoTypes.includes(file.type);
    const isImage = allowedImageTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP, AVIF, MP4 ou WebM.' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo ${isVideo ? '50MB' : '10MB'}.` },
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
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
    }

    const session = getSessionCookieValue(request);
    if (!(await hasValidAdminSession(session))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'public_id é obrigatório' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    );
  }
}
