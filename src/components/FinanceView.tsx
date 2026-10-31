/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Wallet, ArrowDownRight, ArrowUpRight, 
  CheckCircle, Clock, X, DollarSign, Calendar, Tag, Filter 
} from 'lucide-react';
import { AppRecord, Finance } from '../types';
import { formatCurrency, generateId } from '../lib/utils';

interface FinanceViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

const FINANCE_CATEGORIES = [
  'Combustível',
  'Pedágio',
  'Manutenção da Frota',
  'Salário Motoristas',
  'Seguro de Carga',
  'Comissão de Vendas',
  'Impostos / Taxas',
  'Faturamento de Frete',
  'Outros'
];

export function FinanceView({ records, onAdd, onUpdate, onDelete }: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    value: 0,
    dueDate: '',
    financeType: 'receivable' as 'receivable' | 'payable',
    status: 'pending' as 'pending' | 'paid',
    category: 'Faturamento de Frete',
    clientName: '',
    observations: ''
  });

  const financeList = records.filter(r => r.type === 'finance') as Finance[];

  // Statistics calculation
  const totalReceivables = financeList
    .filter(f => f.financeType === 'receivable')
    .reduce((sum, f) => sum + f.value, 0);

  const receivedValue = financeList
    .filter(f => f.financeType === 'receivable' && f.status === 'paid')
    .reduce((sum, f) => sum + f.value, 0);

  const totalPayables = financeList
    .filter(f => f.financeType === 'payable')
    .reduce((sum, f) => sum + f.value, 0);

  const paidValue = financeList
    .filter(f => f.financeType === 'payable' && f.status === 'paid')
    .reduce((sum, f) => sum + f.value, 0);

  const cashFlowBalance = receivedValue - paidValue;

  const filteredEntries = financeList
    .filter(f => f.financeType === activeTab)
    .filter(f => 
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.clientName && f.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const resetForm = () => {
    setFormData({
      description: '',
      value: 0,
      dueDate: new Date().toISOString().substring(0, 10),
      financeType: activeTab,
      status: 'pending',
      category: activeTab === 'receivable' ? 'Faturamento de Frete' : 'Combustível',
      clientName: '',
      observations: ''
    });
    setEditingFinance(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (f: Finance) => {
    setEditingFinance(f);
    setFormData({
      description: f.description || '',
      value: f.value || 0,
      dueDate: f.dueDate || '',
      financeType: f.financeType || 'receivable',
      status: f.status || 'pending',
      category: f.category || 'Outros',
      clientName: f.clientName || '',
      observations: f.observations || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFinance) {
      onUpdate(editingFinance.id, {
        ...formData,
        value: Number(formData.value)
      });
    } else {
      const newEntry: Finance = {
        id: generateId(),
        type: 'finance',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData,
        value: Number(formData.value)
      };
      onAdd(newEntry);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const toggleStatus = (f: Finance) => {
    const nextStatus = f.status === 'paid' ? 'pending' : 'paid';
    onUpdate(f.id, { status: nextStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação financeira?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Fluxo Financeiro</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Contas a pagar e receber, demonstrativo de lucros e centros de custos de frete.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Financial KPIs row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Receivables */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contas a Receber (Total)</p>
            <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalReceivables)}</h4>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {formatCurrency(receivedValue)} já recebido</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Payables */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contas a Pagar (Total)</p>
            <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(totalPayables)}</h4>
            <p className="text-[10px] text-red-500 font-semibold mt-1">✓ {formatCurrency(paidValue)} já liquidado</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Real Balance (Cash flow) */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Saldo Real em Caixa</p>
            <h4 className={`text-xl font-bold mt-1 ${cashFlowBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(cashFlowBalance)}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-1">Relação (Recebido - Pago)</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs and search filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('receivable'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'receivable' ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Receitas (Entradas)
            </button>
            <button
              onClick={() => { setActiveTab('payable'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'payable' ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Custos / Despesas (Saídas)
            </button>
          </div>

          {/* Quick search inside tab */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 w-full sm:max-w-xs">
            <Search className="w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
            />
          </div>
        </div>

        {/* Dynamic transaction list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Cliente / Origem</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredEntries.length > 0 ? filteredEntries.map((f) => (
                <tr key={f.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors font-medium">
                  <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{f.description}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold uppercase text-[10px]">
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-zinc-500">{f.dueDate ? f.dueDate.split('-').reverse().join('/') : '---'}</td>
                  <td className="p-4 text-zinc-500">{f.clientName || '---'}</td>
                  <td className={`p-4 text-right font-bold text-sm ${f.financeType === 'receivable' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                    {f.financeType === 'payable' && '- '} {formatCurrency(f.value)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(f)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer ${
                        f.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                      }`}
                      title="Clique para alterar situação"
                    >
                      {f.status === 'paid' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Pago
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Pendente
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(f)} 
                        className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(f.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-600 italic">
                    Nenhum registro financeiro encontrado para esta guia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Form Drawer Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 pb-8 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono">CONCILIAÇÃO FINANCEIRA</span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingFinance ? 'Editar Transação' : 'Nova Entrada / Saída de Caixa'}
                </h3>
                <p className="text-xs text-zinc-400">Lance entradas ou despesas da operação de transporte de veículos.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Tipo de Operação</label>
                    <select
                      value={formData.financeType}
                      onChange={(e) => setFormData({...formData, financeType: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                    >
                      <option value="receivable">Receita (Entrada)</option>
                      <option value="payable">Custo / Despesa (Saída)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Categoria de Custo</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      {FINANCE_CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Descrição do Lançamento</label>
                  <input
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Faturamento Frete OS-9021, Troca de pneus, etc."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Valor da Operação (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                      placeholder="Ex: 1500.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold text-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Situação / Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                    >
                      <option value="pending">Pendente (Em aberto)</option>
                      <option value="paid">Pago / Liquidado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Data de Vencimento</label>
                    <input
                      required
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Nome do Cliente / Favorecido</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      placeholder="Ex: Nome do cliente (Opcional)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Observações Internas</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Notas fiscais, links de comprovantes, termos especiais."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand/10 cursor-pointer"
                >
                  {editingFinance ? 'Salvar Transação' : 'Registrar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
