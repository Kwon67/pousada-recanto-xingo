'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, Timer, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/app-button';

function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}min${rest > 0 ? ` ${rest}s` : ''}`;
}

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const { login, loading } = useAuth();

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cooldownSeconds > 0) {
      setError(`Aguarde ${formatCooldown(cooldownSeconds)} para tentar novamente.`);
      return;
    }

    if (!usuario.trim() || !senha.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    const result = await login(usuario, senha);
    if (!result.success) {
      setError(result.error || 'Usuário ou senha inválidos');
      if (result.retryAfterSeconds && result.retryAfterSeconds > 0) {
        setCooldownSeconds(result.retryAfterSeconds);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#142a37_0%,#1b3a4b_45%,#2d6a4f_100%)] relative overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-primary-light/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mx-auto"
      >
        <div className="grid md:grid-cols-[1.1fr_0.9fr] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <section className="hidden md:flex flex-col justify-between p-10 bg-dark/60 border-r border-white/10 text-white">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-secondary font-semibold">
                <Sparkles className="w-4 h-4" />
                Operação inteligente
              </p>
              <h1 className="font-display text-4xl font-bold text-secondary mt-4">
                Recanto do Matuto
              </h1>
              <p className="text-white/70 mt-4 max-w-sm">
                Painel administrativo com foco em produtividade, controle e segurança.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  Sessões com expiração automática
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-300" />
                  Proteção contra tentativas excessivas
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10">
            <div className="mb-6">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Acesso protegido
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-dark mt-4">
                Entrar no painel
              </h2>
              <p className="text-sm text-gray-500 mt-1">Use suas credenciais de administrador.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="usuario"
                    type="text"
                    autoComplete="username"
                    placeholder="Seu usuário"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={cooldownSeconds > 0}
              >
                {cooldownSeconds > 0
                  ? `Tente novamente em ${formatCooldown(cooldownSeconds)}`
                  : 'Entrar'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                A sessão expira automaticamente para reduzir risco de acesso indevido.
              </p>
            </form>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
