/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Compass, // Solicitações
  Car, // Veículos Transportados
  Truck, // Frota
  UserCheck, // Motoristas
  FileText, // Contratos
  Wallet, // Financeiro
  BarChart3, // Relatórios
  Settings, // Configurações
  Database, // Supabase Notes
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

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
  | 'supabase_notes'
  | 'admin';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  role: 'admin' | 'collaborator';
}

const ADMIN_EMAIL = 'luizcosta8604@gmail.com';

const baseNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'transport_requests', label: 'Solicitações', icon: Compass },
  { id: 'vehicles_transported', label: 'Veículos Transportados', icon: Car },
  { id: 'fleet', label: 'Frota', icon: Truck },
  { id: 'drivers', label: 'Motoristas', icon: UserCheck },
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'finance', label: 'Financeiro', icon: Wallet },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'supabase_notes', label: 'Notas Supabase', icon: Database },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentView, onViewChange, isOpen, onClose, user, onLogout, role }: SidebarProps) {
  const isAdmin = role === 'admin' || user?.email === ADMIN_EMAIL;
  
  const navItems = baseNavItems.filter((item) => {
    // Hide Reports and Settings from non-admins
    if (!isAdmin && (item.id === 'reports' || item.id === 'settings')) {
      return false;
    }
    return true;
  });

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Colaboradores', icon: UserCheck });
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand/20">
                T
              </div>
              <div>
                <h1 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">TransporteDemo</h1>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold font-mono">OPERACIONAL</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewType);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                    isActive 
                      ? "bg-brand text-white shadow-md shadow-brand/20" 
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200")} />
                  {item.label}
                </button>
              );
            })}
            
            <button
              onClick={onLogout}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </nav>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20">
              <p className="text-xs font-bold text-brand uppercase tracking-tight mb-1">Suporte VIP</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">Contate nosso suporte especializado.</p>
              <button 
                onClick={() => window.open('https://wa.me/5511985258655', '_blank')}
                className="w-full py-2 bg-white dark:bg-zinc-800 text-brand border border-brand/20 rounded-lg text-xs font-bold hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-brand-dark transition-all cursor-pointer"
              >
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Navbar({ onMenuToggle, companyName, theme, onThemeToggle, onViewChange, user }: { 
  onMenuToggle: () => void; 
  companyName: string; 
  theme: 'light' | 'dark'; 
  onThemeToggle: () => void; 
  onViewChange: (view: ViewType) => void;
  user: any;
}) {
  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=ff7a00&color=fff`;

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
        </button>
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:block">{companyName}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onThemeToggle}
          className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-zinc-600" /> : <Sun className="w-5 h-5 text-yellow-500" />}
        </button>
        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700 mx-2" />
        <button 
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-all border-none bg-transparent outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-white dark:border-zinc-800">
            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
            {user?.displayName || user?.email?.split('@')[0] || 'Painel'}
          </p>
        </button>
      </div>
    </header>
  );
}
