import React from 'react';
import {
  LayoutDashboard,
  Users,
  Route,
  Car,
  Truck,
  IdCard,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  ShieldCheck,
  Navigation as NavIcon,
  Menu,
  Sun,
  Moon,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { canAccess, ROLE_LABEL } from '../lib/permissions';
import type { Profile } from '../types';
import { Logo } from './Logo';

export type ViewType =
  | 'dashboard'
  | 'clients'
  | 'transport_requests'
  | 'vehicles_transported'
  | 'fleet'
  | 'drivers'
  | 'contracts'
  | 'finance'
  | 'reports'
  | 'settings'
  | 'admin'
  | 'my_trips';

type NavItem = { id: ViewType; label: string; short?: string; icon: React.ComponentType<{ className?: string }> };

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operação',
    items: [
      { id: 'my_trips', label: 'Minhas viagens', short: 'Viagens', icon: NavIcon },
      { id: 'dashboard', label: 'Painel', short: 'Painel', icon: LayoutDashboard },
      { id: 'transport_requests', label: 'Solicitações', short: 'Fretes', icon: Route },
      { id: 'clients', label: 'Clientes', short: 'Clientes', icon: Users },
      { id: 'vehicles_transported', label: 'Veículos transportados', short: 'Veículos', icon: Car },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { id: 'fleet', label: 'Frota', icon: Truck },
      { id: 'drivers', label: 'Motoristas', icon: IdCard },
      { id: 'contracts', label: 'Contratos', icon: FileText },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { id: 'finance', label: 'Financeiro', icon: Wallet },
      { id: 'reports', label: 'Relatórios', icon: BarChart3 },
      { id: 'admin', label: 'Usuários e acessos', icon: ShieldCheck },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function viewLabel(view: ViewType): string {
  return ALL_ITEMS.find((i) => i.id === view)?.label || '';
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onLogout: () => void;
  isDemo: boolean;
}

export function Sidebar({ currentView, onViewChange, isOpen, onClose, profile, onLogout, isDemo }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white dark:bg-zinc-925 border-r border-zinc-200 dark:border-zinc-800/80 transition-transform duration-300 lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 px-5 flex items-center border-b border-zinc-100 dark:border-zinc-800/80">
            <Logo />
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            {NAV_GROUPS.map((group) => {
              const items = group.items.filter((i) => canAccess(profile.role, i.id));
              if (!items.length) return null;
              return (
                <div key={group.title}>
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onViewChange(item.id);
                            onClose();
                          }}
                          className={cn(
                            'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                            active
                              ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100',
                          )}
                        >
                          {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand" />}
                          <Icon className="w-[18px] h-[18px] shrink-0" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {isDemo && (
            <div className="mx-3 mb-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              <b>Modo demonstração.</b> Os dados ficam salvos só neste navegador.
            </div>
          )}

          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-3 p-2">
              <Avatar name={profile.name} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{profile.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{ROLE_LABEL[profile.role]}</p>
              </div>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(/[\s._@-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-brand to-brand-dark text-white font-semibold flex items-center justify-center shrink-0',
        size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm',
      )}
    >
      {initials || '?'}
    </div>
  );
}

export function Navbar({
  onMenuToggle,
  title,
  companyName,
  theme,
  onThemeToggle,
}: {
  onMenuToggle: () => void;
  title: string;
  companyName: string;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}) {
  return (
    <header className="h-16 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg lg:hidden cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <div className="hidden lg:block min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500 font-semibold truncate">{companyName}</p>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 -mt-0.5 truncate">{title}</h1>
        </div>
      </div>

      <button
        onClick={onThemeToggle}
        aria-label="Alternar tema"
        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
      </button>
    </header>
  );
}

/** Barra inferior no celular com os atalhos principais */
export function BottomNav({
  currentView,
  onViewChange,
  onMore,
  profile,
}: {
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  onMore: () => void;
  profile: Profile;
}) {
  const primary: ViewType[] =
    profile.role === 'motorista' ? ['my_trips'] : ['dashboard', 'transport_requests', 'clients', 'vehicles_transported'];
  const items = primary
    .filter((v) => canAccess(profile.role, v))
    .map((v) => ALL_ITEMS.find((i) => i.id === v)!)
    .filter(Boolean);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-zinc-925/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium cursor-pointer',
                active ? 'text-brand dark:text-brand-light' : 'text-zinc-500',
              )}
            >
              <Icon className="w-5 h-5" />
              {item.short || item.label}
            </button>
          );
        })}
        <button
          onClick={onMore}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-zinc-500 cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          Mais
        </button>
      </div>
    </nav>
  );
}
