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
  Pencil,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  getGaleria,
  adicionarFoto,
  atualizarFoto,
  toggleDestaqueFoto,
  deletarFoto,
} from '@/lib/actions/galeria';
import type { GaleriaItem } from '@/lib/actions/galeria';
import { getConteudo, atualizarConteudo } from '@/lib/actions/conteudo';

const CATEGORIAS = [
  { value: 'pousada', label: 'Pousada' },
  { value: 'quartos', label: 'Quartos' },
  { value: 'area_lazer', label: 'Área de lazer' },
  { value: 'cafe', label: 'Café da manhã' },
];

const ESTRUTURA_CARDS = [
  {
    key: 'home_estrutura_piscina_imagem',
    titulo: 'Piscina',
    defaultUrl: 'https://placehold.co/600x400/2D6A4F/FDF8F0?text=Piscina',
  },
  {
    key: 'home_estrutura_area_redes_imagem',
    titulo: 'Área de Redes',
    defaultUrl: 'https://placehold.co/600x400/D4A843/1B3A4B?text=Area+de+Redes',
  },
  {
    key: 'home_estrutura_churrasqueira_imagem',
    titulo: 'Churrasqueira',
    defaultUrl: 'https://placehold.co/600x400/E07A5F/FDF8F0?text=Churrasqueira',
  },
  {
    key: 'home_estrutura_chuveirao_imagem',
    titulo: 'Chuveirão',
    defaultUrl: 'https://placehold.co/600x400/1B3A4B/FDF8F0?text=Chuveir%C3%A3o',
  },
  {
    key: 'home_estrutura_espaco_amplo_imagem',
    titulo: 'Espaço Amplo',
    defaultUrl: 'https://placehold.co/600x400/40916C/FDF8F0?text=Espaco+Amplo',
  },
  {
    key: 'home_estrutura_banheiro_privativo_imagem',
    titulo: 'Banheiro Privativo',
    defaultUrl: 'https://placehold.co/600x400/2D6A4F/D4A843?text=Banheiro+Privativo',
  },
] as const;

type EstruturaCardKey = (typeof ESTRUTURA_CARDS)[number]['key'];

function buildEstruturaImageState(
  conteudoMap?: Record<string, { valor: string; categoria: string }>
): Record<EstruturaCardKey, string> {
  return ESTRUTURA_CARDS.reduce((acc, item) => {
    const value = conteudoMap?.[item.key]?.valor?.trim();
    acc[item.key] = value || item.defaultUrl;
    return acc;
  }, {} as Record<EstruturaCardKey, string>);
}

interface EditState {
  id: string;
  alt: string;
  categoria: string;
  destaque: boolean;
  file: File | null;
}

