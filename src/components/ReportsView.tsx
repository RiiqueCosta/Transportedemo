/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppRecord, Finance, TransportRequest, AppConfig } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, BarChart3, TrendingUp, TrendingDown, Truck, Users } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ReportsViewProps {
  records: AppRecord[];
  config: AppConfig;
}

export function ReportsView({ records, config }: ReportsViewProps) {
  const finance = records.filter(r => r.type === 'finance') as Finance[];
  const requests = records.filter(r => r.type === 'transport_request') as TransportRequest[];

  // Group by month
  const monthlyData: Record<string, { month: string; faturamento: number; despesas: number }> = {};
  
  const getMonthKey = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Outro';
      return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    } catch {
      return 'Outro';
    }
  };

  finance.forEach(f => {
    const key = getMonthKey(f.dueDate || f.dateCreated);
    if (!monthlyData[key]) monthlyData[key] = { month: key, faturamento: 0, despesas: 0 };
    if (f.financeType === 'receivable') {
      monthlyData[key].faturamento += f.value;
    } else {
      monthlyData[key].despesas += f.value;
    }
  });

  const chartData = Object.values(monthlyData).slice(-6);

  const downloadFullReport = () => {
    const totalReceivable = finance.filter(f => f.financeType === 'receivable').reduce((s, f) => s + f.value, 0);
    const totalPaidReceivables = finance.filter(f => f.financeType === 'receivable' && f.status === 'paid').reduce((s, f) => s + f.value, 0);
    const totalPayable = finance.filter(f => f.financeType === 'payable').reduce((s, f) => s + f.value, 0);

    const template = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #111827;">
        <h1 style="color: #6D4AFF; border-bottom: 3px solid #6D4AFF; padding-bottom: 10px; font-weight: 900;">${config.companyName} - Relatório Operacional</h1>
        <p style="font-size: 11px; color: #4B5563;">Gerado eletronicamente em: ${new Date().toLocaleString('pt-BR')}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 30px;">
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; border-radius: 12px;">
            <h3 style="margin-top: 0; font-size: 11px; text-transform: uppercase; color: #6B7280;">Faturamento de Cargas</h3>
            <p style="font-size: 20px; font-weight: bold; color: #6D4AFF; margin: 5px 0 0 0;">${formatCurrency(totalReceivable)}</p>
          </div>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; border-radius: 12px;">
            <h3 style="margin-top: 0; font-size: 11px; text-transform: uppercase; color: #6B7280;">Receita Consolidada</h3>
            <p style="font-size: 20px; font-weight: bold; color: #10B981; margin: 5px 0 0 0;">${formatCurrency(totalPaidReceivables)}</p>
          </div>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; border-radius: 12px;">
            <h3 style="margin-top: 0; font-size: 11px; text-transform: uppercase; color: #6B7280;">Custos de Rodagem</h3>
            <p style="font-size: 20px; font-weight: bold; color: #EF4444; margin: 5px 0 0 0;">${formatCurrency(totalPayable)}</p>
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
          <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #1E40AF;">Margem de Lucro Bruto</h3>
          <p style="font-size: 24px; font-weight: bold; color: ${totalPaidReceivables - totalPayable >= 0 ? '#10B981' : '#EF4444'}; margin: 5px 0 0 0;">
            ${formatCurrency(totalPaidReceivables - totalPayable)}
          </p>
        </div>

        <h3 style="margin-top: 40px; color: #111827; font-size: 14px;">Detalhamento de Fluxos Mensais</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #6D4AFF; color: white;">
              <th style="padding: 10px; text-align: left; font-size: 11px;">Mês Referência</th>
              <th style="padding: 10px; text-align: right; font-size: 11px;">Receita Lançada</th>
              <th style="padding: 10px; text-align: right; font-size: 11px;">Custos Gerais</th>
              <th style="padding: 10px; text-align: right; font-size: 11px;">Saldo Operacional</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.map(d => `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 10px; font-size: 11px;">${d.month}</td>
                <td style="padding: 10px; text-align: right; font-size: 11px; color: #6D4AFF; font-weight: bold;">${formatCurrency(d.faturamento)}</td>
                <td style="padding: 10px; text-align: right; font-size: 11px; color: #EF4444;">${formatCurrency(d.despesas)}</td>
                <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: bold; color: ${d.faturamento - d.despesas >= 0 ? '#10B981' : '#EF4444'}">
                  ${formatCurrency(d.faturamento - d.despesas)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = template;
    const opt = { 
      margin: 10, 
      filename: `auditoria-transportes-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt as any).from(element).save();
  };

  const topClients = Array.from(finance.reduce((acc, curr) => {
    if (curr.financeType === 'receivable') {
      const val = acc.get(curr.clientName || 'Geral') || 0;
      acc.set(curr.clientName || 'Geral', val + curr.value);
    }
    return acc;
  }, new Map<string, number>()).entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

  const topCategories = Array.from(finance.reduce((acc, curr) => {
    if (curr.financeType === 'payable') {
      const val = acc.get(curr.category) || 0;
      acc.set(curr.category, val + curr.value);
    }
    return acc;
  }, new Map<string, number>()).entries())
  .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Análise de Performance</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gere relatórios inteligentes e gráficos consolidados para auditoria operacional.</p>
        </div>
        <button 
          onClick={downloadFullReport}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório PDF
        </button>
      </div>

      {/* Main comparative chart */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand" /> Fluxo de Caixa: Faturamento vs Custos de Rodagem
        </h3>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#27272A' : '#F1F5F9'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717A', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717A', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backgroundColor: document.documentElement.classList.contains('dark') ? '#18181B' : '#FFFFFF', color: document.documentElement.classList.contains('dark') ? '#F4F4F5' : '#18181B' }}
                />
                <Legend iconType="circle" />
                <Bar name="Receitas" dataKey="faturamento" fill="#6D4AFF" radius={[4, 4, 0, 0]} />
                <Bar name="Custos" dataKey="despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 italic text-sm">
              Sem dados suficientes para consolidação do comparativo.
            </div>
          )}
        </div>
      </div>

      {/* Top rankings metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-blue-600" /> Clientes por Maior Volume (Faturamento)
            </h3>
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">Top 5</span>
          </div>
          <div className="p-5 space-y-4">
            {topClients.length > 0 ? topClients.map(([name, total], i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">{i+1}</div>
                   <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{name}</p>
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(total)}</p>
              </div>
            )) : (
              <p className="text-center py-10 text-xs text-zinc-400 italic">Sem registros de receitas.</p>
            )}
          </div>
        </div>

        {/* Expense categories */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingDown className="w-4.5 h-4.5 text-red-500" /> Custos de Viagem por Categoria
            </h3>
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">Consolidado</span>
          </div>
          <div className="p-5 space-y-4">
            {topCategories.length > 0 ? topCategories.map(([cat, total], i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{cat}</p>
                <p className="text-sm font-bold text-red-500">{formatCurrency(total)}</p>
              </div>
            )) : (
              <p className="text-center py-10 text-xs text-zinc-400 italic">Sem registros de custos de rodagem.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
