/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, Navbar, ViewType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { VehiclesView } from './components/VehiclesView';
import { FleetView } from './components/FleetView';
import { DriversView } from './components/DriversView';
import { ContractsView } from './components/ContractsView';
import { TransportRequestsView } from './components/TransportRequestsView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { LoginView } from './components/LoginView';
import { SupabaseNotesView } from './components/SupabaseNotesView';
import { useData } from './useData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('transport_user');
      return saved ? JSON.parse(saved) : { uid: 'local_user', email: 'luizcosta8604@gmail.com', displayName: 'Luiz Costa' };
    } catch {
      return { uid: 'local_user', email: 'luizcosta8604@gmail.com', displayName: 'Luiz Costa' };
    }
  });
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync data reactively from localStorage using useData hook
  const { records, config, setConfig, addRecord, deleteRecord, updateRecord, isLoaded, role, ownerUid, isApproved } = useData(currentUser);

  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  const handleLogout = () => {
    localStorage.removeItem('transport_user');
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleLogin = (user: any) => {
    localStorage.setItem('transport_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const toggleTheme = () => {
    setConfig((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // Redirect to Login View if not signed in
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Waiting for local storage sync
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs animate-pulse">Sincronizando dados...</p>
        </div>
      </div>
    );
  }

  // Check approved status
  if (!isApproved) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center text-orange-600 mb-4 animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Acesso em Análise</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
          O seu e-mail (<strong className="text-zinc-700 dark:text-zinc-200">{currentUser.email}</strong>) foi cadastrado, mas ainda não está aprovado por um administrador. Entre em contato com seu gestor para liberação.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          Voltar para tela de Login
        </button>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView records={records} />;
      case 'clients':
        return (
          <ClientsView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'vehicles_transported':
        return (
          <VehiclesView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'fleet':
        return (
          <FleetView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'drivers':
        return (
          <DriversView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'contracts':
        return (
          <ContractsView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'transport_requests':
        return (
          <TransportRequestsView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'finance':
        return (
          <FinanceView 
            records={records} 
            onAdd={addRecord} 
            onUpdate={updateRecord} 
            onDelete={deleteRecord} 
          />
        );
      case 'reports':
        return <ReportsView records={records} config={config} />;
      case 'settings':
        return <SettingsView config={config} setConfig={setConfig} />;
      case 'supabase_notes':
        return <SupabaseNotesView />;
      case 'admin':
        return <AdminView ownerUid={ownerUid} />;
      default:
        return <DashboardView records={records} />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={currentUser}
        onLogout={handleLogout}
        role={role}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          companyName={config.companyName}
          theme={config.theme}
          onThemeToggle={toggleTheme}
          onViewChange={setCurrentView}
          user={currentUser}
        />

        {/* View Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
}
