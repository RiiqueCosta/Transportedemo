/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { AppRecord, AppConfig } from './types';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

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
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [role, setRole] = useState<'admin' | 'collaborator'>('collaborator');
  const [ownerUid, setOwnerUid] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial lookup for user roles & the owner database ID
  useEffect(() => {
    if (!user || !user.uid) {
      setRole('collaborator');
      setOwnerUid('');
      setIsApproved(false);
      setIsRoleLoaded(true);
      return;
    }

    setIsRoleLoaded(false);
    const emailLower = (user.email || '').toLowerCase().trim();

    // Check if master owner
    if (emailLower === 'luizcosta8604@gmail.com') {
      setRole('admin');
      setOwnerUid(user.uid);
      setIsApproved(true);
      setIsRoleLoaded(true);
      return;
    }

    // Otherwise, check the allowed_users collection
    const allowedUserDocRef = doc(db, 'allowed_users', emailLower);
    const unsubscribeAllowed = onSnapshot(allowedUserDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const allowedData = snapshot.data();
        setRole(allowedData.role || 'collaborator');
        setOwnerUid(allowedData.ownerUid || user.uid);
        setIsApproved(true);
      } else {
        // If not listed inside allowed_users, they are NOT approved!
        setRole('collaborator');
        setOwnerUid('');
        setIsApproved(false);
      }
      setIsRoleLoaded(true);
    }, (err) => {
      console.error('Error fetching role permissions:', err);
      // Fallback
      setRole('collaborator');
      setOwnerUid('');
      setIsApproved(false);
      setIsRoleLoaded(true);
    });

    return () => {
      unsubscribeAllowed();
    };
  }, [user]);

  // 2. Real-time Config and Records sync on the tenant owner database
  useEffect(() => {
    if (!user || !user.uid || !isRoleLoaded || !ownerUid || !isApproved) {
      setRecords([]);
      setConfig(DEFAULT_CONFIG);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    // 1. Config sync with ownerUid
    const configDocRef = doc(db, 'users', ownerUid, 'settings', 'config');
    const unsubscribeConfig = onSnapshot(
      configDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const fetchedConfig = snapshot.data() as AppConfig;
          setConfig(fetchedConfig);
        } else {
          // Initialize owner config with default
          try {
            await setDoc(configDocRef, DEFAULT_CONFIG);
            setConfig(DEFAULT_CONFIG);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${ownerUid}/settings/config`);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${ownerUid}/settings/config`);
      }
    );

    // 2. Records sync with ownerUid
    const recordsColRef = collection(db, 'users', ownerUid, 'records');
    const recordsQuery = query(recordsColRef, orderBy('dateCreated', 'desc'));
    
    const unsubscribeRecords = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const fetchedRecords: AppRecord[] = [];
        snapshot.forEach((docSnap) => {
          fetchedRecords.push(docSnap.data() as AppRecord);
        });
        setRecords(fetchedRecords);
        setIsLoaded(true);
      },
      (error) => {
        // Fallback or missing indexes support
        if (error.message?.includes('failed-precondition') || error.message?.includes('index')) {
          console.warn('Running records query without orderBy. Index might be compiling...');
          const fallbackUnsubscribe = onSnapshot(
            recordsColRef,
            (fallbackSnapshot) => {
              const fetchedRecords: AppRecord[] = [];
              fallbackSnapshot.forEach((docSnap) => {
                fetchedRecords.push(docSnap.data() as AppRecord);
              });
              fetchedRecords.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
              setRecords(fetchedRecords);
              setIsLoaded(true);
            },
            (fallbackErr) => {
              handleFirestoreError(fallbackErr, OperationType.LIST, `users/${ownerUid}/records`);
            }
          );
          return () => {
            unsubscribeConfig();
            fallbackUnsubscribe();
          };
        } else {
          handleFirestoreError(error, OperationType.LIST, `users/${ownerUid}/records`);
          setIsLoaded(true);
        }
      }
    );

    return () => {
      unsubscribeConfig();
      unsubscribeRecords();
    };
  }, [user, ownerUid, isRoleLoaded]);

  const addRecord = async (record: AppRecord) => {
    if (!user || !user.uid || !ownerUid) return;
    try {
      const finalRecord = { 
        ...record, 
        ownerId: ownerUid,
        createdBy: user.uid,
        createdByName: user.displayName || user.email || 'Colaborador'
      };
      const docRef = doc(db, 'users', ownerUid, 'records', record.id);
      await setDoc(docRef, finalRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${ownerUid}/records/${record.id}`);
    }
  };

  const updateRecord = async (id: string, updatedRecord: Partial<AppRecord>) => {
    if (!user || !user.uid || !ownerUid) return;
    try {
      const existing = records.find(r => r.id === id);
      if (!existing) return;

      const finalRecord = {
        ...existing,
        ...updatedRecord,
        ownerId: ownerUid,
        lastUpdatedBy: user.uid,
        lastUpdatedByName: user.displayName || user.email || 'Colaborador'
      };
      
      if ('updatedAt' in finalRecord) {
        delete (finalRecord as any).updatedAt;
      }

      const docRef = doc(db, 'users', ownerUid, 'records', id);
      await setDoc(docRef, finalRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${ownerUid}/records/${id}`);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!user || !user.uid || !ownerUid) return;
    try {
      const record = records.find(r => r.id === id);
      if (record) {
        const isUserAdmin = role === 'admin' || (user.email || '').toLowerCase().trim() === 'luizcosta8604@gmail.com';
        const isCreator = record.createdBy === user.uid;
        if (!isUserAdmin && !isCreator) {
          alert('Permissão Negada: Apenas o criador deste registro ou um administrador podem excluí-lo.');
          return;
        }
      }

      const docRef = doc(db, 'users', ownerUid, 'records', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${ownerUid}/records/${id}`);
    }
  };

  const setConfigOnServer = async (newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => {
    if (!user || !user.uid || !ownerUid) return;
    const finalConfig = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    
    try {
      const docRef = doc(db, 'users', ownerUid, 'settings', 'config');
      await setDoc(docRef, finalConfig);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${ownerUid}/settings/config`);
    }
  };

  return {
    records,
    config,
    setConfig: setConfigOnServer,
    addRecord,
    updateRecord,
    deleteRecord,
    isLoaded: isLoaded && isRoleLoaded,
    role,
    ownerUid,
    isApproved,
  };
}
