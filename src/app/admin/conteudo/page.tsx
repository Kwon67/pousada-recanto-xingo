'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Save,
  Home,
  Info,
  MapPin,
  Compass,
  Eye,
  Lightbulb,
  Building2,
  Upload,
  Trash2,
  Video,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getConteudo, atualizarConteudo, atualizarConteudos } from '@/lib/actions/conteudo';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  public_id?: string;
};

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'estrutura', label: 'Estrutura', icon: Building2 },
  { id: 'sobre', label: 'Sobre', icon: Info },
  { id: 'experiencias', label: 'Experiências', icon: Compass },
  { id: 'informacoes', label: 'Informações', icon: MapPin },
];

const ESTRUTURA_CARDS = [
  { id: '1', titulo: 'Piscina' },
  { id: '2', titulo: 'Área de Redes' },
  { id: '3', titulo: 'Churrasqueira' },
  { id: '4', titulo: 'Chuveirão' },
  { id: '5', titulo: 'Espaço Amplo' },
  { id: '6', titulo: 'Banheiro Privativo' },
] as const;

interface ConteudoField {
  key: string;
  label: string;
  value: string;
  defaultValue: string;
  category: string;
  type: 'text' | 'textarea' | 'url';
  dica?: string;
}

const conteudoTemplates: Record<string, Omit<ConteudoField, 'value'>[]> = {
  home: [
    { key: 'hero_titulo', label: 'Título principal (Hero)', defaultValue: 'Pousada Recanto do Matuto Xingó', category: 'home', type: 'text', dica: 'Título visível na primeira tela do site' },
    { key: 'hero_subtitulo', label: 'Subtítulo do Hero', defaultValue: 'Sua hospedagem perfeita no Cânion do Xingó', category: 'home', type: 'textarea', dica: 'Complemento do título principal' },
    { key: 'home_sobre_titulo', label: 'Título da seção Sobre', defaultValue: 'Bem-vindo ao Recanto do Matuto', category: 'home', type: 'text' },
    { key: 'home_sobre_texto', label: 'Texto da seção Sobre', defaultValue: 'Somos uma pousada nova e aconchegante em Piranhas, Alagoas.', category: 'home', type: 'textarea' },
    { key: 'home_cta_titulo', label: 'Título do CTA', defaultValue: 'Reserve agora e viva essa experiência', category: 'home', type: 'text' },
    { key: 'home_cta_subtitulo', label: 'Subtítulo do CTA', defaultValue: 'Quartos a partir de R$ 180/noite', category: 'home', type: 'text' },
  ],
  sobre: [
    { key: 'sobre_titulo', label: 'Título da página Sobre', defaultValue: 'Sobre a Pousada', category: 'sobre', type: 'text' },
    { key: 'sobre_texto', label: 'Texto sobre a pousada', defaultValue: 'A Pousada Recanto do Matuto Xingó oferece uma experiência única de hospedagem.', category: 'sobre', type: 'textarea' },
  ],
  experiencias: [
    { key: 'exp_titulo', label: 'Título da seção', defaultValue: 'Experiências', category: 'experiencias', type: 'text' },
    { key: 'exp_descricao', label: 'Descrição geral', defaultValue: 'Descubra as atividades e passeios incríveis da região.', category: 'experiencias', type: 'textarea' },
    { key: 'exp_passeio1_titulo', label: 'Passeio 1 — Título', defaultValue: 'Passeio de Catamarã pelo Xingó', category: 'experiencias', type: 'text' },
    { key: 'exp_passeio1_descricao', label: 'Passeio 1 — Descrição', defaultValue: 'Navegue pelos cânions em um passeio inesquecível.', category: 'experiencias', type: 'textarea' },
    { key: 'exp_passeio2_titulo', label: 'Passeio 2 — Título', defaultValue: 'Trilha do Mirante', category: 'experiencias', type: 'text' },
    { key: 'exp_passeio2_descricao', label: 'Passeio 2 — Descrição', defaultValue: 'Caminhada com vista panorâmica da região.', category: 'experiencias', type: 'textarea' },
  ],
  informacoes: [
    { key: 'info_endereco', label: 'Endereço completo', defaultValue: 'Piranhas, Alagoas - Brasil', category: 'informacoes', type: 'text' },
    { key: 'info_telefone', label: 'Telefone / WhatsApp', defaultValue: '(82) 99999-0000', category: 'informacoes', type: 'text' },
    { key: 'info_email', label: 'E-mail de contato', defaultValue: 'contato@recantodomatuto.com.br', category: 'informacoes', type: 'text' },
    { key: 'info_checkin', label: 'Horário de Check-in', defaultValue: '14:00', category: 'informacoes', type: 'text' },
    { key: 'info_checkout', label: 'Horário de Check-out', defaultValue: '12:00', category: 'informacoes', type: 'text' },
    { key: 'info_instagram', label: 'Instagram', defaultValue: '@recantodomatutoxingo', category: 'informacoes', type: 'text', dica: 'Sem o link, apenas o @' },
    { key: 'info_maps_url', label: 'Link do Google Maps', defaultValue: '', category: 'informacoes', type: 'url', dica: 'Cole o link do Google Maps aqui' },
  ],
};

