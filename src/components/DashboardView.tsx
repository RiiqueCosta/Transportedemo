/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Truck, 
  Users, 
  Compass, 
  Car, 
  UserCheck, 
  FileText, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { AppRecord, Client, Driver, Fleet, TransportRequest, Contract, Finance } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface DashboardViewProps {
  records: AppRecord[];
}

export function DashboardView({ records }: DashboardViewProps) {
  // Extract all relevant types
  const clients = records.filter(r => r.type === 'client') as Client[];
  const drivers = records.filter(r => r.type === 'driver') as Driver[];
  const fleet = records.filter(r => r.type === 'fleet') as Fleet[];
  const requests = records.filter(r => r.type === 'transport_request') as TransportRequest[];
  const contracts = records.filter(r => r.type === 'contract') as Contract[];
  const finance = records.filter(r => r.type === 'finance') as Finance[];

  // 1. Calculate operational counts
  const transportesAgendados = requests.filter(r => r.status === 'scheduled').length;
  const transportesEmAndamento = requests.filter(r => r.status === 'collected' || r.status === 'in_transit').length;
  const transportesFinalizados = requests.filter(r => r.status === 'delivered').length;
  const contratosAtivos = contracts.filter(c => c.status === 'active' || c.status === 'signed').length;
  const totalClientes = clients.length;

  // 2. Calculate financial summaries
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
  
  const faturamentoMes = finance
    .filter(f => f.financeType === 'receivable' && f.dateCreated.startsWith(currentMonth))
    .reduce((sum, f) => sum + f.value, 0);

  const valorAReceber = finance
    .filter(f => f.financeType === 'receivable' && f.status === 'pending')
    .reduce((sum, f) => sum + f.value, 0);

  // 3. Fleet states
  const frotaDisponivel = fleet.filter(v => v.status === 'available').length;
  const frotaEmViagem = fleet.filter(v => v.status === 'in_transit').length;
  const frotaEmManutencao = fleet.filter(v => v.status === 'maintenance').length;

  // 4. Driver states
  const motoristasDisponiveis = drivers.filter(d => d.status === 'available').length;

  // 5. Next events
  const proximasColetas = requests
    .filter(r => r.status === 'scheduled')
    .sort((a, b) => a.collectDate.localeCompare(b.collectDate))
    .slice(0, 4);

  const proximasEntregas = requests
    .filter(r => r.status === 'collected' || r.status === 'in_transit')
    .sort((a, b) => a.estimatedDeliveryDate.localeCompare(b.estimatedDeliveryDate))
    .slice(0, 4);

  // Chart data: Monthly Billing evolution (receivables)
  const monthData: Record<string, { month: string; Faturamento: number; Custos: number }> = {};
  
  finance.forEach(f => {
    try {
      const d = new Date(f.dueDate || f.dateCreated);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthData[key]) {
        monthData[key] = { month: key, Faturamento: 0, Custos: 0 };
      }
      if (f.financeType === 'receivable') {
        monthData[key].Faturamento += f.value;
      } else {
        monthData[key].Custos += f.value;
      }
    } catch (e) {
      console.error('Date parsing error in chart:', e);
    }
  });

  const chartData = Object.values(monthData).slice(-6);

  // Fleet status distribution chart data
  const fleetPieData = [
    { name: 'Disponível', value: frotaDisponivel, fill: '#10B981' },
    { name: 'Em Viagem', value: frotaEmViagem, fill: '#3B82F6' },
    { name: 'Manutenção', value: frotaEmManutencao, fill: '#F59E0B' },
    { name: 'Inativo', value: fleet.filter(v => v.status === 'inactive').length, fill: '#EF4444' }
  ].filter(item => item.value > 0);

  // Fallback to dummy pie values if empty to keep design beautiful
  const finalPieData = fleetPieData.length > 0 ? fleetPieData : [
    { name: 'Sem Veículos', value: 1, fill: '#E5E7EB' }
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Painel Operacional</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Status em tempo real das frotas, motoristas, coletas e faturamento logístico.</p>
      </div>

      {/* Main bento KPIs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Mensal */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Faturamento ({now.toLocaleDateString('pt-BR', { month: 'short' })})</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{formatCurrency(faturamentoMes)}</h4>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1">
            <span className="text-green-500 font-bold">●</span> Faturamento focado no mês vigente
          </p>
        </div>

        {/* Card 2: Valor a receber */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Valor a Receber</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(valorAReceber)}</h4>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1">
            <span className="text-amber-500 font-bold">●</span> Contas a receber em aberto
          </p>
        </div>

        {/* Card 3: Frota status summary */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Operações Ativas</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{transportesEmAndamento} <span className="text-xs font-medium text-zinc-400">em viagem</span></h4>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-bold">{frotaDisponivel} livres</span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 font-bold">{frotaEmManutencao} oficinas</span>
          </p>
        </div>

        {/* Card 4: Motoristas Disponíveis */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Motoristas</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{motoristasDisponiveis} <span className="text-xs font-medium text-zinc-400">disponíveis</span></h4>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1">
            <span className="font-bold text-purple-500">●</span> {drivers.length} motoristas totais na base
          </p>
        </div>
      </div>

      {/* Operational stats split row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Transportes Agendados</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{transportesAgendados}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Em Transporte</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{transportesEmAndamento}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Entregues / Concluídos</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{transportesFinalizados}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Contratos Ativos</p>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-200 mt-1">{contratosAtivos}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 col-span-2 md:col-span-1 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Clientes Cadastrados</p>
          <p className="text-2xl font-bold text-indigo-500 mt-1">{totalClientes}</p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" /> Fluxo Financeiro (Mensal)
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-brand" /> Receitas
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Custos
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#27272A' : '#F1F5F9'} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11, fontWeight: 600 }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717A', fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backgroundColor: document.documentElement.classList.contains('dark') ? '#18181B' : '#FFFFFF', color: document.documentElement.classList.contains('dark') ? '#F4F4F5' : '#18181B' }}
                    formatter={(v: number, name) => [formatCurrency(v), name]}
                  />
                  <Bar dataKey="Faturamento" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Custos" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-sm italic">
                Sem registros de transações para exibir gráficos.
              </div>
            )}
          </div>
        </div>

        {/* Fleet Distribution Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand" /> Distribuição da Frota
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Situação operacional atual dos veículos próprios.</p>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} veículos`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">{fleet.length}</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase">Frota Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Disponível ({frotaDisponivel})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Em Viagem ({frotaEmViagem})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Manutenção ({frotaEmManutencao})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span>Inativo ({fleet.filter(v => v.status === 'inactive').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next collections */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-500" /> Próximas Coletas (Agendados)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-bold uppercase">{proximasColetas.length}</span>
          </div>
          
          <div className="space-y-3">
            {proximasColetas.length > 0 ? proximasColetas.map((col) => (
              <div key={col.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850/50 flex items-center justify-between hover:border-brand/30 transition-all">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{col.clientName}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Veículo: {col.vehicleName}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
                    <span className="font-bold">Rota:</span> {col.origin.split(',')[0]} ➜ {col.destination.split(',')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-[10px] bg-blue-100/60 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold rounded-lg inline-block">
                    {col.collectDate ? col.collectDate.split('-').reverse().join('/') : 'A agendar'}
                  </span>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-1.5">{formatCurrency(col.totalValue)}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs italic">
                Nenhuma coleta agendada para os próximos dias.
              </div>
            )}
          </div>
        </div>

        {/* Next deliveries */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Próximas Entregas (Em Viagem)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold uppercase">{proximasEntregas.length}</span>
          </div>

          <div className="space-y-3">
            {proximasEntregas.length > 0 ? proximasEntregas.map((del) => (
              <div key={del.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850/50 flex items-center justify-between hover:border-brand/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{del.clientName}</p>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">
                      {del.status === 'collected' ? 'Coletado' : 'Em Rota'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Veículo: {del.vehicleName}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
                    <span className="font-bold">Rota:</span> {del.origin.split(',')[0]} ➜ {del.destination.split(',')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-[10px] bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold rounded-lg inline-block">
                    Previsão: {del.estimatedDeliveryDate ? del.estimatedDeliveryDate.split('-').reverse().join('/') : 'A definir'}
                  </span>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-1.5">{formatCurrency(del.totalValue)}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs italic">
                Nenhum transporte atualmente em andamento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