async function uploadFile(file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao enviar imagem');
  }

  return data as { url: string; public_id: string };
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
  const [uploadCategoria, setUploadCategoria] = useState('pousada');
  const [uploadDestaque, setUploadDestaque] = useState(false);
  const [estruturaImagens, setEstruturaImagens] = useState<Record<EstruturaCardKey, string>>(
    () => buildEstruturaImageState()
  );
  const [estruturaUploadingKey, setEstruturaUploadingKey] = useState<EstruturaCardKey | null>(
    null
  );
  const { showToast } = useToast();

  const carregarGaleria = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGaleria();
      setImagens(data);
    } catch {
      showToast('Erro ao carregar galeria.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const carregarEstrutura = useCallback(async () => {
    try {
      const data = await getConteudo();
      setEstruturaImagens(buildEstruturaImageState(data));
    } catch {
      showToast('Erro ao carregar imagens da estrutura.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    carregarGaleria();
    carregarEstrutura();
  }, [carregarGaleria, carregarEstrutura]);

  const destaqueCount = useMemo(
    () => imagens.filter((item) => item.destaque).length,
    [imagens]
  );

  const handleDelete = async (id: string) => {
    const result = await deletarFoto(id);
    if (!result?.success) {
      showToast(result?.message || 'Erro ao excluir imagem.', 'error');
      return;
    }

    setImagens((prev) => prev.filter((img) => img.id !== id));
    setDeleteId(null);
    showToast('Imagem excluída com sucesso!', 'success');
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
      categoria: item.categoria || 'pousada',
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
        const uploaded = await uploadFile(editState.file);
        nextUrl = uploaded.url;
      }

      const result = await atualizarFoto(editState.id, {
        alt: editState.alt || null,
        categoria: editState.categoria || null,
        destaque: editState.destaque,
        ...(nextUrl ? { url: nextUrl } : {}),
      });

      if (!result?.success) {
        showToast(result?.message || 'Erro ao atualizar imagem.', 'error');
        return;
      }

      showToast('Imagem atualizada com sucesso!', 'success');
      setEditState(null);
      await carregarGaleria();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar imagem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      showToast('Selecione pelo menos uma imagem.', 'error');
      return;
    }

    setSaving(true);
    try {
      for (let i = 0; i < uploadFiles.length; i += 1) {
        const file = uploadFiles[i];
        const uploaded = await uploadFile(file);
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
          throw new Error(result?.message || 'Erro ao salvar imagem na galeria');
        }
      }

      showToast('Fotos adicionadas com sucesso!', 'success');
      setShowUpload(false);
      setUploadFiles([]);
      setUploadAlt('');
      setUploadCategoria('pousada');
      setUploadDestaque(false);
      await carregarGaleria();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar fotos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEstruturaUpload = async (cardKey: EstruturaCardKey, file: File | null) => {
    if (!file) return;

    setEstruturaUploadingKey(cardKey);
    try {
      const uploaded = await uploadFile(file);
      const result = await atualizarConteudo(cardKey, uploaded.url, 'home');

      if (!result?.success) {
        showToast(result?.message || 'Erro ao atualizar imagem da estrutura.', 'error');
        return;
      }

      setEstruturaImagens((prev) => ({ ...prev, [cardKey]: uploaded.url }));
      showToast('Imagem da estrutura atualizada!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar imagem.', 'error');
    } finally {
      setEstruturaUploadingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
        <p className="text-gray-500 text-sm">Carregando imagens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
          <p className="text-gray-500 text-sm mt-1">
            {imagens.length} imagens · {destaqueCount} em destaque
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowUpload(true)}
        >
          Upload de Fotos
        </Button>
      </motion.div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Estrutura da Home</h2>
          <p className="text-sm text-gray-500">
            Upload das imagens da seção &quot;Tudo que você precisa para relaxar&quot;.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ESTRUTURA_CARDS.map((card) => {
            const currentUrl = estruturaImagens[card.key] || card.defaultUrl;
            const uploading = estruturaUploadingKey === card.key;

            return (
              <div key={card.key} className="rounded-xl border border-gray-200 p-3">
                <div className="relative mb-3 aspect-4/3 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={currentUrl}
                    alt={card.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <p className="mb-2 text-sm font-semibold text-gray-800">{card.titulo}</p>
                <p className="truncate text-xs text-gray-400">{currentUrl}</p>

                <label
                  className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    uploading
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-primary/10 text-primary hover:bg-primary/15'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      void handleEstruturaUpload(card.key, file);
                      e.currentTarget.value = '';
                    }}
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Trocar imagem
                    </>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {imagens.map((img, index) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="group relative rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm"
          >
            <div className="aspect-square relative">
              <Image
                src={img.url}
                alt={img.alt || 'Foto da galeria'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => openEditModal(img)}
                  className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                  title="Editar imagem"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleDestaque(img)}
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
                  onClick={() => setDeleteId(img.id)}
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
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 truncate">
                {img.alt || 'Sem título'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{img.categoria || 'Sem categoria'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {imagens.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma imagem na galeria</p>
        </div>
      )}

      <AnimatePresence>
        {editState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setEditState(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Editar Imagem</h3>
                <button onClick={() => setEditState(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleReplace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova imagem (opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
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
                    placeholder="Descrição da imagem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
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

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Excluir imagem?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Essa ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upload de Fotos</h3>
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
                    accept="image/*"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {uploadFiles.length > 0
                      ? `${uploadFiles.length} arquivo(s) selecionado(s)`
                      : 'Selecione uma ou mais imagens'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
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
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-700">Primeira imagem como destaque</span>
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
                        <Upload className="w-4 h-4" /> Enviar Fotos
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
