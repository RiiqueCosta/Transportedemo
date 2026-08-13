/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Code,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSupabaseUrl } from '../lib/supabase';

interface Note {
  id: number;
  title: string;
}

export function SupabaseNotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'setup'>('notes');
  const [demoMode, setDemoMode] = useState(false);
  
  const configured = isSupabaseConfigured();
  const dbUrl = getSupabaseUrl();

  // Load notes
  useEffect(() => {
    if (configured && !demoMode) {
      fetchNotes();
    } else {
      // In demo mode or not configured, load from local storage
      loadDemoNotes();
    }
  }, [configured, demoMode]);

  const loadDemoNotes = () => {
    try {
      const saved = localStorage.getItem('supabase_demo_notes');
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        const initial = [
          { id: 1, title: 'Hoje eu integrei meu sistema de transportes com o Supabase! 🚀' },
          { id: 2, title: 'O banco de dados Postgres oferece segurança e velocidade em nuvem.' },
          { id: 3, title: 'Tudo pronto para cadastrar notas reais através do console do Supabase.' }
        ];
        setNotes(initial);
        localStorage.setItem('supabase_demo_notes', JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to load demo notes:', e);
    }
  };

  const saveDemoNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('supabase_demo_notes', JSON.stringify(updated));
  };

  const fetchNotes = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      setError(err.message || 'Erro ao carregar as notas do Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setError(null);

    if (!configured || demoMode) {
      // Demo Mode adding
      const newNote: Note = {
        id: Date.now(),
        title: newTitle.trim()
      };
      const updated = [newNote, ...notes];
      saveDemoNotes(updated);
      setNewTitle('');
      setSubmitting(false);
      return;
    }

    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title: newTitle.trim() }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setNotes((prev) => [data[0], ...prev]);
      } else {
        // Fallback fetch
        await fetchNotes();
      }
      setNewTitle('');
    } catch (err: any) {
      console.error('Supabase insert error:', err);
      setError(err.message || 'Erro ao salvar nota no Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingTitle.trim()) return;
    setError(null);

    if (!configured || demoMode) {
      // Demo Mode update
      const updated = notes.map((n) => (n.id === id ? { ...n, title: editingTitle.trim() } : n));
      saveDemoNotes(updated);
      setEditingId(null);
      setEditingTitle('');
      return;
    }

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ title: editingTitle.trim() })
        .eq('id', id);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title: editingTitle.trim() } : n))
      );
      setEditingId(null);
      setEditingTitle('');
    } catch (err: any) {
      console.error('Supabase update error:', err);
      setError(err.message || 'Erro ao atualizar nota no Supabase.');
    }
  };

  const handleDeleteNote = async (id: number) => {
    setError(null);

    if (!configured || demoMode) {
      // Demo Mode delete
      const updated = notes.filter((n) => n.id !== id);
      saveDemoNotes(updated);
      return;
    }

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      console.error('Supabase delete error:', err);
      setError(err.message || 'Erro ao excluir nota no Supabase.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-500" />
            Integração Supabase
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gerenciamento e diagnóstico em tempo real do seu banco de dados Supabase Postgres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            Anotações Supabase
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            Guia de Configuração
          </button>
        </div>
      </div>

      {/* Connection status diagnostic panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Status da Conexão</h3>
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-1 truncate max-w-md">
                  URL: {dbUrl || 'Não configurado'}
                </p>
              </div>
            </div>

            {configured && !demoMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Ativo (Real)
              </span>
            ) : demoMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Modo Simulação
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                Não Configurado
              </span>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              {configured && !demoMode
                ? 'Conectado de forma segura através do SDK oficial do Supabase na conta yzpbpgjyqhrdnvsknfst.'
                : 'As chaves do projeto ainda contêm o valor de demonstração. Você pode testar no simulador abaixo ou configurar suas chaves.'}
            </p>
            {!configured && !demoMode && (
              <button
                onClick={() => setDemoMode(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ativar Simulador Local
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {demoMode && (
              <button
                onClick={() => setDemoMode(false)}
                className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Voltar à detecção real
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-emerald-500 w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Tabela Mapeada
              </h4>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              `public.notes`
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Mapeado diretamente para a tabela criada via SQL no console do seu projeto Supabase.
            </p>
          </div>

          {configured && !demoMode && (
            <button
              onClick={fetchNotes}
              disabled={loading}
              className="mt-4 w-full py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-200/50 dark:border-zinc-750"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar Agora
            </button>
          )}
        </div>
      </div>

      {activeTab === 'notes' ? (
        <div className="space-y-6">
          {/* Notes Workspace */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold">Erro do Supabase: </span>
                {error}
                <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                  Verifique se você criou a tabela rodando o script na aba "Guia de Configuração", ou se suas chaves no .env estão corretas.
                </p>
              </div>
            </div>
          )}

          {/* Form to insert */}
          <form onSubmit={handleAddNote} className="max-w-2xl">
            <div className="flex gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <input
                type="text"
                placeholder={demoMode ? "Adicionar uma nota rápida no simulador..." : "Adicionar nota rápida diretamente no Supabase..."}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={submitting}
                className="flex-1 bg-transparent px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-base font-medium"
              />
              <button
                type="submit"
                disabled={submitting || !newTitle.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Criar Nota</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Notes display */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Buscando notas no Supabase...</p>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-2xl">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                Nenhuma nota encontrada
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mt-2">
                Use o formulário acima para inserir dados na tabela `notes` do seu banco Supabase.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-750 transition-all flex flex-col justify-between min-h-32 relative overflow-hidden"
                  >
                    {editingId === note.id ? (
                      <div className="flex flex-col h-full justify-between gap-3">
                        <textarea
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium outline-none border border-zinc-300 dark:border-zinc-750 focus:border-emerald-500 text-sm resize-none h-16"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(note.id);
                            }
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={!editingTitle.trim()}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-white cursor-pointer"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between gap-4">
                        <p className="text-zinc-800 dark:text-zinc-100 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                          {note.title}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100/50 dark:border-zinc-800/50">
                          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            ID: #{note.id}
                          </span>

                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Editar Nota"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Excluir esta nota?')) {
                                  handleDeleteNote(note.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Nota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        /* Configuration Guide and SQL tools */
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-500" />
              1. Script SQL do Supabase
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Abra o painel do seu projeto Supabase (<strong className="text-zinc-700 dark:text-zinc-300">yzpbpgjyqhrdnvsknfst</strong>), vá em <strong className="text-zinc-700 dark:text-zinc-300">SQL Editor</strong>, crie uma nova query e cole o seguinte script para criar a tabela de notas e configurar as políticas de acesso livre para leitura e gravação:
            </p>

            <div className="relative">
              <pre className="bg-zinc-950 text-emerald-400 p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-850">
{`-- ====================================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE - SISTEMA DE TRANSPORTE E LOGÍSTICA
-- Projeto: yzpbpgjyqhrdnvsknfst.supabase.co
-- Habilita extensão UUID e cria tabelas com RLS (Row Level Security)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE NOTAS (notes)
CREATE TABLE IF NOT EXISTS public.notes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes select" ON public.notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Notes insert" ON public.notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Notes update" ON public.notes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Notes delete" ON public.notes FOR DELETE TO anon, authenticated USING (true);

-- 2. TABELA DE CLIENTES (clients)
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner',
  name text NOT NULL,
  cpf_cnpj text NOT NULL,
  rg text, phone text, whatsapp text, email text, cep text, address text, number text, complement text, city text, state text, observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients select" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Clients insert" ON public.clients FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Clients update" ON public.clients FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Clients delete" ON public.clients FOR DELETE TO anon, authenticated USING (true);

-- 3. TABELA DE VEÍCULOS TRANSPORTADOS (vehicles_transported)
CREATE TABLE IF NOT EXISTS public.vehicles_transported (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner',
  brand text NOT NULL, model text NOT NULL, year text, color text, plate text NOT NULL, renavam text, chassis text, fuel text, value numeric(12, 2) DEFAULT 0.00, image_url text, observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.vehicles_transported ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles select" ON public.vehicles_transported FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Vehicles insert" ON public.vehicles_transported FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Vehicles update" ON public.vehicles_transported FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Vehicles delete" ON public.vehicles_transported FOR DELETE TO anon, authenticated USING (true);

-- 4. TABELA DA FROTA (fleet)
CREATE TABLE IF NOT EXISTS public.fleet (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner',
  plate text NOT NULL, model text NOT NULL, brand text NOT NULL, fleet_type text CHECK (fleet_type IN ('car', 'van', 'truck')), capacity text, year text, renavam text, chassis text, current_mileage numeric(10, 2) DEFAULT 0, status text DEFAULT 'available', last_maintenance_date date, next_maintenance_date date, licensing_date date, insurance_expiry date, observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fleet select" ON public.fleet FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Fleet insert" ON public.fleet FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Fleet update" ON public.fleet FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Fleet delete" ON public.fleet FOR DELETE TO anon, authenticated USING (true);

-- 5. TABELA DE MOTORISTAS (drivers)
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner',
  name text NOT NULL, cpf text NOT NULL, rg text, cnh text NOT NULL, cnh_category text NOT NULL, cnh_expiry date, phone text, email text, address text, city text, state text, blood_type text, status text DEFAULT 'available', observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers select" ON public.drivers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Drivers insert" ON public.drivers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Drivers update" ON public.drivers FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Drivers delete" ON public.drivers FOR DELETE TO anon, authenticated USING (true);

-- 6. TABELA DE ORDENS DE TRANSPORTE (transport_requests)
CREATE TABLE IF NOT EXISTS public.transport_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner', client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, client_name text, vehicle_id uuid REFERENCES public.vehicles_transported(id) ON DELETE SET NULL, vehicle_name text, origin text NOT NULL, destination text NOT NULL, collect_date date, estimated_delivery_date date, driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL, driver_name text, fleet_id uuid REFERENCES public.fleet(id) ON DELETE SET NULL, fleet_plate text, base_value numeric(12, 2) DEFAULT 0.00, toll_cost numeric(12, 2) DEFAULT 0.00, insurance_cost numeric(12, 2) DEFAULT 0.00, total_value numeric(12, 2) DEFAULT 0.00, distance_km numeric(10, 2) DEFAULT 0, estimated_time text, route_details text, status text DEFAULT 'scheduled', observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transport requests select" ON public.transport_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Transport requests insert" ON public.transport_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Transport requests update" ON public.transport_requests FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Transport requests delete" ON public.transport_requests FOR DELETE TO anon, authenticated USING (true);

-- 7. TABELA DE CONTRATOS (contracts)
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner', contract_number text NOT NULL, title text NOT NULL, template_type text DEFAULT 'standard', clauses text, status text DEFAULT 'draft', client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, client_name text, request_id uuid REFERENCES public.transport_requests(id) ON DELETE SET NULL, value numeric(12, 2) DEFAULT 0.00, observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contracts select" ON public.contracts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Contracts insert" ON public.contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Contracts update" ON public.contracts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Contracts delete" ON public.contracts FOR DELETE TO anon, authenticated USING (true);

-- 8. TABELA DE FINANCEIRO (finances)
CREATE TABLE IF NOT EXISTS public.finances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id text DEFAULT 'local_owner', finance_type text NOT NULL CHECK (finance_type IN ('receivable', 'payable')), description text NOT NULL, value numeric(12, 2) NOT NULL DEFAULT 0.00, due_date date NOT NULL, payment_date date, status text DEFAULT 'pending', category text, transport_request_id uuid REFERENCES public.transport_requests(id) ON DELETE SET NULL, client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, client_name text, observations text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finances select" ON public.finances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Finances insert" ON public.finances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Finances update" ON public.finances FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Finances delete" ON public.finances FOR DELETE TO anon, authenticated USING (true);

-- 9. TABELA UNIFICADA DE REGISTROS (records)
CREATE TABLE IF NOT EXISTS public.records (
  id text PRIMARY KEY, type text NOT NULL, owner_id text DEFAULT 'local_owner', data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Records select" ON public.records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Records insert" ON public.records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Records update" ON public.records FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Records delete" ON public.records FOR DELETE TO anon, authenticated USING (true);

-- 10. TABELA DE CONFIGURAÇÃO (app_config)
CREATE TABLE IF NOT EXISTS public.app_config (
  id text PRIMARY KEY DEFAULT 'default', company_name text DEFAULT 'TransporteDemo Logística', company_phone text, company_email text, company_cnpj text, theme text DEFAULT 'light', value_per_km numeric(10,2) DEFAULT 4.50, default_insurance numeric(10,2) DEFAULT 150.00, default_tax numeric(10,2) DEFAULT 50.00, contract_template text, data jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App config select" ON public.app_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "App config insert" ON public.app_config FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "App config update" ON public.app_config FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "App config delete" ON public.app_config FOR DELETE TO anon, authenticated USING (true);

-- DADOS DE TESTE INICIAIS
INSERT INTO public.notes (title) VALUES ('Integração completa do Supabase executada!') ON CONFLICT DO NOTHING;`}
              </pre>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              2. Como inserir suas credenciais reais no app
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Para fazer a conexão real do aplicativo com seu banco, clique no menu de engrenagem / Configurações de API do AI Studio ou insira o arquivo <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-xs text-zinc-700 dark:text-zinc-300">.env</code> na raiz do projeto com as chaves reais de autenticação de cliente anônimo (Anon Key):
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase mb-2">
                <span>Estrutura do arquivo .env</span>
              </div>
              <pre className="font-mono text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=https://yzpbpgjyqhrdnvsknfst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key-real-aqui`}
              </pre>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <strong>Dica de Segurança:</strong> Ao integrar com o Supabase de forma puramente cliente-side (Direct Client), sempre utilize a <strong className="underline">Anon/Publishable Key</strong>. Nunca exponha a sua Service Role Key no front-end para garantir a segurança dos seus dados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
