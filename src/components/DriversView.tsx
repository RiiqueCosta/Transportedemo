/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck, Eye, X, Calendar, MapPin, Shield, Smartphone, Heart, ChevronRight } from 'lucide-react';
import { AppRecord, Driver } from '../types';
import { generateId } from '../lib/utils';

interface DriversViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

export function DriversView({ records, onAdd, onUpdate, onDelete }: DriversViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    phone: '',
    cnh: '',
    cnhCategory: 'D' as 'A' | 'B' | 'C' | 'D' | 'E',
    cnhExpiry: '',
    city: '',
    state: '',
    status: 'available' as 'available' | 'on_trip' | 'off_duty' | 'inactive',
    bloodType: '',
    observations: ''
  });

  const drivers = records.filter(r => r.type === 'driver') as Driver[];

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.cpf.includes(searchTerm) ||
    d.cnh.includes(searchTerm) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      cpf: '',
      rg: '',
      phone: '',
      cnh: '',
      cnhCategory: 'D',
      cnhExpiry: '',
      city: '',
      state: '',
      status: 'available',
      bloodType: '',
      observations: ''
    });
    setEditingDriver(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      cpf: driver.cpf || '',
      rg: driver.rg || '',
      phone: driver.phone || '',
      cnh: driver.cnh || '',
      cnhCategory: driver.cnhCategory || 'D',
      cnhExpiry: driver.cnhExpiry || '',
      city: driver.city || '',
      state: driver.state || '',
      status: driver.status || 'available',
      bloodType: driver.bloodType || '',
      observations: driver.observations || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      onUpdate(editingDriver.id, {
        ...formData
      });
    } else {
      const newDriver: Driver = {
        id: generateId(),
        type: 'driver',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData
      };
      onAdd(newDriver);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este motorista?')) {
      onDelete(id);
    }
  };

  const getStatusLabel = (status: Driver['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Disponível', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' };
      case 'on_trip':
        return { label: 'Em Viagem', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' };
      case 'off_duty':
        return { label: 'De Folga / Descanso', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400' };
      case 'inactive':
        return { label: 'Inativo', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' };
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Motoristas</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Cadastre a equipe de condutores habilitados para pilotar os veículos da frota logística.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Motorista
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF, CNH ou cidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Cadastrados</span>
          <span className="text-xl font-black text-brand">{drivers.length}</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Disponíveis agora</span>
          <span className="text-xl font-black text-emerald-600">{drivers.filter(d => d.status === 'available').length}</span>
        </div>
      </div>

      {/* Main Grid: Listing & Detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Drivers List */}
        <div className={selectedDriver ? "xl:col-span-2 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredDrivers.length > 0 ? filteredDrivers.map(d => {
            const statusStyle = getStatusLabel(d.status);
            return (
              <div 
                key={d.id} 
                onClick={() => setSelectedDriver(d)}
                className={`p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                  selectedDriver?.id === d.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-lg">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">{d.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{d.cpf}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenEdit(d)} 
                        className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded uppercase">
                      CNH Cat: <strong>{d.cnhCategory}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{d.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{d.city} - {d.state}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Validade: {d.cnhExpiry ? d.cnhExpiry.split('-').reverse().join('/') : 'Não informada'}</span>
                  <span className="text-brand font-bold flex items-center gap-0.5">
                    Ficha <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <UserCheck className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhum motorista cadastrado</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Busque outra palavra-chave ou cadastre um novo condutor.</p>
            </div>
          )}
        </div>

        {/* Selected Driver Detailed Ficha Sidepanel */}
        {selectedDriver && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in">
            <button 
              onClick={() => setSelectedDriver(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-brand" /> Registro de Condutor
            </h3>

            <div className="space-y-6 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl">
                  {selectedDriver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-base">{selectedDriver.name}</h4>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 font-bold uppercase mt-1 inline-block">
                    CNH Categoria {selectedDriver.cnhCategory}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">CPF</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedDriver.cpf}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">RG</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedDriver.rg || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Telefone de Contato</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedDriver.phone || 'Não informado'}</p>
                  </div>
                  {selectedDriver.bloodType && (
                    <div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500" /> Tipo Sanguíneo
                      </p>
                      <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5 text-red-600 dark:text-red-400">{selectedDriver.bloodType}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Registro CNH</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedDriver.cnh}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Validade da Habilitação</p>
                    <p className={`font-bold mt-0.5 ${
                      selectedDriver.cnhExpiry && new Date(selectedDriver.cnhExpiry) < new Date() ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {selectedDriver.cnhExpiry ? selectedDriver.cnhExpiry.split('-').reverse().join('/') : 'Não informada'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Base de Operações (Cidade/UF)</p>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium mt-0.5">{selectedDriver.city} / {selectedDriver.state}</p>
                </div>

                {selectedDriver.observations && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Instruções Médicas / Prontuário</p>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{selectedDriver.observations}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleOpenEdit(selectedDriver)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Editar Dados
                </button>
                <button 
                  onClick={() => handleDelete(selectedDriver.id)}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Overlay Side-Drawer */}
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
                  {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha as informações pessoais, número de registro CNH e a validade de trânsito.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo do condutor"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">CPF</label>
                    <input
                      required
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">RG (Opcional)</label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => setFormData({...formData, rg: e.target.value})}
                      placeholder="Carteira de Identidade"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Telefone / Celular</label>
                    <input
                      required
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Tipo Sanguíneo / Fator RH</label>
                    <input
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                      placeholder="Ex: O+, A-"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">DOCUMENTAÇÃO / HABILITAÇÃO</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Nº Registro CNH</label>
                    <input
                      required
                      type="text"
                      value={formData.cnh}
                      onChange={(e) => setFormData({...formData, cnh: e.target.value})}
                      placeholder="Número da Habilitação"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Categoria</label>
                    <select
                      value={formData.cnhCategory}
                      onChange={(e) => setFormData({...formData, cnhCategory: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold text-center"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Vencimento CNH</label>
                    <input
                      required
                      type="date"
                      value={formData.cnhExpiry}
                      onChange={(e) => setFormData({...formData, cnhExpiry: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Situação / Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="available">Disponível</option>
                      <option value="on_trip">Em Viagem</option>
                      <option value="off_duty">De Folga / Descanso</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cidade Sede</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Cidade"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Restrições Médicas / Observações</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Ex: Usa óculos de grau obrigatoriamente, restrições a viagens noturnas de longa distância, contatos de emergência."
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
                  {editingDriver ? 'Salvar Motorista' : 'Cadastrar Motorista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
