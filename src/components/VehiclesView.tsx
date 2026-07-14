/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Car, Eye, X, Tag, Calendar, DollarSign, PenTool, Hash, ChevronRight } from 'lucide-react';
import { AppRecord, VehicleTransported } from '../types';
import { formatCurrency, generateId } from '../lib/utils';

interface VehiclesViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

export function VehiclesView({ records, onAdd, onUpdate, onDelete }: VehiclesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleTransported | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTransported | null>(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    plate: '',
    renavam: '',
    chassis: '',
    fuel: '',
    value: 0,
    observations: '',
    imageUrl: ''
  });

  const vehicles = records.filter(r => r.type === 'vehicle_transported') as VehicleTransported[];

  const filteredVehicles = vehicles.filter(v => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.chassis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      color: '',
      plate: '',
      renavam: '',
      chassis: '',
      fuel: 'Flex',
      value: 0,
      observations: '',
      imageUrl: ''
    });
    setEditingVehicle(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: VehicleTransported) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      color: vehicle.color || '',
      plate: vehicle.plate || '',
      renavam: vehicle.renavam || '',
      chassis: vehicle.chassis || '',
      fuel: vehicle.fuel || 'Flex',
      value: vehicle.value || 0,
      observations: vehicle.observations || '',
      imageUrl: vehicle.imageUrl || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onUpdate(editingVehicle.id, {
        ...formData,
        value: Number(formData.value)
      });
    } else {
      const newVehicle: VehicleTransported = {
        id: generateId(),
        type: 'vehicle_transported',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData,
        value: Number(formData.value)
      };
      onAdd(newVehicle);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este veículo transportado?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Veículos Transportados</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Cadastre e gerencie a carteira de veículos dos clientes que necessitam de transporte.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Veículo
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por marca, modelo, placa ou chassi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase">Veículos Ativos</span>
          <span className="text-xl font-black text-brand">{vehicles.length}</span>
        </div>
      </div>

      {/* Main Grid: Listing & Detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* List of Vehicles */}
        <div className={selectedVehicle ? "xl:col-span-2 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
            <div 
              key={v.id} 
              onClick={() => setSelectedVehicle(v)}
              className={`p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                selectedVehicle?.id === v.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">{v.brand} {v.model}</h4>
                      <p className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block font-mono">{v.plate}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenEdit(v)} 
                      className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)} 
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Ano: <strong>{v.year}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cor: <strong>{v.color}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Valor Seguradora: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(v.value)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Combustível: {v.fuel}</span>
                <span className="text-brand font-bold flex items-center gap-0.5 group">
                  Ver Ficha <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <Car className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhum veículo cadastrado</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Busque outra palavra-chave ou cadastre um novo veículo de cliente.</p>
            </div>
          )}
        </div>

        {/* Vehicle Ficha Detalhada Sidepanel */}
        {selectedVehicle && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-6">
              <PenTool className="w-5 h-5 text-brand" /> Ficha do Veículo
            </h3>

            <div className="space-y-6">
              {selectedVehicle.imageUrl && (
                <div className="w-full h-36 bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-800">
                  <img src={selectedVehicle.imageUrl} alt="Foto do veículo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-base">{selectedVehicle.brand} {selectedVehicle.model}</h4>
                  <span className="px-2 py-0.5 rounded bg-brand text-white text-[10px] font-mono font-bold uppercase tracking-widest mt-1 inline-block">
                    {selectedVehicle.plate}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Marca</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedVehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Modelo</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedVehicle.model}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Ano</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Cor</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Combustível</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">{selectedVehicle.fuel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Renavam</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedVehicle.renavam || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Chassi</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono mt-0.5">{selectedVehicle.chassis || 'Não informado'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Valor de Mercado do Veículo</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(selectedVehicle.value)}</p>
                  <p className="text-[9px] text-zinc-400 leading-normal mt-1">Este valor é utilizado como base de cálculo para a apólice de seguro obrigatório de cargas.</p>
                </div>

                {selectedVehicle.observations && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Avarias / Observações</p>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{selectedVehicle.observations}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleOpenEdit(selectedVehicle)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Editar Dados
                </button>
                <button 
                  onClick={() => handleDelete(selectedVehicle.id)}
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
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono font-bold">CADASTRO</span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {editingVehicle ? 'Editar Veículo' : 'Novo Veículo Transportado'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha as características e números de identificação do veículo do cliente.</p>
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
                      placeholder="Ex: Chevrolet, Fiat"
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
                      placeholder="Ex: Onix, Argo"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Ano</label>
                    <input
                      required
                      type="text"
                      maxLength={4}
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      placeholder="2024"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cor</label>
                    <input
                      required
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="Preto, Prata"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Combustível</label>
                    <select
                      value={formData.fuel}
                      onChange={(e) => setFormData({...formData, fuel: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="Flex">Flex</option>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Etanol">Etanol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Elétrico">Elétrico</option>
                    </select>
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
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium font-mono text-center"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Chassi</label>
                  <input
                    required
                    type="text"
                    value={formData.chassis}
                    onChange={(e) => setFormData({...formData, chassis: e.target.value})}
                    placeholder="Chassi de identificação"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Valor Comercial do Veículo (R$)</label>
                  <input
                    required
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    placeholder="Ex: 85000"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Link da Foto (Opcional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Avarias / Observações Adicionais</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Descreva detalhes como riscos na pintura, amassados, peças faltando para vistoria de carga."
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
                  {editingVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
