/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, Key, ShieldCheck, CreditCard, Layout, Zap, Award, Mail, Lock, UserPlus } from 'lucide-react';

interface LoginViewProps {
  onLogin?: (user: { uid: string; email: string; displayName: string }) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulated offline/local authentication
    setTimeout(() => {
      setLoading(false);
      if (onLogin) {
        onLogin({
          uid: 'local_' + Math.random().toString(36).substring(2, 9),
          email: email.trim(),
          displayName: email.split('@')[0]
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Branding Info Grid (7 columns) */}
        <div className="md:col-span-7 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-brand/20">
              T
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                Transporte Demo
              </h1>
              <p className="text-xs uppercase tracking-wider font-extrabold text-brand mt-1 font-mono">
                SISTEMA OPERACIONAL & FINANCEIRO
              </p>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Gestão profissional de transporte de veículos.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-xl text-base leading-relaxed">
            Controle frotas, motoristas, contratos, coletas, faturamento e solicitações de transporte em um único ecossistema seguro com banco de dados em tempo real.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-lg mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Totalmente Protegido</h4>
                <p className="text-xs text-zinc-500">Dados isolados por usuário no Firestore</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-brand/10 text-brand rounded-lg mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Faturamento & Contratos</h4>
                <p className="text-xs text-zinc-500">Gere ordens de serviço e contratos direto no navegador</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-lg mt-0.5">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Painel Operacional</h4>
                <p className="text-xs text-zinc-500">Controle completo de frotas e motoristas em trânsito</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-lg mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Sincronização em Tempo Real</h4>
                <p className="text-xs text-zinc-500">Sua contabilidade atualizada instantaneamente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card Grid (5 columns) */}
        <div className="md:col-span-5 w-full bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-zinc-250/20 dark:shadow-none">
          <div className="text-center md:text-left mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-brand mb-4 mx-auto md:mx-0">
              {isSignUp ? <UserPlus className="w-5 h-5" /> : <Key className="w-5 h-5" />}
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {isSignUp ? 'Cadastrar Novo Colaborador' : 'Acesso ao Painel'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {isSignUp
                ? 'Primeiro acesso ou novo colaborador? Cadastre-se aqui. O seu acesso precisará ser autorizado pelo administrador no painel.'
                : 'Insira suas credenciais de e-mail e senha para gerenciar seus dados.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs text-red-650 dark:text-red-400 border border-red-200/40 font-bold leading-relaxed whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> Endereço de E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-150"
                placeholder="colaborador@transportedemo.com.br"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" /> Senha de Segurança
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-150"
                placeholder="Sua senha (mínimo 6 caracteres)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand/20 disabled:scale-100 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Processando...' : isSignUp ? 'Solicitar Acesso / Cadastrar' : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Form switch toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-brand hover:text-brand-dark font-bold underline transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
            >
              {isSignUp ? 'Já possui login? Clique aqui para Entrar' : 'Primeiro acesso / Sou um novo colaborador'}
            </button>
          </div>

          <div className="mt-6 border-t border-zinc-150 dark:border-zinc-800 pt-5 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider">
              <Award className="w-3.5 h-3.5 text-zinc-400" />
              <span>Painel Administrativo Interno</span>
            </div>
            <p className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-2">
              Importante: Ative o método de login por "E-mail/Senha" no console do Firebase para que funcione.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
