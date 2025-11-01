import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Invoices from './components/Invoices';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { AppProvider } from './hooks/useAppData';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { useTranslation } from './hooks/useTranslation';
import { HomeIcon, CubeIcon, DocumentTextIcon, ChartBarIcon, CogIcon, MenuIcon, LogoIcon } from './components/icons/Icons';

export type View = 'dashboard' | 'products' | 'invoices' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const { viewMode } = useSettings();

  const navigationItems: {
    name: View;
    label: string;
    icon: React.FC<{ className?: string; }>;
  }[] = [
    { name: 'dashboard', label: t('sidebar.dashboard'), icon: HomeIcon },
    { name: 'products', label: t('sidebar.products'), icon: CubeIcon },
    { name: 'invoices', label: t('sidebar.invoices'), icon: DocumentTextIcon },
    { name: 'reports', label: t('sidebar.reports'), icon: ChartBarIcon },
    { name: 'settings', label: t('sidebar.settings'), icon: CogIcon },
  ];

  const handleSetCurrentView = (view: View) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'invoices':
        return <Invoices />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={handleSetCurrentView}
          navigationItems={navigationItems}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-md mx-auto overflow-x-hidden' : 'w-full'}`}>
             <header className="sm:hidden bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center flex-shrink-0 z-10">
                <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold">{navigationItems.find(item => item.name === currentView)?.label}</h2>
                <LogoIcon className="w-6 h-6 text-teal-400" />
            </header>
             <main className="p-4 sm:p-8 overflow-y-auto h-full">
               {renderView()}
             </main>
        </div>
      </div>
    </AppProvider>
  );
};


const App: React.FC = () => {
  return (
    <SettingsProvider>
        <AppContent />
    </SettingsProvider>
  );
};

export default App;