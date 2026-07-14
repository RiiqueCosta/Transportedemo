/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Compass, Eye, X, MapPin, 
  Calendar, User, Truck, Car, Calculator, HelpCircle, 
  CheckCircle, ArrowRight, DollarSign, RefreshCcw, Info, ChevronRight
} from 'lucide-react';
import { AppRecord, TransportRequest, Client, VehicleTransported, Driver, Fleet } from '../types';
import { formatCurrency, generateId } from '../lib/utils';

interface TransportRequestsViewProps {
  records: AppRecord[];
  onAdd: (record: AppRecord) => void;
  onUpdate: (id: string, record: Partial<AppRecord>) => void;
  onDelete: (id: string) => void;
}

export function TransportRequestsView({ records, onAdd, onUpdate, onDelete }: TransportRequestsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);

  // Lists for dropdown selections
  const clients = records.filter(r => r.type === 'client') as Client[];
  const vehicles = records.filter(r => r.type === 'vehicle_transported') as VehicleTransported[];
  const drivers = records.filter(r => r.type === 'driver' && r.status === 'available') as Driver[];
  const fleet = records.filter(r => r.type === 'fleet' && r.status === 'available') as Fleet[];

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    vehicleId: '',
    vehicleName: '',
    origin: '',
    destination: '',
    distanceKm: 0,
    collectDate: '',
    estimatedDeliveryDate: '',
    driverId: '',
    driverName: '',
    fleetId: '',
    fleetPlate: '',
    status: 'scheduled' as TransportRequest['status'],
    tollCost: 0,
    insuranceCost: 0,
    baseValue: 0,
    totalValue: 0,
    observations: ''
  });

  // Calculator State
  const [calcDistance, setCalcDistance] = useState(0);
  const [calcRatePerKm, setCalcRatePerKm] = useState(2.80);
  const [calcVehicleValue, setCalcVehicleValue] = useState(0);
  const [calcInsurancePct, setCalcInsurancePct] = useState(0.1); // 0.1%
  const [calcTolls, setCalcTolls] = useState(85.0);
  const [calcFlatFee, setCalcFlatFee] = useState(150.0);

  // Auto calculate when inputs change
  useEffect(() => {
    const base = calcDistance * calcRatePerKm + calcFlatFee;
    const insurance = (calcVehicleValue * calcInsurancePct) / 100;
    const total = base + insurance + calcTolls;

    setFormData(prev => ({
      ...prev,
      distanceKm: calcDistance,
      baseValue: Math.round(base * 100) / 100,
      insuranceCost: Math.round(insurance * 100) / 100,
      tollCost: calcTolls,
      totalValue: Math.round(total * 100) / 100
    }));
  }, [calcDistance, calcRatePerKm, calcVehicleValue, calcInsurancePct, calcTolls, calcFlatFee]);

  const requests = records.filter(r => r.type === 'transport_request') as TransportRequest[];

  const filteredRequests = requests.filter(r => 
    r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      vehicleId: '',
      vehicleName: '',
      origin: '',
      destination: '',
      distanceKm: 0,
      collectDate: '',
      estimatedDeliveryDate: '',
      driverId: '',
      driverName: '',
      fleetId: '',
      fleetPlate: '',
      status: 'scheduled',
      tollCost: 85,
      insuranceCost: 0,
      baseValue: 0,
      totalValue: 0,
      observations: ''
    });
    setCalcDistance(0);
    setCalcVehicleValue(0);
    setEditingRequest(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (req: TransportRequest) => {
    setEditingRequest(req);
    setFormData({
      clientId: req.clientId || '',
      clientName: req.clientName || '',
      vehicleId: req.vehicleId || '',
      vehicleName: req.vehicleName || '',
      origin: req.origin || '',
      destination: req.destination || '',
      distanceKm: req.distanceKm || 0,
      collectDate: req.collectDate || '',
      estimatedDeliveryDate: req.estimatedDeliveryDate || '',
      driverId: req.driverId || '',
      driverName: req.driverName || '',
      fleetId: req.fleetId || '',
      fleetPlate: req.fleetPlate || '',
      status: req.status || 'scheduled',
      tollCost: req.tollCost || 0,
      insuranceCost: req.insuranceCost || 0,
      baseValue: req.baseValue || 0,
      totalValue: req.totalValue || 0,
      observations: req.observations || ''
    });
    setCalcDistance(req.distanceKm || 0);
    
    // Attempt to resolve vehicle value
    const matchedVeh = vehicles.find(v => v.id === req.vehicleId);
    if (matchedVeh) {
      setCalcVehicleValue(matchedVeh.value);
    }

    setIsFormOpen(true);
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

  const handleVehicleChange = (id: string) => {
    const matched = vehicles.find(v => v.id === id);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        vehicleId: id,
        vehicleName: `${matched.brand} ${matched.model} (${matched.plate})`
      }));
      setCalcVehicleValue(matched.value);
    }
  };

  const handleDriverChange = (id: string) => {
    const matched = drivers.find(d => d.id === id);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        driverId: id,
        driverName: matched.name
      }));
    }
  };

  const handleFleetChange = (id: string) => {
    const matched = fleet.find(f => f.id === id);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        fleetId: id,
        fleetPlate: matched.plate
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.vehicleId) {
      alert('Por favor, selecione um cliente e um veículo.');
      return;
    }

    if (editingRequest) {
      onUpdate(editingRequest.id, {
        ...formData
      });
    } else {
      const newRequest: TransportRequest = {
        id: generateId(),
        type: 'transport_request',
        dateCreated: new Date().toISOString(),
        ownerId: '', // Added by useData hook
        ...formData
      };
      onAdd(newRequest);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleStatusChange = (reqId: string, nextStatus: TransportRequest['status']) => {
    onUpdate(reqId, { status: nextStatus });
    if (selectedRequest?.id === reqId) {
      setSelectedRequest(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta solicitação de transporte? Isso removerá o agendamento.')) {
      onDelete(id);
    }
  };

  const getStatusBadge = (status: TransportRequest['status']) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Agendado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' };
      case 'collected':
        return { label: 'Coletado', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' };
      case 'in_transit':
        return { label: 'Em Rota', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' };
      case 'delivered':
        return { label: 'Entregue', color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' };
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Solicitações de Transporte</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Roteirização, cálculo de fretes com seguro e controle de status de entrega.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md shadow-brand/10 hover:bg-brand-dark transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Operação
        </button>
      </div>

      {/* Search and operational metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, veículo, origem ou destino..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Coletas Ativas</span>
          <span className="text-xl font-black text-brand">{requests.filter(r => r.status !== 'delivered' && r.status !== 'cancelled').length}</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Finalizados</span>
          <span className="text-xl font-black text-emerald-600">{requests.filter(r => r.status === 'delivered').length}</span>
        </div>
      </div>

      {/* Main Interface Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Operations List */}
        <div className={selectedRequest ? "xl:col-span-2 space-y-3" : "xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredRequests.length > 0 ? filteredRequests.map(r => {
            const badge = getStatusBadge(r.status);
            return (
              <div 
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                className={`p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 shadow-sm cursor-pointer hover:border-brand/50 flex flex-col justify-between ${
                  selectedRequest?.id === r.id ? "border-brand ring-2 ring-brand/10" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1 mt-1.5">{r.clientName}</h4>
                    </div>

                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenEdit(r)} 
                        className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl space-y-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-brand" /> {r.vehicleName}
                    </p>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono space-y-0.5">
                      <p className="flex items-center gap-1"><span className="text-blue-500">●</span> {r.origin}</p>
                      <p className="flex items-center gap-1"><span className="text-emerald-500">●</span> {r.destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Data de Coleta</p>
                      <p className="text-zinc-750 dark:text-zinc-200 mt-0.5">{r.collectDate ? r.collectDate.split('-').reverse().join('/') : 'A definir'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Valor do Frete</p>
                      <p className="text-zinc-900 dark:text-zinc-100 font-black mt-0.5">{formatCurrency(r.totalValue)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Distância: {r.distanceKm} km</span>
                  <span className="text-brand font-bold flex items-center gap-0.5">
                    Detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white dark:bg-zinc-900 py-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <Compass className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Nenhuma transporte registrado</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Clique em "Nova Operação" e use o Roteirizador de Preços.</p>
            </div>
          )}
        </div>

        {/* Detailed operational log & status workflow panel */}
        {selectedRequest && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-brand/30 dark:border-zinc-800 shadow-lg relative fade-in">
            <button 
              onClick={() => setSelectedRequest(null)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-6">
              <Compass className="w-5 h-5 text-brand" /> Auditoria de Operação
            </h3>

            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Cliente Contratante</p>
                  <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedRequest.clientName}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusBadge(selectedRequest.status).color}`}>
                  {getStatusBadge(selectedRequest.status).label}
                </span>
              </div>

              {/* Status workflow transitions */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-3">Atualizar Status Logístico</span>
                
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => handleStatusChange(selectedRequest.id, 'scheduled')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRequest.status === 'scheduled' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-850'
                    }`}
                  >
                    Agendar
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedRequest.id, 'collected')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRequest.status === 'collected' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-850'
                    }`}
                  >
                    Coletar
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedRequest.id, 'in_transit')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRequest.status === 'in_transit' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-850'
                    }`}
                  >
                    Roteirar (Em viagem)
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedRequest.id, 'delivered')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRequest.status === 'delivered' ? 'bg-green-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-850'
                    }`}
                  >
                    Entregar
                  </button>
                </div>
              </div>

              {/* Cargo info */}
              <div className="space-y-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Carga Transportada</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedRequest.vehicleName}</p>
                    <p className="text-[10px] text-zinc-400">ID da Carga: {selectedRequest.vehicleId}</p>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="space-y-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Rota e Distância</span>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Origem da Coleta</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{selectedRequest.origin}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Destino da Entrega</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{selectedRequest.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-bold bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900/40">
                  <span className="text-zinc-400">Distância Total:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{selectedRequest.distanceKm} KM</span>
                </div>
              </div>

              {/* Driver & Truck Assignment */}
              <div className="space-y-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Alocação de Recursos Próprios</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold">Motorista Responsável</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{selectedRequest.driverName || 'Nenhum alocado'}</p>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold">Cegonha / Placa Frota</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{selectedRequest.fleetPlate ? `Placa ${selectedRequest.fleetPlate}` : 'Nenhum alocado'}</p>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/30">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Composição de Preços e Despesas</span>
                
                <div className="space-y-1.5 text-[11px] font-medium text-zinc-650 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Custo Logístico de Frete:</span>
                    <span>{formatCurrency(selectedRequest.baseValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Seguro de Carga:</span>
                    <span>{formatCurrency(selectedRequest.insuranceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedágios / Custos de Rodovia:</span>
                    <span>{formatCurrency(selectedRequest.tollCost)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-emerald-600 dark:text-emerald-400 pt-1.5 border-t border-emerald-100/20">
                    <span>Valor Total Faturado:</span>
                    <span>{formatCurrency(selectedRequest.totalValue)}</span>
                  </div>
                </div>
              </div>

              {selectedRequest.observations && (
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Observações Operacionais</p>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{selectedRequest.observations}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => handleOpenEdit(selectedRequest)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Editar Operação
                </button>
                <button 
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Roteirizador intelligent form overlay slider */}
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
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider font-mono">ROTEIRIZADOR INTELIGENTE</span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {editingRequest ? 'Editar Operação' : 'Nova Operação / Cotação Inteligente'}
                </h3>
                <p className="text-xs text-zinc-400">Utilize nossa calculadora dinâmica integrada para estimar frete com seguro automático.</p>
              </div>

              <div className="space-y-6">
                {/* 1. Parties section */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Vínculo de Clientes e Cargas</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cliente Solicitante</label>
                      <select
                        required
                        value={formData.clientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                      >
                        <option value="">Selecione o Cliente</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.cpfCnpj})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Veículo do Cliente (Carga)</label>
                      <select
                        required
                        value={formData.vehicleId}
                        onChange={(e) => handleVehicleChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                      >
                        <option value="">Selecione o Veículo</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Routes info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Endereço de Coleta (Origem)</label>
                    <input
                      required
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      placeholder="Ex: São Paulo, SP - Bairro"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Endereço de Entrega (Destino)</label>
                    <input
                      required
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      placeholder="Ex: Rio de Janeiro, RJ - Bairro"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    />
                  </div>
                </div>

                {/* 3. Intelligent Calculator widget */}
                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-3xl border border-blue-100/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand uppercase flex items-center gap-1.5 font-mono">
                      <Calculator className="w-4 h-4 text-brand" /> Simulador de Custo Logístico
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400">Valores base editáveis</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Distância da Rota (KM)</label>
                      <input
                        required
                        type="number"
                        value={calcDistance || ''}
                        onChange={(e) => setCalcDistance(Number(e.target.value))}
                        placeholder="Ex: 450"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tarifa por KM (R$)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={calcRatePerKm || ''}
                        onChange={(e) => setCalcRatePerKm(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Valor do Seguro (Ad Valorem %)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={calcInsurancePct || ''}
                        onChange={(e) => setCalcInsurancePct(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-amber-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tarifa Fixa / Despacho (R$)</label>
                      <input
                        required
                        type="number"
                        value={calcFlatFee || ''}
                        onChange={(e) => setCalcFlatFee(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Estimativa de Pedágios (R$)</label>
                      <input
                        required
                        type="number"
                        value={calcTolls || ''}
                        onChange={(e) => setCalcTolls(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Valor da Carga (Apólice R$)</label>
                      <p className="px-3 py-2 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-sm font-black text-zinc-700 dark:text-zinc-300 font-mono">
                        {formatCurrency(calcVehicleValue)}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Result Breakdown inside the Form */}
                  <div className="pt-3 border-t border-blue-200/20 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-white dark:bg-zinc-900/60 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Frete Base</p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(formData.baseValue)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-zinc-900/60 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Seguro</p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(formData.insuranceCost)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-zinc-900/60 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Pedágios</p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(formData.tollCost)}</p>
                    </div>
                    <div className="p-2 bg-blue-600 rounded-xl text-white">
                      <p className="text-[9px] text-blue-100 font-bold uppercase">Preço Estimado</p>
                      <p className="text-xs font-black">{formatCurrency(formData.totalValue)}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Scheduling details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Data Agendada da Coleta</label>
                    <input
                      required
                      type="date"
                      value={formData.collectDate}
                      onChange={(e) => setFormData({...formData, collectDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Previsão Estimada de Entrega</label>
                    <input
                      required
                      type="date"
                      value={formData.estimatedDeliveryDate}
                      onChange={(e) => setFormData({...formData, estimatedDeliveryDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* 5. Resource Allocation */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Alocação de Operação Própria (Opcional no Agendamento)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Motorista Executor</label>
                      <select
                        value={formData.driverId}
                        onChange={(e) => handleDriverChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                      >
                        <option value="">Nenhum - Alocar Depois</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} (CNH {d.cnhCategory})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Cegonha / Guincho da Frota</label>
                      <select
                        value={formData.fleetId}
                        onChange={(e) => handleFleetChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                      >
                        <option value="">Nenhum - Alocar Depois</option>
                        {fleet.map(f => (
                          <option key={f.id} value={f.id}>{f.brand} {f.model} (Placa {f.plate})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status selection */}
                {editingRequest && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Status Operacional</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100 font-medium"
                    >
                      <option value="scheduled">Agendado (Aguardando coleta)</option>
                      <option value="collected">Coletado (Pátio de transbordo)</option>
                      <option value="in_transit">Em Trânsito / Rota rodoviária</option>
                      <option value="delivered">Entregue (Concluído)</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Instruções ou Observações de Entrega</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Instruções para o motorista, telefone de contato do recebedor no destino, restrição de dias, etc."
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
                  {editingRequest ? 'Salvar Operação' : 'Criar Operação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
