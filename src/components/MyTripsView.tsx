import React, { useState } from 'react';
import { MapPin, Flag, Calendar, Car, Phone, Navigation, CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import type { AppRecord, TransportRequest } from '../types';
import { formatDate, cn } from '../lib/utils';

type TripStatus = TransportRequest['status'];

const STATUS: Record<TripStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Agendada', cls: 'bg-sky-500/15 text-sky-600 dark:text-sky-300' },
  collected: { label: 'Coletado', cls: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300' },
  in_transit: { label: 'Em trânsito', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  delivered: { label: 'Entregue', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' },
  cancelled: { label: 'Cancelada', cls: 'bg-zinc-500/15 text-zinc-500' },
};

const NEXT: Partial<Record<TripStatus, { to: 'collected' | 'in_transit' | 'delivered'; label: string; icon: React.ComponentType<{ className?: string }> }>> = {
  scheduled: { to: 'collected', label: 'Confirmar coleta', icon: PackageCheck },
  collected: { to: 'in_transit', label: 'Iniciar viagem', icon: Truck },
  in_transit: { to: 'delivered', label: 'Confirmar entrega', icon: CheckCircle2 },
};

interface MyTripsViewProps {
  records: AppRecord[];
  driverName: string;
  isLinked: boolean;
  onStatus: (id: string, status: 'collected' | 'in_transit' | 'delivered') => void;
}

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function MyTripsView({ records, driverName, isLinked, onStatus }: MyTripsViewProps) {
  const [tab, setTab] = useState<'open' | 'done'>('open');
  const trips = records.filter((r): r is TransportRequest => r.type === 'transport_request');
  const open = trips
    .filter((t) => t.status !== 'delivered' && t.status !== 'cancelled')
    .sort((a, b) => (a.collectDate || '').localeCompare(b.collectDate || ''));
  const done = trips.filter((t) => t.status === 'delivered' || t.status === 'cancelled');
  const list = tab === 'open' ? open : done;

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <div>
        <p className="text-sm text-zinc-500">Olá, {driverName.split(' ')[0]}</p>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {open.length === 0 ? 'Nenhuma viagem pendente' : `${open.length} ${open.length === 1 ? 'viagem pendente' : 'viagens pendentes'}`}
        </h2>
      </div>

      {!isLinked && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-700 dark:text-amber-300">
          Sua conta ainda não foi vinculada a um cadastro de motorista. Peça ao administrador para fazer isso em <b>Usuários e acessos</b>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        {(['open', 'done'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'py-2 rounded-lg text-sm font-semibold transition cursor-pointer',
              tab === t ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500',
            )}
          >
            {t === 'open' ? `Pendentes (${open.length})` : `Concluídas (${done.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((t) => {
          const next = NEXT[t.status];
          return (
            <article key={t.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Coleta {formatDate(t.collectDate)}
                    </p>
                    <p className="font-semibold text-zinc-900 dark:text-white mt-1 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{t.vehicleName || 'Veículo'}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Cliente: {t.clientName}</p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap', STATUS[t.status].cls)}>
                    {STATUS[t.status].label}
                  </span>
                </div>

                <div className="relative pl-6 space-y-3">
                  <span className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-zinc-300 dark:border-zinc-700" />
                  <a href={mapsUrl(t.origin)} target="_blank" rel="noreferrer" className="block group">
                    <MapPin className="absolute left-0 w-4 h-4 text-brand" />
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400">Origem</p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 group-hover:underline">{t.origin}</p>
                  </a>
                  <a href={mapsUrl(t.destination)} target="_blank" rel="noreferrer" className="block group">
                    <Flag className="absolute left-0 w-4 h-4 text-emerald-500" />
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400">Destino</p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 group-hover:underline">{t.destination}</p>
                  </a>
                </div>

                {t.observations && (
                  <p className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-850 rounded-lg p-2.5 whitespace-pre-wrap">{t.observations}</p>
                )}
              </div>

              {tab === 'open' && (
                <div className="flex border-t border-zinc-100 dark:border-zinc-800">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(t.origin)}&destination=${encodeURIComponent(t.destination)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  >
                    <Navigation className="w-4 h-4" /> Rota
                  </a>
                  {next && (
                    <button
                      onClick={() => {
                        if (confirm(`${next.label}?`)) onStatus(t.id, next.to);
                      }}
                      className="flex-[2] py-3.5 text-sm font-semibold bg-brand hover:bg-brand-dark text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <next.icon className="w-4 h-4" /> {next.label}
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-14 text-sm text-zinc-500">
            {tab === 'open' ? 'Quando houver uma viagem para você, ela aparece aqui.' : 'Nenhuma viagem concluída ainda.'}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
        <Phone className="w-3.5 h-3.5" /> Dúvidas sobre uma viagem? Fale com a central.
      </p>
    </div>
  );
}
