'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  X,
  Plus,
  Star,
  ImageIcon,
  Film,
  Pencil,
  Loader2,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { uploadFile } from '@/lib/api/upload-client';
import ConfirmDialog from '@/features/admin/shared/components/ConfirmDialog';
import DataState from '@/features/admin/shared/components/DataState';
import EmptyState from '@/features/admin/shared/components/EmptyState';
import PageHeader from '@/features/admin/shared/components/PageHeader';
import {
  getGaleria,
  adicionarFoto,
  atualizarFoto,
  toggleDestaqueFoto,
  deletarFoto,
  getGaleriaDuplicates,
} from '@/lib/actions/galeria';
import type { GaleriaItem } from '@/lib/actions/galeria';

const CATEGORIAS = [
  { value: 'momentos', label: 'Home - Seção Momentos (galeria pública)' },
  { value: 'hero_logo', label: 'Home - Logo Principal do Hero' },
  { value: 'hero_background', label: 'Home - Imagem de Fundo do Hero' },
  { value: 'home_sobre', label: 'Home - Seção Sobre (slider)' },
  { value: 'home_estrutura_1', label: 'Home - Estrutura: Piscina' },
  { value: 'home_estrutura_2', label: 'Home - Estrutura: Área de Redes' },
  { value: 'home_estrutura_3', label: 'Home - Estrutura: Churrasqueira' },
  { value: 'home_estrutura_4', label: 'Home - Estrutura: Chuveirão' },
  { value: 'home_estrutura_5', label: 'Home - Estrutura: Espaço Amplo' },
  { value: 'home_estrutura_6', label: 'Home - Estrutura: Banheiro Privativo' },
];

const LEGACY_MOMENTOS_CATEGORIES = new Set(['pousada', 'quartos', 'area_lazer', 'cafe']);

const ACCEPTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
].join(',');

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 60 * 1024 * 1024;

function isLikelyVideoUrl(url: string): boolean {
  return /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function isLikelyVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
}

function formatAreaLabel(categoria: string | null | undefined): string {
  if (!categoria) return 'Sem área';
  if (LEGACY_MOMENTOS_CATEGORIES.has(categoria)) {
    return 'Home - Seção Momentos (legado)';
  }
  const match = CATEGORIAS.find((item) => item.value === categoria);
  return match?.label || categoria;
}

function normalizeCategoriaForSelect(categoria: string | null | undefined): string {
  if (!categoria || LEGACY_MOMENTOS_CATEGORIES.has(categoria)) return 'momentos';
  return categoria;
}

function validateMediaFile(file: File): string | null {
  const isVideo = isLikelyVideoFile(file);
  const isImage = file.type.startsWith('image/');

  if (!isVideo && !isImage) {
    return `Arquivo "${file.name}" inválido. Use imagem ou vídeo (MP4/WebM/MOV).`;
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return `Arquivo "${file.name}" excede o limite de ${isVideo ? '60MB' : '20MB'}.`;
  }

  return null;
}

interface EditState {
  id: string;
  alt: string;
  categoria: string;
  destaque: boolean;
  file: File | null;
}

