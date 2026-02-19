'use client';

export interface UploadResult {
  url: string;
  public_id: string;
  resource_type?: string;
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json() as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export async function uploadFile(file: File, folder?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Erro ao enviar arquivo'));
  }

  return response.json() as Promise<UploadResult>;
}

export async function deleteUploadedFile(publicId: string): Promise<void> {
  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_id: publicId }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Erro ao deletar arquivo'));
  }
}
