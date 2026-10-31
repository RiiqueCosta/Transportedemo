/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, FileText, Eye, X, Copy, 
  Printer, Check, ArrowRight, Save, ClipboardList, RefreshCw 
} from 'lucide-react';
import { AppRecord, AppConfig, Contract, Client, TransportRequest } from '../types';
import { downloadContractPdf } from '../lib/pdf';
import { formatCurrency, generateId } from '../lib/utils';

interface ContractsViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
  config: AppConfig;
}

// Default Professional Templates
const CONTRACT_TEMPLATES = {
  standard: {
    title: 'Contrato Padrão de Transporte de Veículo',
    clauses: `CLAUSULA PRIMEIRA - DO OBJETO
A CONTRATADA compromete-se a efetuar o transporte rodoviário do veículo especificado na Ordem de Serviço vinculada, zelando pela integridade do mesmo desde a coleta até a entrega no destino.

CLÁUSULA SEGUNDA - DOS PRAZOS E CONDIÇÕES
O prazo para entrega dar-se-á conforme agendamento operacional, podendo sofrer alterações por motivos de força maior, intempéries climáticas, bloqueios de rodovias ou quebra mecânica do veículo transportador.

CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES E SEGURO
O veículo transportado encontra-se segurado contra colisão, incêndio, furto e roubo durante o período em que estiver sob a custódia da CONTRATADA (cobertura RCTR-C e RCF-DC). A CONTRATANTE declara que o veículo não possui objetos de valor pessoais em seu interior.

CLÁUSULA QUARTA - DO PAGAMENTO
O valor acordado pelo frete logístico será pago de acordo com as condições descritas no Financeiro, sendo 50% de sinal no ato do fechamento e 50% no ato do recebimento da carga, ou via faturamento previamente aprovado.`
  },
  exclusive: {
    title: 'Contrato de Transporte de Cegonha Exclusiva',
    clauses: `CLAUSULA PRIMEIRA - EXCLUSIVIDADE
A CONTRATADA reserva de forma integral o espaço da cegonha/prancha exclusiva descrita para o transporte prioritário dos veículos de propriedade ou indicados pela CONTRATANTE, sem paradas para cargas consolidadas de terceiros.

CLÁUSULA SEGUNDA - DO RASTREAMENTO
O transporte será monitorado 24 horas por dia com envio de posições de satélite periódicas para o setor operacional da CONTRATANTE.

CLÁUSULA TERCEIRA - MULTA POR ATRASO
Fica estipulado que, em caso de atraso injustificado na entrega superior a 48 horas da data estipulada, aplicar-se-á multa de 2% sobre o valor total do frete por dia de atraso.`
  },
  luxury: {
    title: 'Contrato de Transporte de Veículos de Luxo / Superesportivos',
    clauses: `CLAUSULA PRIMEIRA - DO MANUSEIO ESPECIAL
A CONTRATADA obriga-se a transportar o veículo superesportivo utilizando guincho plataforma fechado ou prancha protegida por lona impermeável e anti-vandalismo, com amarração por cintas macias de poliéster de alta resistência para evitar avarias nas rodas ou suspensão.

CLÁUSULA SEGUNDA - DA VISTORIA RIGOROSA
Será realizada uma vistoria fotográfica e checklist de alta definição com marcação de detalhes milimétricos no ato da coleta e no ato da entrega.

CLÁUSULA TERCEIRA - APÓLICE AD VALOREM PREMIUM
O veículo goza de cobertura de seguro Ad Valorem premium específica, cobrindo 100% da tabela FIPE ou nota fiscal declarada.`
  }
};

