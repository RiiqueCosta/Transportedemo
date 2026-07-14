/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, User, ChevronRight, X, MessageSquare, Clipboard } from 'lucide-react';
import { AppRecord, Client } from '../types';
import { generateId } from '../lib/utils';

interface ClientsViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

export function ClientsView({ records, onAdd, onUpdate, onDelete }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    rg: '',
    phone: '',
    whatsapp: '',
    email: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    observations: ''
  });

  const clients = records.filter(r => r.type === 'client') as Client[];

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpfCnpj.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      cpfCnpj: '',
      rg: '',
      phone: '',
      whatsapp: '',
      email: '',
      cep: '',
      address: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      observations: ''
    });
    setEditingClient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      cpfCnpj: client.cpfCnpj || '',
      rg: client.rg || '',
      phone: client.phone || '',
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      cep: client.cep || '',
      address: client.address || '',
      number: client.number || '',
      complement: client.complement || '',
      city: client.city || '',
      state: client.state || '',
      observations: client.observations || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdate(editingClient.id, {
        ...formData
      });
    } else {
      const newClient: Client = {
        id: generateId(),
        type: 'client',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData
      };
      onAdd(newClient);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Todos os transportes vinculados serão afetados.')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Clientes</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerenciamento completo dos clientes atendidos pela empresa.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Cliente
        </button>
      </div>

      {/* Search & Statistics summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF/CNPJ, email ou cidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase">Total de Clientes</span>
          <span className="text-xl font-black text-brand">{clients.length}</span>
        </div>
      </div>

      {/* Main Grid: Listing & Detail Pane */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Clients List */}
        <div className={selectedClient ? "xl:col-span-2 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredClients.length > 0 ? filteredClients.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedClient(c)}
              className={`p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                selectedClient?.id === c.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 rounded-2xl flex items-center justify-center font-black text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">{c.name}</h4>
                      <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">{c.cpfCnpj}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 onClick-stop" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenEdit(c)} 
                      className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
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

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="line-clamp-1">{c.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.phone || c.whatsapp || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.city} - {c.state}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Criado em: {new Date(c.dateCreated).toLocaleDateString('pt-BR')}</span>
                <span className="text-brand font-bold flex items-center gap-0.5 group">
                  Ver Ficha <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <User className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhum cliente cadastrado</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Busque outra palavra-chave ou cadastre um novo cliente.</p>
            </div>
          )}
        </div>

        {/* Selected Client Side Panel / Ficha Detalhada */}
        {selectedClient && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in">
            <button 
              onClick={() => setSelectedClient(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-6">
              <Clipboard className="w-5 h-5 text-brand" /> Ficha do Cliente
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center font-black text-xl">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-base">{selectedClient.name}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 inline-block">
                    {selectedClient.cpfCnpj.length > 14 ? 'CNPJ' : 'CPF'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">CPF / CNPJ</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedClient.cpfCnpj}</p>
                </div>

                {selectedClient.rg && (
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">RG</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedClient.rg}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Telefone</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedClient.phone || 'Não cadastrado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">WhatsApp</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5 flex items-center gap-1">
                      {selectedClient.whatsapp ? (
                        <a href={`https://wa.me/55${selectedClient.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {selectedClient.whatsapp}
                        </a>
                      ) : 'Não cadastrado'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Email</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedClient.email || 'Não cadastrado'}</p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1"><MapPin className="w-3 h-3 text-brand" /> Endereço Oficial</p>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium mt-1 leading-normal">
                    {selectedClient.address}, nº {selectedClient.number} {selectedClient.complement && `(${selectedClient.complement})`} <br />
                    CEP: {selectedClient.cep} - {selectedClient.city}/{selectedClient.state}
                  </p>
                </div>

                {selectedClient.observations && (
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Observações Operacionais</p>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{selectedClient.observations}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleOpenEdit(selectedClient)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Editar Dados
                </button>
                <button 
                  onClick={() => handleDelete(selectedClient.id)}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Drawer / Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 pb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono">CADASTRO</span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha os dados abaixo com cuidado. Estes dados serão usados na geração dos contratos automáticos.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Nome Completo / Razão Social</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo do cliente"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">CPF ou CNPJ</label>
                    <input
                      required
                      type="text"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({...formData, cpfCnpj: e.target.value})}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">RG (Opcional)</label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => setFormData({...formData, rg: e.target.value})}
                      placeholder="Identidade"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(00) 0000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Celular / WhatsApp</label>
                    <input
                      required
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Email Principal</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@cliente.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">LOCALIZAÇÃO / ENDEREÇO</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">CEP</label>
                    <input
                      required
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      placeholder="00000-000"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Rua / Logradouro</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Av. Paulista, etc."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Número</label>
                    <input
                      required
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                      placeholder="123"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Complemento / Bairro</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData({...formData, complement: e.target.value})}
                      placeholder="Apto, Bloco, Bairro"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cidade</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="São Paulo"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Estado (UF)</label>
                    <input
                      required
                      type="text"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      placeholder="SP"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Observações Internas</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Instruções de entrega, restrições de horários, etc."
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
                  {editingClient ? 'Salvar Cliente' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
