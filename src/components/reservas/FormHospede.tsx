'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { NovoHospede } from '@/types/hospede';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormData extends NovoHospede {
  observacoes: string;
}

interface FormHospedeProps {
  initialData?: Partial<NovoHospede>;
  observacoes?: string;
  onSubmit: (data: NovoHospede, observacoes: string) => void;
  onBack: () => void;
}

export default function FormHospede({
  initialData,
  observacoes: initialObservacoes = '',
  onSubmit,
  onBack,
}: FormHospedeProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      nome: initialData?.nome || '',
      email: initialData?.email || '',
      telefone: initialData?.telefone || '',
      cpf: initialData?.cpf || '',
      cidade: initialData?.cidade || '',
      observacoes: initialObservacoes,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const { observacoes, ...hospede } = data;
    onSubmit(hospede, observacoes || '');
  };

  // Simple input masks
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-8"
    >
      <h2 className="font-display text-2xl font-bold text-dark mb-6">
        Seus dados
      </h2>

      <div className="space-y-6">
        <Input
          label="Nome completo *"
          placeholder="Como está no documento"
          error={errors.nome?.message}
          {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
          />
          <Input
            label="Telefone (WhatsApp) *"
            placeholder="(00) 00000-0000"
            error={errors.telefone?.message}
            {...register('telefone', {
              required: 'Telefone é obrigatório',
              minLength: { value: 10, message: 'Telefone inválido' },
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value);
              },
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CPF *"
            placeholder="000.000.000-00"
            error={errors.cpf?.message}
            {...register('cpf', {
              required: 'CPF é obrigatório',
              minLength: { value: 11, message: 'CPF inválido' },
              onChange: (e) => {
                e.target.value = formatCPF(e.target.value);
              },
            })}
          />
          <Input
            label="Cidade de origem *"
            placeholder="Sua cidade"
            error={errors.cidade?.message}
            {...register('cidade', { required: 'Cidade é obrigatória', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
          />
        </div>

        <Textarea
          label="Observações (opcional)"
          placeholder="Alguma observação especial? (aniversário, lua de mel, preferências...)"
          rows={4}
          {...register('observacoes')}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1">
          Voltar
        </Button>
        <Button type="submit" className="sm:flex-1" loading={isSubmitting}>
          Continuar
        </Button>
      </div>
    </motion.form>
  );
}
