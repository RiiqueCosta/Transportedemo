/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppRecord, AppConfig } from './types';

const DEFAULT_CONFIG: AppConfig = {
  companyName: 'TransporteDemo Logística',
  companyPhone: '(11) 98525-8655',
  companyEmail: 'contato@transportedemo.com',
  companyCnpj: '59.914.130/0001-82',
  theme: 'light',
  nextContractNumber: 1,
  valuePerKm: 4.50,
  defaultInsurance: 150.00,
  defaultTax: 50.00,
  contractTemplate: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE DE VEÍCULOS

Por este instrumento particular de contrato, de um lado:
CONTRATANTE: [NOME_CLIENTE], inscrito no CPF/CNPJ sob nº [DOCUMENTO_CLIENTE], residente e domiciliado em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_EMPRESA], inscrita no CNPJ sob o nº [CNPJ_EMPRESA], com sede em São Paulo/SP.

As partes qualificadas acima celebram o presente contrato para a prestação de serviços de transporte conforme cláusulas abaixo:

Cláusula 1ª - Objeto: O transporte rodoviário do veículo [VEICULO], placa [PLACA_VEICULO], chassi [CHASSI_VEICULO], do ponto de origem [ORIGEM] ao ponto de destino [DESTINO].

Cláusula 2ª - Operação: O serviço será executado pelo motorista credenciado [MOTORISTA], através do veículo da frota [FROTA].

Cláusula 3ª - Valor: O valor total acertado para este transporte é de [VALOR_TOTAL], que engloba a distância percorrida, custos de pedágio, taxa de seguro e demais adicionais descritos na solicitação.

Cláusula 4ª - Prazo: O prazo estimado para a conclusão segura do serviço de transporte é de [PRAZO] dias, contados a partir da data de coleta oficial do veículo.

São Paulo, [DATA_CONTRATO].`
};

export function useData(user: any) {
  const [records, setRecords] = useState<AppRecord[]>(() => {
    try {
      const saved = localStorage.getItem('transport_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse records from localStorage:', e);
      return [];
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('transport_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      console.error('Failed to parse config from localStorage:', e);
      return DEFAULT_CONFIG;
    }
  });

  const [role] = useState<'admin' | 'collaborator'>('admin');
  const [ownerUid] = useState<string>('local_owner');
  const [isApproved] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('transport_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('transport_config', JSON.stringify(config));
  }, [config]);

  const addRecord = async (record: AppRecord) => {
    const finalRecord = { 
      ...record, 
      ownerId: ownerUid,
      createdBy: 'local_user',
      createdByName: 'Administrador'
    };
    setRecords(prev => [finalRecord, ...prev]);
  };

  const updateRecord = async (id: string, updatedRecord: Partial<AppRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedRecord } as AppRecord : r));
  };

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return {
    records,
    config,
    setConfig,
    addRecord,
    updateRecord,
    deleteRecord,
    isLoaded: true,
    role,
    ownerUid,
    isApproved,
  };
}