function buildInitialState(
  conteudoMap: Record<string, { valor: string; categoria: string }>
): Record<string, ConteudoField[]> {
  return Object.fromEntries(
    Object.entries(conteudoTemplates).map(([tab, fields]) => [
      tab,
      fields.map((field) => ({
        ...field,
        value: conteudoMap[field.key]?.valor ?? field.defaultValue,
      })),
    ])
  );
}

function parseMediaJSON(raw: string | undefined): MediaItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MediaItem[];
  } catch { /* ignore */ }
  return [];
}

async function uploadFile(
  file: File,
  folder = 'pousada-recanto-xingo/estrutura'
): Promise<{ url: string; public_id: string; resource_type: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao enviar arquivo');
  return data as { url: string; public_id: string; resource_type: string };
}

/* ─── Estrutura Media Manager ───────────────────────────────── */

function EstruturaMediaCard({
  card,
  media,
  onUpdate,
}: {
  card: { id: string; titulo: string };
  media: MediaItem[];
  onUpdate: (_cardId: string, _newMedia: MediaItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { showToast } = useToast();
  const isFull = media.length >= 3;

  const handleUpload = async (file: File) => {
    if (isFull) {
      showToast('Máximo de 3 mídias por card.', 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file);
      const type: 'image' | 'video' = result.resource_type === 'video' ? 'video' : 'image';
      const newItem: MediaItem = { url: result.url, type, public_id: result.public_id };
      onUpdate(card.id, [...media, newItem]);
      showToast('Mídia adicionada!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro no upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const item = media[index];
    // Try to delete from Cloudinary
    if (item.public_id) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: item.public_id }),
        });
      } catch { /* non-critical */ }
    }

    const updated = media.filter((_, i) => i !== index);
    onUpdate(card.id, updated);
    setDeleteIndex(null);
    showToast('Mídia removida.', 'success');
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{card.titulo}</h3>
        <span className="text-xs text-gray-400">{media.length}/3 mídias</span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {media.map((item, i) => (
          <div
            key={`${item.url}-${i}`}
            className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100"
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                muted
                className="h-full w-full object-cover"
                preload="metadata"
              />
            ) : (
              <Image
                src={item.url}
                alt={`${card.titulo} ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            )}

            {/* Type badge */}
            <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {item.type === 'video' ? (
                <><Video className="h-2.5 w-2.5" /> Vídeo</>
              ) : (
                <><ImageIcon className="h-2.5 w-2.5" /> Foto</>
              )}
            </span>

            {/* Delete overlay */}
            <button
              onClick={() => setDeleteIndex(i)}
              className="absolute right-1.5 top-1.5 rounded-md bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              title="Remover"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 3 - media.length }).map((_, i) => (
          <label
            key={`empty-${i}`}
            className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${
              uploading
                ? 'border-gray-200 bg-gray-50 cursor-wait'
                : 'border-gray-300 bg-gray-50 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.currentTarget.value = '';
              }}
            />
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <>
                <Upload className="h-4 w-4 text-gray-400" />
                <span className="text-[10px] text-gray-400">Foto/Vídeo</span>
              </>
            )}
          </label>
        ))}
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteIndex !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5">
              <span className="flex-1 text-xs text-red-700">Remover esta mídia?</span>
              <button
                onClick={() => setDeleteIndex(null)}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemove(deleteIndex)}
                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page Component ───────────────────────────────────── */

export default function AdminConteudoPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [conteudo, setConteudo] = useState<Record<string, ConteudoField[]>>(() =>
    buildInitialState({})
  );
  const [estruturaMedia, setEstruturaMedia] = useState<Record<string, MediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadConteudo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConteudo();
      setConteudo(buildInitialState(data));

      // Load estrutura media
      const mediaMap: Record<string, MediaItem[]> = {};
      for (const card of ESTRUTURA_CARDS) {
        const key = `home_estrutura_${card.id}_media`;
        mediaMap[card.id] = parseMediaJSON(data[key]?.valor);
      }
      setEstruturaMedia(mediaMap);
    } catch {
      showToast('Erro ao carregar conteúdo.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadConteudo();
  }, [loadConteudo]);

  const updateField = (tabId: string, key: string, value: string) => {
    setConteudo((prev) => ({
      ...prev,
      [tabId]: prev[tabId].map((field) =>
        field.key === key ? { ...field, value } : field
      ),
    }));
  };

  const handleEstruturaMediaUpdate = async (cardId: string, newMedia: MediaItem[]) => {
    setEstruturaMedia((prev) => ({ ...prev, [cardId]: newMedia }));

    // Persist immediately
    const key = `home_estrutura_${cardId}_media`;
    const json = JSON.stringify(newMedia);
    const result = await atualizarConteudo(key, json, 'home');
    if (!result?.success) {
      showToast(result?.message || 'Erro ao salvar mídias.', 'error');
    }
  };

  const payload = useMemo(
    () =>
      Object.values(conteudo)
        .flat()
        .map((field) => ({
          chave: field.key,
          valor: field.value,
          categoria: field.category,
        })),
    [conteudo]
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await atualizarConteudos(payload);
    setSaving(false);

    if (!result?.success) {
      showToast(result?.message || 'Erro ao salvar conteúdo.', 'error');
      return;
    }

    showToast('Conteúdo salvo com sucesso!', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Conteúdo do Site</h1>
        <p className="text-gray-500 text-sm">Carregando conteúdo...</p>
      </div>
    );
  }

  const isEstruturaTab = activeTab === 'estrutura';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conteúdo do Site</h1>
          <p className="text-gray-500 text-sm mt-1">Edite os textos e informações do site público</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> Ver site
          </a>
          {!isEstruturaTab && (
            <Button
              leftIcon={<Save className="w-5 h-5" />}
              onClick={handleSave}
              loading={saving}
            >
              Salvar Tudo
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {isEstruturaTab ? (
        <motion.div
          key="estrutura"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Estrutura
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as fotos e vídeos de cada card da seção &quot;Tudo que você precisa para relaxar&quot;.
              Máximo de 3 mídias por card. Alterações são salvas automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ESTRUTURA_CARDS.map((card) => (
              <EstruturaMediaCard
                key={card.id}
                card={card}
                media={estruturaMedia[card.id] || []}
                onUpdate={handleEstruturaMediaUpdate}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {TABS.find((t) => t.id === activeTab)?.icon && (() => {
              const Icon = TABS.find((t) => t.id === activeTab)!.icon;
              return <Icon className="w-5 h-5 text-primary" />;
            })()}
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>

          {conteudo[activeTab]?.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                {field.dica && (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> {field.dica}</span>
                )}
              </div>
              {field.type === 'textarea' ? (
                <textarea
                  value={field.value}
                  onChange={(e) => updateField(activeTab, field.key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                />
              ) : (
                <input
                  type={field.type === 'url' ? 'url' : 'text'}
                  value={field.value}
                  onChange={(e) => updateField(activeTab, field.key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  placeholder={field.type === 'url' ? 'https://...' : ''}
                />
              )}
            </div>
          ))}
        </motion.div>
      )}

      {!isEstruturaTab && (
        <div className="flex justify-end">
          <Button
            leftIcon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            loading={saving}
          >
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  );
}