export function ContractsView({ records, onAdd, onUpdate, onDelete, config }: ContractsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Lists for dropdown selections
  const clients = records.filter(r => r.type === 'client') as Client[];
  const requests = records.filter(r => r.type === 'transport_request') as TransportRequest[];

  // Form State
  const [formData, setFormData] = useState({
    contractNumber: '',
    clientId: '',
    clientName: '',
    requestId: '',
    title: 'Contrato de Prestação de Serviços de Transporte',
    templateType: 'standard' as 'standard' | 'exclusive' | 'luxury',
    clauses: CONTRACT_TEMPLATES.standard.clauses,
    status: 'draft' as 'draft' | 'active' | 'signed' | 'terminated',
    value: 0,
    observations: ''
  });

  const contracts = records.filter(r => r.type === 'contract') as Contract[];

  const filteredContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contractNumber.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      contractNumber: `CT-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: '',
      clientName: '',
      requestId: '',
      title: CONTRACT_TEMPLATES.standard.title,
      templateType: 'standard',
      clauses: CONTRACT_TEMPLATES.standard.clauses,
      status: 'draft',
      value: 0,
      observations: ''
    });
    setEditingContract(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      contractNumber: contract.contractNumber || '',
      clientId: contract.clientId || '',
      clientName: contract.clientName || '',
      requestId: contract.requestId || '',
      title: contract.title || '',
      templateType: contract.templateType || 'standard',
      clauses: contract.clauses || '',
      status: contract.status || 'draft',
      value: contract.value || 0,
      observations: contract.observations || ''
    });
    setIsFormOpen(true);
  };

  const handleTemplateChange = (type: 'standard' | 'exclusive' | 'luxury') => {
    const tmpl = CONTRACT_TEMPLATES[type];
    setFormData(prev => ({
      ...prev,
      templateType: type,
      title: tmpl.title,
      clauses: tmpl.clauses
    }));
  };

  const handleClientChange = (id: string) => {
    const matched = clients.find(c => c.id === id);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        clientId: id,
        clientName: matched.name
      }));
    }
  };

  const handleRequestChange = (id: string) => {
    const matched = requests.find(r => r.id === id);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        requestId: id,
        value: matched.totalValue
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert('Selecione um cliente para vincular o contrato.');
      return;
    }

    if (editingContract) {
      onUpdate(editingContract.id, {
        ...formData,
        value: Number(formData.value)
      });
    } else {
      const newContract: Contract = {
        id: generateId(),
        type: 'contract',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData,
        value: Number(formData.value)
      };
      onAdd(newContract);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDuplicate = (contract: Contract) => {
    const dup: Contract = {
      ...contract,
      id: generateId(),
      contractNumber: `${contract.contractNumber}-COPIA`,
      dateCreated: new Date().toISOString(),
      status: 'draft'
    };
    onAdd(dup);
    alert(`Contrato ${contract.contractNumber} duplicado como rascunho com sucesso!`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este contrato? Esta ação é permanente.')) {
      onDelete(id);
    }
  };

  const handleStatusChange = (id: string, nextStatus: Contract['status']) => {
    onUpdate(id, { status: nextStatus });
    if (selectedContract?.id === id) {
      setSelectedContract(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const handlePrint = async () => {
    if (!selectedContract) return;
    setPdfLoading(true);
    try {
      const client = records.find(r => r.type === 'client' && r.id === selectedContract.clientId) as Client | undefined;
      await downloadContractPdf(selectedContract, client, config);
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Rascunho', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400' };
      case 'active':
        return { label: 'Ativo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' };
      case 'signed':
        return { label: 'Assinado', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' };
      case 'terminated':
        return { label: 'Rescindido', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' };
    }
  };

  return (
    <div className="space-y-6 fade-in print:p-0 print:bg-white print:text-black">
      {/* Hide on print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Contratos Comerciais</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gere minutas jurídicas com cláusulas configuráveis para formalização das cargas.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Gerar Contrato
        </button>
      </div>

      {/* Hide on print */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="md:col-span-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por título do contrato, cliente ou número..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Contratos Emitidos</span>
          <span className="text-xl font-bold text-brand">{contracts.length}</span>
        </div>
      </div>

      {/* Main Grid: List & Preview Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Contracts List - Hide on print */}
        <div className={`print:hidden ${selectedContract ? "xl:col-span-1.5 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}`}>
          {filteredContracts.length > 0 ? filteredContracts.map(c => {
            const badge = getStatusBadge(c.status);
            return (
              <div 
                key={c.id} 
                onClick={() => { setSelectedContract(c); setIsPreviewOpen(false); }}
                className={`p-5 bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                  selectedContract?.id === c.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs font-mono">{c.contractNumber}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide inline-block mt-1 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenEdit(c)} 
                        className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(c)} 
                        className="p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-zinc-850 dark:text-zinc-200 text-sm line-clamp-1">{c.title}</h5>
                    <p className="text-[11px] text-zinc-500 mt-1">Cliente: <strong>{c.clientName}</strong></p>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400">Valor do Contrato</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(c.value)}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhum contrato formalizado</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Crie termos comerciais estruturados para fechamento seguro com seus clientes.</p>
            </div>
          )}
        </div>

        {/* Selected Contract Preview & Legal Template Panel */}
        {selectedContract && (
          <div className="xl:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in print:p-0 print:border-none print:shadow-none">
            {/* Hide on print */}
            <button 
              onClick={() => setSelectedContract(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Actions header - Hide on print */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 print:hidden">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand" /> Visualização Legal do Termo
              </h3>
              
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> {pdfLoading ? 'Gerando...' : 'Baixar PDF'}
                </button>
              </div>
            </div>

            {/* Document Body for print and view */}
            <div className="space-y-6 max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-250 font-serif leading-relaxed text-xs print:bg-white print:text-black print:p-0 print:border-none">
              {/* Company Logo Header in contract */}
              <div className="text-center pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand">{config.companyName}</span>
                <h2 className="text-sm font-bold uppercase mt-1 tracking-wider text-zinc-950 dark:text-white print:text-black">{selectedContract.title}</h2>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">Nº Registro Eletrônico: {selectedContract.contractNumber}</p>
              </div>

              {/* Parties block */}
              <div className="space-y-3">
                <p className="font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-1 text-brand">1. DAS PARTES CONTRATANTES</p>
                <div className="space-y-1.5 font-sans not-italic text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                  <p><strong>CONTRATADA:</strong> {config.companyName}{config.companyCnpj ? `, CNPJ ${config.companyCnpj}` : ''}.</p>
                  <p><strong>CONTRATANTE (CLIENTE):</strong> {selectedContract.clientName} (Vínculo Cadastral ID: {selectedContract.clientId}).</p>
                </div>
              </div>

              {/* Transport request info */}
              {selectedContract.requestId && (
                <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-1 text-brand">2. DOS DADOS OPERACIONAIS E VALOR</p>
                  <p className="font-sans text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                    O transporte abrange o trecho e as especificações técnicas descritas na solicitação de código <strong>{selectedContract.requestId}</strong>, estabelecendo-se para todos os fins jurídicos o valor contratual de: <strong className="text-zinc-950 dark:text-white print:text-black text-sm">{formatCurrency(selectedContract.value)}</strong>.
                  </p>
                </div>
              )}

              {/* Clauses Editor layout */}
              <div className="space-y-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <p className="font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-1 text-brand">3. DAS CLÁUSULAS CONTRATUAIS</p>
                <div className="whitespace-pre-wrap leading-relaxed text-[11px] font-sans text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                  {selectedContract.clauses}
                </div>
              </div>

              {/* Signatures block */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center font-sans text-[10px] border-t border-zinc-200 dark:border-zinc-800 mt-12">
                <div className="space-y-4">
                  <div className="border-b border-zinc-300 dark:border-zinc-700 mx-4 h-6" />
                  <p className="font-bold uppercase">{config.companyName}</p>
                  <p className="text-zinc-400">Representante Legal (Contratada)</p>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-zinc-300 dark:border-zinc-700 mx-4 h-6" />
                  <p className="font-bold uppercase">{selectedContract.clientName}</p>
                  <p className="text-zinc-400">Contratante / Responsável Legal</p>
                </div>
              </div>
            </div>

            {/* Footer action to sign - Hide on print */}
            <div className="flex gap-2 mt-6 justify-end print:hidden">
              {selectedContract.status !== 'signed' && (
                <button 
                  onClick={() => handleStatusChange(selectedContract.id, 'signed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Marcar como Assinado
                </button>
              )}
              {selectedContract.status === 'draft' && (
                <button 
                  onClick={() => handleStatusChange(selectedContract.id, 'active')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  Ativar Minute
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contract Generation Form Drawer Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end transition-opacity">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 pb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono">CONTRATOS E MINUTAS</span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingContract ? 'Editar Contrato' : 'Novo Contrato Comercial'}
                </h3>
                <p className="text-xs text-zinc-400">Vincule a minuta jurídica a uma operação e configure as cláusulas de responsabilidades.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Nº do Contrato (Automático)</label>
                    <input
                      required
                      type="text"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({...formData, contractNumber: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Modelo de Cláusulas</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('standard')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          formData.templateType === 'standard' ? 'bg-brand text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        Padrão
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('exclusive')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          formData.templateType === 'exclusive' ? 'bg-brand text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        Cegonha
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('luxury')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          formData.templateType === 'luxury' ? 'bg-brand text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        Luxo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Título do Documento</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título oficial da minuta"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Vincular Cliente</label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="">Selecione o Cliente</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Vincular Operação (OS)</label>
                    <select
                      value={formData.requestId}
                      onChange={(e) => handleRequestChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="">Nenhuma - Avulso</option>
                      {requests.map(r => (
                        <option key={r.id} value={r.id}>{r.origin.split(',')[0]} ➜ {r.destination.split(',')[0]} ({formatCurrency(r.totalValue)})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Valor do Contrato (R$)</label>
                    <input
                      required
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Estado / Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="draft">Rascunho (Draft)</option>
                      <option value="active">Ativo (Em negociação)</option>
                      <option value="signed">Assinado (Válido)</option>
                      <option value="terminated">Rescindido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cláusulas Legais do Contrato</label>
                  <textarea
                    required
                    value={formData.clauses}
                    onChange={(e) => setFormData({...formData, clauses: e.target.value})}
                    rows={8}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Observações Privadas</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Anotações internas de negociação com o cliente."
                    rows={2}
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
                  {editingContract ? 'Salvar Contrato' : 'Gerar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
