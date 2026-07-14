/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Sidebar, Navbar, ViewType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { VehiclesView } from './components/VehiclesView';
import { FleetView } from './components/FleetView';
import { DriversView } from './components/DriversView';
import { TransportRequestsView } from './components/TransportRequestsView';
import { ContractsView } from './components/ContractsView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { LoginView } from './components/LoginView';
import { useData } from './useData';
import { AppRecord } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Bind actual Firebase auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync data reactively from Firestore using user object
  const { records, config, setConfig, addRecord, deleteRecord, updateRecord, isLoaded, role, ownerUid, isApproved } = useData(currentUser);

  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 1. Initial Auth Check and Firestore loading spinners
  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm animate-pulse font-mono uppercase tracking-widest text-xs">TransporteDemo</p>
        </div>
      </div>
    );
  }

  // 2. Redirect to Login View if not signed in
  if (!currentUser) {
    return <LoginView />;
  }

  // 3. Waiting for Firestore sync data
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs animate-pulse">Sincronizando banco de dados...</p>
        </div>
      </div>
    );
  }

  // 4. Checking approval status
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Acesso em Análise
            </h1>
            <p className="text-zinc-505 dark:text-zinc-400 text-sm leading-normal">
              Olá, <span className="font-bold text-zinc-700 dark:text-zinc-300">{currentUser?.email}</span>! Seu cadastro foi recebido, mas precisa ser ativado pelo administrador da transportadora.
            </p>
          </div>
          
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs text-brand font-bold">
              <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
              <span>Aguardando ativação do seu usuário</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
              O administrador principal (<strong>luizcosta8604@gmail.com</strong>) deve autorizar o seu endereço no painel operacional de colaboradores.
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-505 italic mt-1 bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800">
              💡 Assim que seu login for aprovado, o painel será carregado automaticamente!
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Fazer Logoff (Sair)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleThemeToggle = () => {
    setConfig(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const isUserAdmin = role === 'admin' || (currentUser?.email || '').toLowerCase().trim() === 'luizcosta8604@gmail.com';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        role={role}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(true)} 
          companyName={config.companyName || "TransporteDemo"}
          theme={config.theme}
          onThemeToggle={handleThemeToggle}
          onViewChange={setCurrentView}
          user={currentUser}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView records={records} />
            )}
            {currentView === 'clients' && (
              <ClientsView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'transport_requests' && (
              <TransportRequestsView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'vehicles_transported' && (
              <VehiclesView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'fleet' && (
              <FleetView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'drivers' && (
              <DriversView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'contracts' && (
              <ContractsView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'finance' && (
              <FinanceView 
                records={records} 
                onAdd={addRecord} 
                onUpdate={updateRecord} 
                onDelete={deleteRecord} 
              />
            )}
            {currentView === 'reports' && (
              isUserAdmin ? (
                <ReportsView records={records} config={config} />
              ) : (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-bold text-lg text-red-500">Acesso Restrito</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Apenas administradores possuem acesso aos relatórios consolidados.</p>
                </div>
              )
            )}
            {currentView === 'admin' && (
              isUserAdmin ? (
                <AdminView ownerUid={ownerUid} />
              ) : (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-bold text-lg text-red-500">Acesso Restrito</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Painel restrito a administradores.</p>
                </div>
              )
            )}
            {currentView === 'settings' && (
              isUserAdmin ? (
                <SettingsView config={config} setConfig={setConfig} />
              ) : (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-bold text-lg text-red-500">Acesso Restrito</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Painel restrito a administradores.</p>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
