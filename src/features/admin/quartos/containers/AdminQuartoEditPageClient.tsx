'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Bed,
  DollarSign,
  Image as ImageIcon,
  Settings,
  Wifi,
  Wind,
  Tv,
  Bath,
  Droplets,
  Coffee,
  Lightbulb,
} from 'lucide-react';
import Button from '@/components/ui/app-button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/Toast';
import { quartosMock } from '@/data/mock';
import { atualizarQuarto, getQuartoById } from '@/lib/actions/quartos';
import type { Quarto } from '@/types/quarto';

interface QuartoForm {
  nome: string;
  descricao_curta: string;
  descricao: string;
  categoria: string;
  preco_diaria: string;
  preco_fds: string;
  capacidade: string;
  tamanho_m2: string;
  ativo: boolean;
  destaque: boolean;
}

const AMENIDADES_DISPONIVEIS = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'ar-condicionado', label: 'Ar-condicionado', icon: Wind },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'banheiro-privativo', label: 'Banheiro privativo', icon: Bath },
  { id: 'frigobar', label: 'Frigobar', icon: Droplets },
  { id: 'cafe', label: 'Café da manhã', icon: Coffee },
  { id: 'ventilador', label: 'Ventilador', icon: Wind },
  { id: 'roupa-cama', label: 'Roupa de cama', icon: Bed },
  { id: 'toalhas', label: 'Toalhas', icon: Bath },
  { id: 'roupao', label: 'Roupão', icon: Bath },
];

const TABS = [
  { id: 'info', label: 'Informações', icon: Bed },
  { id: 'precos', label: 'Preços', icon: DollarSign },
  { id: 'fotos', label: 'Fotos', icon: ImageIcon },
  { id: 'config', label: 'Configurações', icon: Settings },
];

export default function EditarQuartoPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [loadingQuarto, setLoadingQuarto] = useState(true);

  const quartoId = params?.id as string;

  const [quarto, setQuarto] = useState<Quarto | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuartoForm>();

  const [amenidades, setAmenidades] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([]);

  const loadQuarto = useCallback(async () => {
    try {
      let data = await getQuartoById(quartoId);
      if (!data) {
        // Fallback to mock
        data = quartosMock.find((q) => q.id === quartoId) || null;
      }
      if (data) {
        setQuarto(data);
        reset({
          nome: data.nome,
          descricao_curta: data.descricao_curta,
          descricao: data.descricao,
          categoria: data.categoria,
          preco_diaria: String(data.preco_diaria),
          preco_fds: String(data.preco_fds),
          capacidade: String(data.capacidade),
          tamanho_m2: String(data.tamanho_m2),
          ativo: data.ativo,
          destaque: data.destaque,
        });
        setAmenidades(data.amenidades ?? []);
        setImages(
          (data.imagens ?? []).map((url: string) => ({ url, public_id: '' }))
        );
      }
    } finally {
      setLoadingQuarto(false);
    }
  }, [quartoId, reset]);

  useEffect(() => {
    loadQuarto();
  }, [loadQuarto]);

  const toggleAmenidade = (label: string) => {
    setAmenidades((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };


  const onSubmit = async (data: QuartoForm) => {
    setIsLoading(true);
    try {
      const updateData = {
        nome: data.nome,
        descricao_curta: data.descricao_curta,
        descricao: data.descricao,
        categoria: data.categoria as 'standard' | 'superior' | 'suite',
        preco_diaria: parseFloat(data.preco_diaria),
        preco_fds: parseFloat(data.preco_fds),
        capacidade: parseInt(data.capacidade),
        tamanho_m2: parseInt(data.tamanho_m2),
        amenidades,
        imagens: images.map((img) => img.url),
        imagem_principal: images[0]?.url || null,
        ativo: data.ativo,
        destaque: data.destaque,
      };

      await atualizarQuarto(quartoId, updateData);
      showToast('Quarto salvo com sucesso!', 'success');
      router.push('/admin/quartos');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao salvar quarto',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingQuarto) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!quarto) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Quarto não encontrado</p>
        <Link href="/admin/quartos" className="text-primary mt-4 inline-block">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/admin/quartos">
          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Quarto</h1>
          <p className="text-gray-500 text-sm mt-0.5">{quarto.nome}</p>
        </div>
      </motion.div>

      {/* Tabs */}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do quarto *</label>
              <input
                {...register('nome', { required: 'Nome é obrigatório' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição curta *</label>
              <input
                {...register('descricao_curta', { required: 'Obrigatório' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição completa *</label>
              <textarea
                {...register('descricao', { required: 'Obrigatório' })}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <select
                  {...register('categoria')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                >
                  <option value="standard">Standard</option>
                  <option value="superior">Superior</option>
                  <option value="suite">Suíte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacidade</label>
                <input type="number" min={1} max={10} {...register('capacidade')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tamanho (m²)</label>
              <input type="number" min={1} {...register('tamanho_m2')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Comodidades</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENIDADES_DISPONIVEIS.map((am) => (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => toggleAmenidade(am.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      amenidades.includes(am.label)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <am.icon className="w-4 h-4" />
                    {am.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Preços */}
        {activeTab === 'precos' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço diária (seg a qui) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input type="number" min={0} step="0.01" {...register('preco_diaria', { required: 'Obrigatório' })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço fim de semana *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input type="number" min={0} step="0.01" {...register('preco_fds', { required: 'Obrigatório' })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-700 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> <strong>Dica:</strong> Defina um preço mais alto para fins de semana e feriados.</p>
            </div>
          </motion.div>
        )}

        {/* Fotos */}
        {activeTab === 'fotos' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <ImageUpload
              label="Fotos do quarto"
              images={images}
              onChange={setImages}
              maxImages={10}
            />
          </motion.div>
        )}

        {/* Config */}
        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-800 text-sm">Quarto ativo</p>
                <p className="text-xs text-gray-500 mt-0.5">Visível no site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('ativo')} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-800 text-sm">Destaque</p>
                <p className="text-xs text-gray-500 mt-0.5">Aparece em destaque na página inicial</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('destaque')} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400" />
              </label>
            </div>
          </motion.div>
        )}

        {/* Save */}
        <div className="flex gap-3 pt-2">
          <Link href="/admin/quartos" className="flex-1">
            <button type="button" className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          </Link>
          <Button type="submit" leftIcon={<Save className="w-5 h-5" />} loading={isLoading} className="flex-1">
            Salvar Quarto
          </Button>
        </div>
      </form>
    </div>
  );
}
