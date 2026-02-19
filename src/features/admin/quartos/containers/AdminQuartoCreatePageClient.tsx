'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/Toast';
import { CATEGORIAS_QUARTO } from '@/lib/constants';
import { criarQuarto } from '@/lib/actions/quartos';

interface UploadedImage {
  url: string;
  public_id: string;
}

interface QuartoForm {
  nome: string;
  descricao_curta: string;
  descricao: string;
  categoria: string;
  preco_diaria: string;
  preco_fds: string;
  capacidade: string;
  tamanho_m2: string;
}

export default function NovoQuartoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuartoForm>({
    defaultValues: {
      categoria: 'standard',
      capacidade: '2',
      tamanho_m2: '18',
      preco_diaria: '',
      preco_fds: '',
    },
  });

  const onSubmit = async (data: QuartoForm) => {
    setIsLoading(true);
    try {
      const quartoData = {
        nome: data.nome,
        descricao_curta: data.descricao_curta,
        descricao: data.descricao,
        categoria: data.categoria,
        preco_diaria: parseFloat(data.preco_diaria),
        preco_fds: parseFloat(data.preco_fds),
        capacidade: parseInt(data.capacidade),
        tamanho_m2: parseInt(data.tamanho_m2),
        imagem_principal: images[0]?.url || null,
        imagens: images.map((img) => img.url),
        amenidades: [],
        ativo: true,
        destaque: false,
      };

      await criarQuarto(quartoData);
      showToast('Quarto criado com sucesso!', 'success');
      router.push('/admin/quartos');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao criar quarto',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/admin/quartos"
          aria-label="Voltar para quartos"
          className="inline-flex p-2 hover:bg-cream-dark rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-dark">
            Novo Quarto
          </h1>
          <p className="text-text-light mt-1">
            Adicione um novo quarto à pousada
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-8 max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do quarto *"
            placeholder="Ex: Quarto Xingó"
            error={errors.nome?.message}
            {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
          />

          <Input
            label="Descrição curta *"
            placeholder="Uma frase resumindo o quarto"
            error={errors.descricao_curta?.message}
            {...register('descricao_curta', { required: 'Descrição curta é obrigatória', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
          />

          <Textarea
            label="Descrição completa *"
            placeholder="Descreva o quarto em detalhes..."
            rows={5}
            error={errors.descricao?.message}
            {...register('descricao', { required: 'Descrição é obrigatória', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
          />

          <ImageUpload
            label="Fotos do quarto"
            images={images}
            onChange={setImages}
            maxImages={10}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoria *"
              options={CATEGORIAS_QUARTO.filter((c) => c.value !== 'todos')}
              error={errors.categoria?.message}
              {...register('categoria')}
            />

            <Input
              label="Capacidade *"
              type="number"
              min={1}
              max={10}
              error={errors.capacidade?.message}
              {...register('capacidade', { required: 'Capacidade é obrigatória' })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Preço diária (R$) *"
              type="number"
              min={1}
              step="0.01"
              error={errors.preco_diaria?.message}
              {...register('preco_diaria', { required: 'Preço é obrigatório' })}
            />

            <Input
              label="Preço FDS (R$) *"
              type="number"
              min={1}
              step="0.01"
              error={errors.preco_fds?.message}
              {...register('preco_fds', { required: 'Preço FDS é obrigatório' })}
            />

            <Input
              label="Tamanho (m²) *"
              type="number"
              min={1}
              error={errors.tamanho_m2?.message}
              {...register('tamanho_m2', { required: 'Tamanho é obrigatório' })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/admin/quartos" className="flex-1">
              <Button asChild variant="outline" fullWidth>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              leftIcon={<Save className="w-5 h-5" />}
              loading={isLoading}
              className="flex-1"
            >
              Salvar Quarto
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
