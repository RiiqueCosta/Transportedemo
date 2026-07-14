/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Save, Settings, Landmark, Phone, Mail, Hash } from 'lucide-react';

interface SettingsViewProps {
  config: AppConfig;
  setConfig: (config: AppConfig | ((prev: AppConfig) => AppConfig)) => void;
}

export function SettingsView({ config, setConfig }: SettingsViewProps) {
  const [formData, setFormData] = useState({
    companyName: config.companyName || 'TransporteDemo LTDA',
    companyPhone: config.companyPhone || '(11) 98525-8655',
    companyEmail: config.companyEmail || 'operacional@transportedemo.com.br',
    companyCnpj: config.companyCnpj || '12.345.678/0001-90',
    nextInvoiceNumber: config.nextInvoiceNumber || 1, // Contract numbering or Invoice
    nextQuoteNumber: config.nextQuoteNumber || 1, // Transport Requests
  });

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('Number') ? parseInt(value) || 1 : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus('saving');
    try {
      await setConfig(prev => ({
        ...prev,
        ...formData
      }));
      setSavedStatus('success');
      setTimeout(() => setSavedStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSavedStatus('error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Parâmetros de Operação</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure os dados cadastrais da empresa e contadores de controle interno.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Settings Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Landmark className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Informações Institucionais (Transportadora)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Razão Social / Nome Fantasia</label>
              <input
                required
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
                placeholder="Ex: TransporteDemo LTDA"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">CNPJ da Transportadora</label>
              <input
                required
                type="text"
                name="companyCnpj"
                value={formData.companyCnpj}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> SAC / Plantão Operacional
              </label>
              <input
                required
                type="text"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
                placeholder="(11) 98525-8655"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Canal Eletrônico
              </label>
              <input
                required
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
                placeholder="operacional@transportadora.com"
              />
            </div>
          </div>
        </div>

        {/* Numbering Settings Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Settings className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Sequência Eletrônica de Controle</h3>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
            Abaixo estão os contadores para numeração sequencial automática. Mude estes valores apenas em caso de necessidade de zerar as numerações ou alinhar com o ERP externo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-brand" /> Próximo Nº de Ordem de Serviço (OS)
              </label>
              <input
                required
                type="number"
                name="nextQuoteNumber"
                min="1"
                value={formData.nextQuoteNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-brand" /> Próximo Nº de Contrato Legal
              </label>
              <input
                required
                type="number"
                name="nextInvoiceNumber"
                min="1"
                value={formData.nextInvoiceNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {savedStatus === 'saving' && <p className="text-zinc-500 text-xs font-semibold animate-pulse">Sincronizando com o Firebase...</p>}
            {savedStatus === 'success' && <p className="text-green-600 text-xs font-bold">✓ Parâmetros gravados e atualizados com sucesso!</p>}
            {savedStatus === 'error' && <p className="text-red-500 text-xs font-bold">Erro de comunicação com o Firestore.</p>}
          </div>
          
          <button
            type="submit"
            disabled={savedStatus === 'saving'}
            className="px-6 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
