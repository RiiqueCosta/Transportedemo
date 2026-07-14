/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RecordType = 
  | 'client' 
  | 'vehicle_transported' 
  | 'fleet' 
  | 'driver' 
  | 'transport_request' 
  | 'contract' 
  | 'finance';

export interface BaseRecord {
  id: string;
  type: RecordType;
  dateCreated: string;
  ownerId: string;
  createdBy?: string;
  createdByName?: string;
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
}

export interface Client extends BaseRecord {
  type: 'client';
  name: string;
  cpfCnpj: string;
  rg: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  observations?: string;
}

export interface VehicleTransported extends BaseRecord {
  type: 'vehicle_transported';
  brand: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  renavam: string;
  chassis: string;
  fuel: string;
  value: number;
  observations?: string;
  imageUrl?: string;
}

export interface Fleet extends BaseRecord {
  type: 'fleet';
  plate: string;
  model: string;
  brand: string;
  fleetType: 'car' | 'van' | 'truck';
  capacity: string;
  year: string;
  renavam: string;
  chassis: string;
  currentMileage: number;
  status: 'available' | 'in_transit' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  licensingDate?: string;
  insuranceExpiry?: string;
  observations?: string;
}

export interface Driver extends BaseRecord {
  type: 'driver';
  name: string;
  cpf: string;
  rg: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  bloodType?: string;
  status: 'available' | 'on_trip' | 'off_duty' | 'inactive' | 'vacation' | 'away';
  observations?: string;
}

export interface TransportRequest extends BaseRecord {
  type: 'transport_request';
  clientId: string;
  clientName: string;
  vehicleId: string;
  vehicleName: string; // Brand Model Color Plate
  origin: string;
  destination: string;
  collectDate: string;
  estimatedDeliveryDate: string;
  driverId: string;
  driverName: string;
  fleetId: string;
  fleetPlate: string; // Brand Model Plate
  baseValue: number;
  tollCost: number;
  insuranceCost: number;
  observations?: string;
  status: 'scheduled' | 'collected' | 'in_transit' | 'delivered' | 'cancelled';
  distanceKm: number;
  estimatedTime?: string;
  routeDetails?: string;
  totalValue: number;
}

export interface Contract extends BaseRecord {
  type: 'contract';
  contractNumber: string;
  title: string;
  templateType: 'standard' | 'exclusive' | 'luxury';
  clauses: string;
  status: 'draft' | 'active' | 'signed' | 'terminated';
  clientId: string;
  clientName: string;
  requestId?: string;
  value: number;
  observations?: string;
}

export interface Finance extends BaseRecord {
  type: 'finance';
  financeType: 'receivable' | 'payable'; // Contas a Receber / Contas a Pagar
  description: string;
  value: number;
  dueDate: string;
  status: 'pending' | 'paid';
  category: string; // Centro de Custos (combustível, pedágio, manutenção, salário, faturamento)
  transportRequestId?: string;
  clientId?: string;
  clientName?: string;
  paymentDate?: string;
  observations?: string;
}

export type AppRecord = Client | VehicleTransported | Fleet | Driver | TransportRequest | Contract | Finance;

export interface AppConfig {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyCnpj: string;
  theme: 'light' | 'dark';
  nextInvoiceNumber?: number;
  nextQuoteNumber?: number;
  nextContractNumber?: number;
  valuePerKm?: number;
  defaultInsurance?: number;
  defaultTax?: number;
  contractTemplate?: string;
}
