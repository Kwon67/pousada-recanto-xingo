'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Star, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedImage {
  url: string;
  public_id: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  label?: string;
  error?: string;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  label,
  error,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro no upload');
      }

      return await response.json();
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      return null;
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;
      const toUpload = fileArray.slice(0, remaining);

      if (toUpload.length === 0) return;

      setUploadingCount(toUpload.length);

      const results = await Promise.all(toUpload.map(uploadFile));
      const successful = results.filter(Boolean) as UploadedImage[];

      onChange([...images, ...successful]);
      setUploadingCount(0);
    },
    [images, maxImages, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = async (index: number) => {
    const image = images[index];

    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: image.public_id }),
      });
    } catch {
      // Continue removing from UI even if Cloudinary delete fails
    }

    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrincipal = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange(updated);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-cream-dark hover:border-primary/50 hover:bg-cream',
          error && 'border-error'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2">
          {uploadingCount > 0 ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-light">
                Enviando {uploadingCount} {uploadingCount === 1 ? 'imagem' : 'imagens'}...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-text-light" />
              <p className="text-sm text-text-light">
                Arraste imagens aqui ou <span className="text-primary font-medium">clique para selecionar</span>
              </p>
              <p className="text-xs text-text-light/60">
                JPEG, PNG, WebP ou AVIF - Máx. 10MB cada - {images.length}/{maxImages} imagens
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((image, index) => (
            <div
              key={`${image.public_id || image.url}-${index}`}
              className="relative group aspect-[4/3] rounded-xl overflow-hidden border-2 border-cream-dark"
            >
              <img
                src={image.url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Principal badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-secondary text-dark text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Principal
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-dark/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrincipal(index);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-secondary transition-colors"
                    title="Definir como principal"
                    aria-label="Definir como imagem principal"
                  >
                    <Star className="w-4 h-4 text-dark" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-red-100 transition-colors"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Placeholder slots */}
          {images.length < maxImages && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-cream-dark hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-text-light/40" />
              <span className="text-xs text-text-light/40 mt-1">Adicionar</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