export default function AdminGaleriaPage() {
  const [imagens, setImagens] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCategoria, setUploadCategoria] = useState('momentos');
  const [uploadDestaque, setUploadDestaque] = useState(false);
  const [duplicates, setDuplicates] = useState<{ categoria: string; items: GaleriaItem[] }[]>([]);
  const { showToast } = useToast();

  const carregarGaleria = useCallback(async () => {
    try {
      setLoading(true);
      const [data, dups] = await Promise.all([
        getGaleria(),
        getGaleriaDuplicates(),
      ]);
      setImagens(data);
      setDuplicates(dups);
    } catch {
      showToast('Erro ao carregar galeria.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarGaleria();
  }, [carregarGaleria]);

  useEffect(() => {
    const isModalOpen = showUpload || Boolean(editState) || Boolean(deleteId);
    if (!isModalOpen) return;

    const scrollY = window.scrollY;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [showUpload, editState, deleteId]);

  const destaqueCount = useMemo(
    () => imagens.filter((item) => item.destaque).length,
    [imagens]
  );
  const videoCount = useMemo(
    () => imagens.filter((item) => isLikelyVideoUrl(item.url)).length,
    [imagens]
  );

  const handleDelete = async (id: string) => {
    const result = await deletarFoto(id);
    if (!result?.success) {
      showToast(result?.message || 'Erro ao excluir mídia.', 'error');
      return;
    }

    setImagens((prev) => prev.filter((img) => img.id !== id));
    setDeleteId(null);
    showToast('Mídia excluída com sucesso!', 'success');
  };

  const handleToggleDestaque = async (imagem: GaleriaItem) => {
    const destaque = !imagem.destaque;

    setImagens((prev) =>
      prev.map((img) => (img.id === imagem.id ? { ...img, destaque } : img))
    );

    const result = await toggleDestaqueFoto(imagem.id, destaque);
    if (!result?.success) {
      setImagens((prev) =>
        prev.map((img) =>
          img.id === imagem.id ? { ...img, destaque: imagem.destaque } : img
        )
      );
      showToast(result?.message || 'Erro ao atualizar destaque.', 'error');
      return;
    }

    showToast('Destaque atualizado!', 'success');
  };

  const openEditModal = (item: GaleriaItem) => {
    setEditState({
      id: item.id,
      alt: item.alt || '',
      categoria: normalizeCategoriaForSelect(item.categoria),
      destaque: item.destaque,
      file: null,
    });
  };

  const handleReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState) return;

    setSaving(true);
    try {
      let nextUrl: string | undefined;
      if (editState.file) {
        const validationError = validateMediaFile(editState.file);
        if (validationError) {
          throw new Error(validationError);
        }

        const uploaded = await uploadFile(editState.file, 'pousada-recanto-xingo/galeria');
        nextUrl = uploaded.url;
      }

      const result = await atualizarFoto(editState.id, {
        alt: editState.alt || null,
        categoria: editState.categoria || null,
        destaque: editState.destaque,
        ...(nextUrl ? { url: nextUrl } : {}),
      });

      if (!result?.success) {
        showToast(result?.message || 'Erro ao atualizar mídia.', 'error');
        return;
      }

      showToast('Mídia atualizada com sucesso!', 'success');
      setEditState(null);
      await carregarGaleria();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      showToast('Selecione pelo menos um arquivo.', 'error');
      return;
    }

    setSaving(true);
    try {
      for (let i = 0; i < uploadFiles.length; i += 1) {
        const file = uploadFiles[i];
        const validationError = validateMediaFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        const uploaded = await uploadFile(file, 'pousada-recanto-xingo/galeria');
        const alt =
          uploadAlt.trim().length > 0
            ? uploadFiles.length > 1
              ? `${uploadAlt.trim()} ${i + 1}`
              : uploadAlt.trim()
            : file.name.replace(/\.[^.]+$/, '');

        const result = await adicionarFoto({
          url: uploaded.url,
          alt,
          categoria: uploadCategoria,
          destaque: i === 0 ? uploadDestaque : false,
        });

        if (!result?.success) {
          throw new Error(result?.message || 'Erro ao salvar item na galeria');
        }
      }

      showToast('Arquivos adicionados com sucesso!', 'success');
      setShowUpload(false);
      setUploadFiles([]);
      setUploadAlt('');
      setUploadCategoria('momentos');
      setUploadDestaque(false);
      await carregarGaleria();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar arquivos.', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <DataState title="Galeria" message="Carregando imagens..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeria"
        subtitle={`${imagens.length} itens · ${videoCount} vídeo(s) · ${destaqueCount} em destaque`}
        actions={(
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowUpload(true)}
          >
            Upload de Mídias
          </Button>
        )}
      />

      {/* Aviso de duplicatas */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800">Mídias duplicadas detectadas</h4>
              <p className="text-sm text-amber-700 mt-1">
                Existem URLs duplicadas nas seguintes categorias. Remova as duplicatas para evitar problemas de exibição:
              </p>
              <div className="mt-3 space-y-2">
                {duplicates.map((dup) => (
                  <div key={dup.categoria} className="flex items-center gap-2 text-sm">
                    <Copy className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800">{formatAreaLabel(dup.categoria)}:</span>
                    <span className="text-amber-700">{dup.items.length} itens com mesma URL</span>
                    <button
                      onClick={() => {
                        const ids = dup.items.map(i => i.id).slice(1).join(',');
                        if (ids) setDeleteId(ids.split(',')[0]);
                      }}
                      className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Remover duplicatas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {imagens.map((img, index) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="group relative rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm cursor-pointer"
            onClick={() => openEditModal(img)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEditModal(img);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="aspect-square relative">
              {isLikelyVideoUrl(img.url) ? (
                <video
                  src={img.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={img.url}
                  alt={img.alt || 'Mídia da galeria'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(img);
                  }}
                  className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                  title="Editar mídia"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleToggleDestaque(img);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    img.destaque
                      ? 'bg-amber-400 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                  title={img.destaque ? 'Remover destaque' : 'Destacar'}
                >
                  <Star className={`w-4 h-4 ${img.destaque ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(img.id);
                  }}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {img.destaque && (
                <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Destaque
                </span>
              )}
              {isLikelyVideoUrl(img.url) && (
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Film className="w-3 h-3" /> Vídeo
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 truncate">
                {img.alt || 'Sem título'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatAreaLabel(img.categoria)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {imagens.length === 0 && (
        <EmptyState
          title="Nenhuma mídia na galeria"
          icon={<ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />}
          className="py-16"
        />
      )}

      <AnimatePresence>
        {editState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4 overscroll-contain"
            onClick={() => setEditState(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Editar Mídia</h3>
                <button onClick={() => setEditState(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleReplace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Novo arquivo (opcional)</label>
                  <input
                    type="file"
                    accept={ACCEPTED_MEDIA_TYPES}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, file: e.target.files?.[0] || null } : prev
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição (alt text)</label>
                  <input
                    value={editState.alt}
                    onChange={(e) =>
                      setEditState((prev) => (prev ? { ...prev, alt: e.target.value } : prev))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    placeholder="Descrição da mídia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Área da alteração no site</label>
                  <select
                    value={editState.categoria}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, categoria: e.target.value } : prev
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Esta mídia será usada na área selecionada do site.
                  </p>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-700">Marcar como destaque</span>
                  <input
                    type="checkbox"
                    checked={editState.destaque}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, destaque: e.target.checked } : prev
                      )
                    }
                    className="h-4 w-4"
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditState(null)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <Button type="submit" className="flex-1" loading={saving}>Salvar</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Excluir mídia?"
        description="Essa ação não pode ser desfeita."
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            void handleDelete(deleteId);
          }
        }}
      />

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4 overscroll-contain"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upload de Mídias</h3>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Selecionar arquivos *</label>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_MEDIA_TYPES}
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      const validFiles: File[] = [];
                      const errors: string[] = [];

                      selectedFiles.forEach((file) => {
                        const error = validateMediaFile(file);
                        if (error) {
                          errors.push(error);
                        } else {
                          validFiles.push(file);
                        }
                      });

                      if (errors.length > 0) {
                        showToast(errors[0], 'error');
                      }

                      setUploadFiles(validFiles);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {uploadFiles.length > 0
                      ? `${uploadFiles.length} arquivo(s) selecionado(s)`
                      : 'Selecione uma ou mais imagens/vídeos'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Imagem até 20MB ou vídeo (MP4/WebM/MOV) até 60MB.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição base</label>
                  <input
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    placeholder="Ex: Área da piscina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Área da alteração no site</label>
                  <select
                    value={uploadCategoria}
                    onChange={(e) => setUploadCategoria(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Defina em qual área do site esta mídia deve aparecer.
                  </p>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-700">Primeiro arquivo como destaque</span>
                  <input
                    type="checkbox"
                    checked={uploadDestaque}
                    onChange={(e) => setUploadDestaque(e.target.checked)}
                    className="h-4 w-4"
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Enviar Arquivos
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
