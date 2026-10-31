import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import type { AppRecord, AppConfig, Profile } from './types';

const DEMO_RECORDS = 'cargova_demo_records';
const DEMO_CONFIG = 'cargova_demo_config';
const THEME_KEY = 'cargova_theme';

export const DEFAULT_CONFIG: AppConfig = {
  companyName: 'Minha Transportadora',
  companyPhone: '',
  companyEmail: '',
  companyCnpj: '',
  theme: 'dark',
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


function rowToRecord(row: any): AppRecord {
  return {
    ...(row.data || {}),
    id: row.id,
    type: row.type,
    dateCreated: row.data?.dateCreated || row.created_at,
  } as AppRecord;
}

function recordToRow(record: AppRecord) {
  const { id, type, ...data } = record as any;
  return { id, type, data };
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function loadTheme(): 'light' | 'dark' {
  return readLocal<string>(THEME_KEY, 'dark') === 'light' ? 'light' : 'dark';
}

/**
 * Dados do sistema. Com Supabase lê/grava na nuvem e atualiza em tempo real;
 * no modo demonstração usa o armazenamento do navegador.
 */
export function useData(profile: Profile | null) {
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [config, setConfigState] = useState<AppConfig>({ ...DEFAULT_CONFIG, theme: loadTheme() });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const isDemo = !supabase;

  // Carga inicial
  useEffect(() => {
    if (!profile || !profile.approved) {
      setRecords([]);
      setIsLoaded(true);
      return;
    }
    let cancelled = false;
    setIsLoaded(false);

    if (isDemo) {
      let recs = readLocal<AppRecord[]>(DEMO_RECORDS, []);
      if (profile.role === 'motorista') recs = recs.filter((r) => r.type === 'transport_request');
      setRecords(recs);
      setConfigState({ ...DEFAULT_CONFIG, ...readLocal(DEMO_CONFIG, {}), theme: loadTheme() });
      setIsLoaded(true);
      return;
    }

    (async () => {
      const [recRes, setRes] = await Promise.all([
        supabase!.from('records').select('*').order('created_at', { ascending: false }),
        supabase!.from('settings').select('data').eq('id', 1).maybeSingle(),
      ]);
      if (cancelled) return;
      if (recRes.error) setError('Não foi possível carregar os dados: ' + recRes.error.message);
      setRecords((recRes.data || []).map(rowToRecord));
      setConfigState({ ...DEFAULT_CONFIG, ...(setRes.data?.data || {}), theme: loadTheme() });
      setIsLoaded(true);
    })();

    // Tempo real: outras pessoas alterando dados
    const channel = supabase!
      .channel('records-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, (payload: any) => {
        setRecords((prev) => {
          if (payload.eventType === 'DELETE') return prev.filter((r) => r.id !== payload.old.id);
          const rec = rowToRecord(payload.new);
          const exists = prev.some((r) => r.id === rec.id);
          return exists ? prev.map((r) => (r.id === rec.id ? rec : r)) : [rec, ...prev];
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase!.removeChannel(channel);
    };
  }, [profile?.id, profile?.approved, profile?.role, isDemo]);

  // Persistência do modo demonstração
  useEffect(() => {
    if (isDemo && isLoaded && profile?.role !== 'motorista') {
      localStorage.setItem(DEMO_RECORDS, JSON.stringify(records));
    }
  }, [records, isDemo, isLoaded, profile?.role]);

  const stamp = () => ({
    lastUpdatedBy: profile?.id,
    lastUpdatedByName: profile?.name,
  });

  const addRecord = async (record: AppRecord) => {
    const finalRecord = {
      ...record,
      ownerId: 'company',
      createdBy: profile?.id,
      createdByName: profile?.name,
      dateCreated: record.dateCreated || new Date().toISOString(),
    } as AppRecord;
    setRecords((prev) => [finalRecord, ...prev]);
    if (!isDemo) {
      const { error } = await supabase!.from('records').insert(recordToRow(finalRecord));
      if (error) {
        setRecords((prev) => prev.filter((r) => r.id !== finalRecord.id));
        alert('Erro ao salvar: ' + error.message);
      }
    }
  };

  const updateRecord = async (id: string, changes: Partial<AppRecord>) => {
    const current = records.find((r) => r.id === id);
    if (!current) return;
    const updated = { ...current, ...changes, ...stamp() } as AppRecord;
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    if (!isDemo) {
      const { error } = await supabase!.from('records').update({ data: recordToRow(updated).data }).eq('id', id);
      if (error) {
        setRecords((prev) => prev.map((r) => (r.id === id ? current : r)));
        alert('Erro ao atualizar: ' + error.message);
      }
    }
  };

  const deleteRecord = async (id: string) => {
    const current = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (!isDemo) {
      const { error } = await supabase!.from('records').delete().eq('id', id);
      if (error && current) {
        setRecords((prev) => [current, ...prev]);
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  /** Motorista atualiza só o status da própria viagem */
  const updateTripStatus = async (id: string, status: 'collected' | 'in_transit' | 'delivered') => {
    const current = records.find((r) => r.id === id);
    if (!current) return;
    setRecords((prev) => prev.map((r) => (r.id === id ? ({ ...r, status } as AppRecord) : r)));
    if (isDemo) {
      const all = readLocal<AppRecord[]>(DEMO_RECORDS, []);
      localStorage.setItem(
        DEMO_RECORDS,
        JSON.stringify(all.map((r) => (r.id === id ? { ...r, status } : r))),
      );
      return;
    }
    const { error } = await supabase!.rpc('driver_update_status', { record_id: id, new_status: status });
    if (error) {
      setRecords((prev) => prev.map((r) => (r.id === id ? current : r)));
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  /** Mesma assinatura de um setState do React */
  const setConfig = useCallback(
    (update: AppConfig | ((prev: AppConfig) => AppConfig)) => {
      const prev = configRef.current;
      const next = typeof update === 'function' ? update(prev) : update;
      setConfigState(next);
      if (next.theme !== prev.theme) localStorage.setItem(THEME_KEY, next.theme);
      const { theme, ...shared } = next;
      const { theme: _t, ...prevShared } = prev;
      if (JSON.stringify(shared) === JSON.stringify(prevShared)) return;
      if (isDemo) {
        localStorage.setItem(DEMO_CONFIG, JSON.stringify(shared));
      } else if (profile?.role === 'admin') {
        supabase!
          .from('settings')
          .update({ data: shared, updated_at: new Date().toISOString() })
          .eq('id', 1)
          .then(({ error }) => error && alert('Erro ao salvar configurações: ' + error.message));
      }
    },
    [isDemo, profile?.role],
  );

  return {
    records,
    config,
    setConfig,
    addRecord,
    updateRecord,
    deleteRecord,
    updateTripStatus,
    isLoaded,
    error,
  };
}
