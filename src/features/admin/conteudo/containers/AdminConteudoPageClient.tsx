'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Home,
  Info,
  MapPin,
  Compass,
  Eye,
  Lightbulb,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getConteudo, atualizarConteudos } from '@/lib/actions/conteudo';

interface ConteudoField {
  key: string;
  label: string;
  value: string;
  defaultValue: string;
  category: string;
  type: 'text' | 'textarea' | 'url';
  dica?: string;
}

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sobre', label: 'Sobre', icon: Info },
  { id: 'experiencias', label: 'Experiências', icon: Compass },
  { id: 'informacoes', label: 'Informações', icon: MapPin },
] as const;

const conteudoTemplates: Record<string, Omit<ConteudoField, 'value'>[]> = {
  home: [
    {
      key: 'hero_titulo',
      label: 'Título principal (Hero)',
      defaultValue: 'Pousada Recanto do Matuto Xingó',
      category: 'home',
      type: 'text',
      dica: 'Título visível na primeira tela do site',
    },
    {
      key: 'hero_subtitulo',
      label: 'Subtítulo do Hero',
      defaultValue: 'Sua hospedagem perfeita no Cânion do Xingó',
      category: 'home',
      type: 'textarea',
      dica: 'Complemento do título principal',
    },
    {
      key: 'home_sobre_titulo',
      label: 'Título da seção Sobre',
      defaultValue: 'Bem-vindo ao Recanto do Matuto',
      category: 'home',
      type: 'text',
    },
    {
      key: 'home_sobre_texto',
      label: 'Texto da seção Sobre',
      defaultValue: 'Somos uma pousada nova e aconchegante em Piranhas, Alagoas.',
      category: 'home',
      type: 'textarea',
    },
    {
      key: 'home_cta_titulo',
      label: 'Título do CTA',
      defaultValue: 'Reserve agora e viva essa experiência',
      category: 'home',
      type: 'text',
    },
    {
      key: 'home_cta_subtitulo',
      label: 'Subtítulo do CTA',
      defaultValue: 'Quartos a partir de R$ 180/noite',
      category: 'home',
      type: 'text',
    },
  ],
  sobre: [
    {
      key: 'sobre_titulo',
      label: 'Título da página Sobre',
      defaultValue: 'Sobre a Pousada',
      category: 'sobre',
      type: 'text',
    },
    {
      key: 'sobre_texto',
      label: 'Texto sobre a pousada',
      defaultValue: 'A Pousada Recanto do Matuto Xingó oferece uma experiência única de hospedagem.',
      category: 'sobre',
      type: 'textarea',
    },
  ],
  experiencias: [
    {
      key: 'exp_titulo',
      label: 'Título da seção',
      defaultValue: 'Experiências',
      category: 'experiencias',
      type: 'text',
    },
    {
      key: 'exp_descricao',
      label: 'Descrição geral',
      defaultValue: 'Descubra as atividades e passeios incríveis da região.',
      category: 'experiencias',
      type: 'textarea',
    },
    {
      key: 'exp_passeio1_titulo',
      label: 'Passeio 1 — Título',
      defaultValue: 'Passeio de Catamarã pelo Xingó',
      category: 'experiencias',
      type: 'text',
    },
    {
      key: 'exp_passeio1_descricao',
      label: 'Passeio 1 — Descrição',
      defaultValue: 'Navegue pelos cânions em um passeio inesquecível.',
      category: 'experiencias',
      type: 'textarea',
    },
    {
      key: 'exp_passeio2_titulo',
      label: 'Passeio 2 — Título',
      defaultValue: 'Trilha do Mirante',
      category: 'experiencias',
      type: 'text',
    },
    {
      key: 'exp_passeio2_descricao',
      label: 'Passeio 2 — Descrição',
      defaultValue: 'Caminhada com vista panorâmica da região.',
      category: 'experiencias',
      type: 'textarea',
    },
  ],
  informacoes: [
    {
      key: 'info_endereco',
      label: 'Endereço completo',
      defaultValue: 'Piranhas, Alagoas - Brasil',
      category: 'informacoes',
      type: 'text',
    },
    {
      key: 'info_telefone',
      label: 'Telefone / WhatsApp',
      defaultValue: '(82) 99999-0000',
      category: 'informacoes',
      type: 'text',
    },
    {
      key: 'info_email',
      label: 'E-mail de contato',
      defaultValue: 'contato@recantodomatuto.com.br',
      category: 'informacoes',
      type: 'text',
    },
    {
      key: 'info_checkin',
      label: 'Horário de Check-in',
      defaultValue: '14:00',
      category: 'informacoes',
      type: 'text',
    },
    {
      key: 'info_checkout',
      label: 'Horário de Check-out',
      defaultValue: '12:00',
      category: 'informacoes',
      type: 'text',
    },
    {
      key: 'info_instagram',
      label: 'Instagram',
      defaultValue: '@recantodomatutoxingo',
      category: 'informacoes',
      type: 'text',
      dica: 'Sem o link, apenas o @',
    },
    {
      key: 'info_maps_url',
      label: 'Link do Google Maps',
      defaultValue: '',
      category: 'informacoes',
      type: 'url',
      dica: 'Cole o link do Google Maps aqui',
    },
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

export default function AdminConteudoPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [conteudo, setConteudo] = useState<Record<string, ConteudoField[]>>(() =>
    buildInitialState({})
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadConteudo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConteudo();
      setConteudo(buildInitialState(data));
    } catch {
      showToast('Erro ao carregar conteúdo.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadConteudo();
  }, [loadConteudo]);

  const updateField = (tabId: string, key: string, value: string) => {
    setConteudo((prev) => ({
      ...prev,
      [tabId]: prev[tabId].map((field) =>
        field.key === key ? { ...field, value } : field
      ),
    }));
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conteúdo do Site</h1>
          <p className="text-gray-500 text-sm mt-1">Edite apenas textos e informações do site público</p>
          <p className="text-amber-700 text-xs mt-2">Mídias (fotos/vídeos) são gerenciadas exclusivamente em Galeria.</p>
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
          <Button
            leftIcon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            loading={saving}
          >
            Salvar Tudo
          </Button>
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

      <div className="flex justify-end">
        <Button
          leftIcon={<Save className="w-5 h-5" />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
