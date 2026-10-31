/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Truck, Eye, X, Calendar, AlertTriangle, ShieldCheck, RefreshCw, PenTool, ChevronRight } from 'lucide-react';
import { AppRecord, Fleet } from '../types';
import { generateId } from '../lib/utils';

interface FleetViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

export function FleetView({ records, onAdd, onUpdate, onDelete }: FleetViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);

  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    brand: '',
    fleetType: 'truck' as 'car' | 'van' | 'truck',
    capacity: '',
    year: '',
    renavam: '',
    chassis: '',
    currentMileage: 0,
    status: 'available' as 'available' | 'in_transit' | 'maintenance' | 'inactive',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    licensingDate: '',
    insuranceExpiry: '',
    observations: ''
  });

  const fleet = records.filter(r => r.type === 'fleet') as Fleet[];

  const filteredFleet = fleet.filter(f => 
    f.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.fleetType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      plate: '',
      model: '',
      brand: '',
      fleetType: 'truck',
      capacity: '',
      year: '',
      renavam: '',
      chassis: '',
      currentMileage: 0,
      status: 'available',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      licensingDate: '',
      insuranceExpiry: '',
      observations: ''
    });
    setEditingFleet(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Fleet) => {
    setEditingFleet(vehicle);
    setFormData({
      plate: vehicle.plate || '',
      model: vehicle.model || '',
      brand: vehicle.brand || '',
      fleetType: vehicle.fleetType || 'truck',
      capacity: vehicle.capacity || '',
      year: vehicle.year || '',
      renavam: vehicle.renavam || '',
      chassis: vehicle.chassis || '',
      currentMileage: vehicle.currentMileage || 0,
      status: vehicle.status || 'available',
      lastMaintenanceDate: vehicle.lastMaintenanceDate || '',
      nextMaintenanceDate: vehicle.nextMaintenanceDate || '',
      licensingDate: vehicle.licensingDate || '',
      insuranceExpiry: vehicle.insuranceExpiry || '',
      observations: vehicle.observations || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFleet) {
      onUpdate(editingFleet.id, {
        ...formData,
        currentMileage: Number(formData.currentMileage)
      });
    } else {
      const newFleet: Fleet = {
        id: generateId(),
        type: 'fleet',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData,
        currentMileage: Number(formData.currentMileage)
      };
      onAdd(newFleet);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo da frota interna?')) {
      onDelete(id);
    }
  };

  const getStatusLabel = (status: Fleet['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Disponível', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' };
      case 'in_transit':
        return { label: 'Em Transporte', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' };
      case 'maintenance':
        return { label: 'Em Manutenção', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' };
      case 'inactive':
        return { label: 'Inativo', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' };
    }
  };

  const getFleetTypeLabel = (type: Fleet['fleetType']) => {
    switch (type) {
      case 'car': return 'Carro / Cegonha leve';
      case 'van': return 'Van / Prancha leve';
      case 'truck': return 'Caminhão Prancha / Cegonha';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Frota de Veículos</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie todos os veículos próprios da empresa que efetuam os transportes de carga.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Veículo
        </button>
      </div>

      {/* Search & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por marca, modelo, placa ou tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Veículos Ativos</span>
          <span className="text-xl font-bold text-brand">{fleet.length}</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Disponíveis agora</span>
          <span className="text-xl font-bold text-emerald-600">{fleet.filter(f => f.status === 'available').length}</span>
        </div>
      </div>

      {/* Main Grid: Listing & Detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Fleet List */}
        <div className={selectedFleet ? "xl:col-span-2 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredFleet.length > 0 ? filteredFleet.map(f => {
            const statusStyle = getStatusLabel(f.status);
            return (
              <div 
                key={f.id} 
                onClick={() => setSelectedFleet(f)}
                className={`p-5 bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                  selectedFleet?.id === f.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 rounded-2xl flex items-center justify-center">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">{f.brand} {f.model}</h4>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 block">
                          {getFleetTypeLabel(f.fleetType)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
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
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 rounded uppercase bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 tracking-wider">
                      {f.plate}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">KM Atual</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{f.currentMileage.toLocaleString('pt-BR')} km</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Capacidade</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{f.capacity || 'Não informada'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Próx. Revisão: {f.nextMaintenanceDate ? f.nextMaintenanceDate.split('-').reverse().join('/') : 'Não informada'}</span>
                  <span className="text-brand font-bold flex items-center gap-0.5">
                    Ficha <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Truck className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhum veículo próprio na frota</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cadastre seus caminhões pranchas ou guinchos para iniciar operações.</p>
            </div>
          )}
        </div>

        {/* Fleet Vehicle Detailed Ficha Sidepanel */}
        {selectedFleet && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in">
            <button 
              onClick={() => setSelectedFleet(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-6">
              <PenTool className="w-5 h-5 text-brand" /> Auditoria de Frota
            </h3>

            <div className="space-y-6 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{selectedFleet.brand} {selectedFleet.model}</h4>
                  <span className="px-2 py-0.5 rounded bg-brand text-white text-[10px] font-mono font-bold uppercase tracking-widest mt-1 inline-block">
                    {selectedFleet.plate}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Tipo de Veículo</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{getFleetTypeLabel(selectedFleet.fleetType)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Capacidade Operacional</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedFleet.capacity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Ano</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedFleet.year}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Quilometragem Atual</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedFleet.currentMileage.toLocaleString('pt-BR')} km</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Renavam</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedFleet.renavam || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Chassi</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedFleet.chassis || 'Não informado'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Cronograma de Manutenções e Documentos</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Última Revisão</p>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {selectedFleet.lastMaintenanceDate ? selectedFleet.lastMaintenanceDate.split('-').reverse().join('/') : 'Não informada'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Próxima Revisão</p>
                      <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {selectedFleet.nextMaintenanceDate ? selectedFleet.nextMaintenanceDate.split('-').reverse().join('/') : 'Não informada'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Venc. Licenciamento</p>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {selectedFleet.licensingDate ? selectedFleet.licensingDate.split('-').reverse().join('/') : 'Não informado'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Vencimento Seguro</p>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {selectedFleet.insuranceExpiry ? selectedFleet.insuranceExpiry.split('-').reverse().join('/') : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFleet.observations && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Observações Operacionais</p>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{selectedFleet.observations}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleOpenEdit(selectedFleet)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Editar Dados
                </button>
                <button 
                  onClick={() => handleDelete(selectedFleet.id)}
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
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono">FROTA PROPRIA</span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingFleet ? 'Editar Veículo da Frota' : 'Novo Veículo na Frota'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha as características, placas e datas de controle legal do veículo da empresa.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Marca</label>
                    <input
                      required
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Ex: Mercedes-Benz, Volvo"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Modelo</label>
                    <input
                      required
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Ex: Actros, VM 330"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Tipo</label>
                    <select
                      value={formData.fleetType}
                      onChange={(e) => setFormData({...formData, fleetType: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="car">Carro / Picape</option>
                      <option value="van">Van / Furgão</option>
                      <option value="truck">Caminhão Prancha</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Capacidade</label>
                    <input
                      required
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      placeholder="Ex: 3 Veículos, 10 Ton"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Ano</label>
                    <input
                      required
                      type="text"
                      maxLength={4}
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      placeholder="2020"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Placa</label>
                    <input
                      required
                      type="text"
                      maxLength={8}
                      value={formData.plate}
                      onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                      placeholder="ABC1D23"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Renavam</label>
                    <input
                      required
                      type="text"
                      value={formData.renavam}
                      onChange={(e) => setFormData({...formData, renavam: e.target.value})}
                      placeholder="Código Renavam"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Chassi</label>
                    <input
                      required
                      type="text"
                      value={formData.chassis}
                      onChange={(e) => setFormData({...formData, chassis: e.target.value})}
                      placeholder="Código do Chassi"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">KM Atual</label>
                    <input
                      required
                      type="number"
                      value={formData.currentMileage || ''}
                      onChange={(e) => setFormData({...formData, currentMileage: Number(e.target.value)})}
                      placeholder="Ex: 145000"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Situação / Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="available">Disponível</option>
                      <option value="in_transit">Em Transporte</option>
                      <option value="maintenance">Em Manutenção</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Última Revisão</label>
                    <input
                      type="date"
                      value={formData.lastMaintenanceDate}
                      onChange={(e) => setFormData({...formData, lastMaintenanceDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Próxima Revisão</label>
                    <input
                      type="date"
                      value={formData.nextMaintenanceDate}
                      onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Licenciamento</label>
                    <input
                      type="date"
                      value={formData.licensingDate}
                      onChange={(e) => setFormData({...formData, licensingDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Vencimento Seguro</label>
                    <input
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Observações Operacionais</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Informações adicionais de controle da frota, avarias prévias no caminhão, etc."
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
                  {editingFleet ? 'Salvar Veículo' : 'Cadastrar na Frota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
