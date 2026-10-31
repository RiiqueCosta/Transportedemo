import React, { useEffect, useState } from 'react';
import { Sidebar, Navbar, BottomNav, ViewType, viewLabel } from './components/Navigation';
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
import { MyTripsView } from './components/MyTripsView';
import { LogoMark } from './components/Logo';
import { useAuth } from './useAuth';
import { useData } from './useData';
import { canAccess, canDelete, homeView } from './lib/permissions';
import type { Driver } from './types';

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 app-bg p-6 text-center">
      <div className="max-w-sm flex flex-col items-center">{children}</div>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const { profile } = auth;
  const { records, config, setConfig, addRecord, deleteRecord, updateRecord, updateTripStatus, isLoaded, error } = useData(
    auth.status === 'signed_in' ? profile : null,
  );

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  }, [config.theme]);

  // Garante que cada papel só abre telas permitidas
  useEffect(() => {
    if (profile && !canAccess(profile.role, currentView)) setCurrentView(homeView(profile.role));
  }, [profile, currentView]);

  const toggleTheme = () => setConfig((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));

  if (auth.status === 'loading') {
    return (
      <FullScreenMessage>
        <LogoMark className="w-12 h-12 animate-pulse" />
      </FullScreenMessage>
    );
  }

  if (auth.status === 'signed_out' || !profile) {
    return <LoginView isDemo={auth.isDemo} onSignIn={auth.signIn} onSignUp={auth.signUp} onReset={auth.resetPassword} />;
  }

  if (!profile.approved) {
    return (
      <FullScreenMessage>
        <LogoMark className="w-12 h-12 mb-6" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Aguardando liberação</h2>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          Sua conta (<b className="text-zinc-700 dark:text-zinc-300">{profile.email}</b>) foi criada. Um administrador precisa liberar o seu acesso.
        </p>
        <button
          onClick={auth.signOut}
          className="mt-6 px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
        >
          Sair
        </button>
      </FullScreenMessage>
    );
  }

  if (!isLoaded) {
    return (
      <FullScreenMessage>
        <div className="w-9 h-9 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 mt-4">Carregando dados…</p>
      </FullScreenMessage>
    );
  }

  const role = profile.role;
  // Exclusão só para administrador (o banco também bloqueia)
  const onDelete = canDelete(role)
    ? deleteRecord
    : () => alert('Somente o administrador pode excluir registros.');
  const crud = { records, onAdd: addRecord, onUpdate: updateRecord, onDelete };
  const drivers = records.filter((r): r is Driver => r.type === 'driver');

  const renderView = () => {
    switch (currentView) {
      case 'my_trips':
        return (
          <MyTripsView
            records={records}
            driverName={profile.name}
            isLinked={auth.isDemo || Boolean(profile.driverId)}
            onStatus={updateTripStatus}
          />
        );
      case 'clients':
        return <ClientsView {...crud} />;
      case 'vehicles_transported':
        return <VehiclesView {...crud} />;
      case 'fleet':
        return <FleetView {...crud} />;
      case 'drivers':
        return <DriversView {...crud} />;
      case 'contracts':
        return <ContractsView {...crud} config={config} />;
      case 'transport_requests':
        return <TransportRequestsView {...crud} config={config} />;
      case 'finance':
        return <FinanceView {...crud} />;
      case 'reports':
        return <ReportsView records={records} config={config} />;
      case 'settings':
        return <SettingsView config={config} setConfig={setConfig} />;
      case 'admin':
        return <AdminView me={profile} drivers={drivers} />;
      default:
        return <DashboardView records={records} />;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        onLogout={auth.signOut}
        isDemo={auth.isDemo}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuToggle={() => setIsSidebarOpen(true)}
          title={viewLabel(currentView)}
          companyName={config.companyName}
          theme={config.theme}
          onThemeToggle={toggleTheme}
        />

        <main className="flex-1 overflow-y-auto app-bg px-4 py-5 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            {renderView()}
          </div>
        </main>
      </div>

      <BottomNav currentView={currentView} onViewChange={setCurrentView} onMore={() => setIsSidebarOpen(true)} profile={profile} />
    </div>
  );
}
