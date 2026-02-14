'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  User,
  Mail,
  MapPin,
  Globe,
  BarChart3,
  Shield,
  Bell,
  Info,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getConfiguracoes, atualizarConfiguracoes } from '@/lib/actions/configuracoes';

const TABS = [
  { id: 'pousada', label: 'Pousada', icon: MapPin },
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'avancado', label: 'Avançado', icon: Shield },
];

interface ConfigForm {
  nome_pousada: string;
  descricao: string;
  telefone: string;
  email: string;
  endereco: string;
  horario_checkin: string;
  horario_checkout: string;
  gps_lat: string;
  gps_lng: string;
  instagram: string;
  facebook: string;
  google_analytics: string;
  meta_pixel: string;
  email_conta: string;
  whatsapp_notificacoes: boolean;
  email_notificacoes: boolean;
  nova_reserva_push: boolean;
}

const defaultConfig: ConfigForm = {
  nome_pousada: 'Pousada Recanto do Matuto Xingó',
  descricao: '',
  telefone: '(82) 99999-0000',
  email: 'contato@recantodomatuto.com.br',
  endereco: 'Piranhas - AL, Brasil',
  horario_checkin: '14:00',
  horario_checkout: '12:00',
  gps_lat: '',
  gps_lng: '',
  instagram: '@recantodomatutoxingo',
  facebook: '',
  google_analytics: '',
  meta_pixel: '',
  email_conta: '',
  whatsapp_notificacoes: true,
  email_notificacoes: true,
  nova_reserva_push: true,
};

export default function AdminConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('pousada');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfigForm>(defaultConfig);
  const { showToast } = useToast();

  const loadConfiguracoes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConfiguracoes();
      setConfig({
        nome_pousada: data.nome_pousada || defaultConfig.nome_pousada,
        descricao: data.descricao || '',
        telefone: data.telefone || defaultConfig.telefone,
        email: data.email || defaultConfig.email,
        endereco: data.endereco || defaultConfig.endereco,
        horario_checkin: data.horario_checkin || defaultConfig.horario_checkin,
        horario_checkout: data.horario_checkout || defaultConfig.horario_checkout,
        gps_lat: data.latitude !== undefined ? String(data.latitude) : '',
        gps_lng: data.longitude !== undefined ? String(data.longitude) : '',
        instagram: data.instagram || '',
        facebook: data.facebook || '',
        google_analytics: data.google_analytics || '',
        meta_pixel: data.meta_pixel || '',
        email_conta: data.email_conta || '',
        whatsapp_notificacoes: data.whatsapp_notificacoes ?? true,
        email_notificacoes: data.email_notificacoes ?? true,
        nova_reserva_push: data.nova_reserva_push ?? true,
      });
    } catch {
      showToast('Erro ao carregar configurações.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadConfiguracoes();
  }, [loadConfiguracoes]);

  const updateConfig = (key: keyof ConfigForm, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    const latitude = Number(config.gps_lat);
    const longitude = Number(config.gps_lng);

    const result = await atualizarConfiguracoes({
      nome_pousada: config.nome_pousada,
      descricao: config.descricao,
      endereco: config.endereco,
      telefone: config.telefone,
      email: config.email,
      instagram: config.instagram,
      facebook: config.facebook,
      google_analytics: config.google_analytics,
      meta_pixel: config.meta_pixel,
      email_conta: config.email_conta,
      horario_checkin: config.horario_checkin,
      horario_checkout: config.horario_checkout,
      latitude: Number.isFinite(latitude) ? latitude : undefined,
      longitude: Number.isFinite(longitude) ? longitude : undefined,
      whatsapp_notificacoes: config.whatsapp_notificacoes,
      email_notificacoes: config.email_notificacoes,
      nova_reserva_push: config.nova_reserva_push,
    });

    setSaving(false);

    if (!result?.success) {
      showToast(result?.message || 'Erro ao salvar configurações.', 'error');
      return;
    }

    showToast('Configurações salvas com sucesso!', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm">Carregando configurações...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as configurações da pousada e do sistema</p>
        </div>
        <Button
          leftIcon={<Save className="w-5 h-5" />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar
        </Button>
      </motion.div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

      {activeTab === 'pousada' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Dados da Pousada
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da pousada</label>
            <input
              value={config.nome_pousada}
              onChange={(e) => updateConfig('nome_pousada', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição curta</label>
            <textarea
              value={config.descricao}
              onChange={(e) => updateConfig('descricao', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone / WhatsApp</label>
              <input
                value={config.telefone}
                onChange={(e) => updateConfig('telefone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => updateConfig('email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
            <input
              value={config.endereco}
              onChange={(e) => updateConfig('endereco', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Horário de Check-in</label>
              <input
                type="time"
                value={config.horario_checkin}
                onChange={(e) => updateConfig('horario_checkin', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Horário de Check-out</label>
              <input
                type="time"
                value={config.horario_checkout}
                onChange={(e) => updateConfig('horario_checkout', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
              <input
                value={config.instagram}
                onChange={(e) => updateConfig('instagram', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                placeholder="@suapousada"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
              <input
                value={config.facebook}
                onChange={(e) => updateConfig('facebook', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                placeholder="facebook.com/suapousada"
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'conta' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Dados da Conta
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail da conta</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={config.email_conta}
                  onChange={(e) => updateConfig('email_conta', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-3">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Segurança de acesso
            </h2>
            <p className="text-sm text-blue-700">
              O login do painel usa variáveis de ambiente (`ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET`).
              Para alterar usuário/senha, atualize essas variáveis no servidor.
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'notificacoes' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Preferências de Notificação
          </h2>
          {[
            { key: 'whatsapp_notificacoes', label: 'Notificações por WhatsApp', desc: 'Receba alertas de novas reservas no WhatsApp' },
            { key: 'email_notificacoes', label: 'Notificações por E-mail', desc: 'Receba alertas de reservas e avaliações por e-mail' },
            { key: 'nova_reserva_push', label: 'Push para novas reservas', desc: 'Notificação instantânea ao receber uma nova reserva' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[item.key as keyof ConfigForm] as boolean}
                  onChange={(e) => updateConfig(item.key as keyof ConfigForm, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'avancado' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Coordenadas GPS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                <input
                  value={config.gps_lat}
                  onChange={(e) => updateConfig('gps_lat', e.target.value)}
                  placeholder="-9.63..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                <input
                  value={config.gps_lng}
                  onChange={(e) => updateConfig('gps_lng', e.target.value)}
                  placeholder="-37.79..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Integrações
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Analytics ID</label>
              <input
                value={config.google_analytics}
                onChange={(e) => updateConfig('google_analytics', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Cole o Measurement ID do Google Analytics 4</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Pixel ID</label>
              <input
                value={config.meta_pixel}
                onChange={(e) => updateConfig('meta_pixel', e.target.value)}
                placeholder="1234567890"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">ID do Pixel do Facebook/Meta para rastreamento</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 space-y-4">
            <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Zona de Perigo
            </h2>
            <p className="text-sm text-red-600">Limpeza de cache ainda não está automatizada no painel.</p>
            <button
              type="button"
              disabled
              className="px-4 py-2.5 rounded-xl border border-red-300 text-red-600/60 text-sm font-medium cursor-not-allowed"
            >
              Limpar cache do site (em breve)
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button
          leftIcon={<Save className="w-5 h-5" />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
