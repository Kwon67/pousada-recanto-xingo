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

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou AVIF.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'pousada-recanto-xingo/quartos',
              transformation: [
                { width: 1920, height: 1080, crop: 'limit', quality: 'auto', format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
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
