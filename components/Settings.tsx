import React, { useState, useRef, useCallback } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';
import { SunIcon, MoonIcon, DesktopComputerIcon, DeviceMobileIcon } from './icons/Icons';
import type { Theme, Language, ViewMode } from '../hooks/useSettings';


const Settings: React.FC = () => {
    const { settings, updateSettings, exportData, importData } = useAppData();
    const { theme, setTheme, language, setLanguage, viewMode, setViewMode } = useSettings();
    const { t } = useTranslation();
    const [minStock, setMinStock] = useState(settings.minStock);
    const [usdRate, setUsdRate] = useState(settings.usdRate);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAutoSaveSetting = useCallback((setter: (value: any) => void, value: Theme | Language | ViewMode) => {
        setter(value);
        setMessage(t('settings.notifications.autosaveSuccess'));
        const timer = setTimeout(() => setMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [t]);

    const handleSaveGeneral = () => {
        updateSettings({ minStock, usdRate });
        setMessage(t('settings.notifications.saveSuccess'));
        setTimeout(() => setMessage(''), 3000);
    };

    const handleExport = () => {
        exportData();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm(t('settings.data.importConfirm'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    importData(text);
                }
            };
            reader.readAsText(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t('settings.title')}</h1>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        {message && (
            <div className="mb-6 p-3 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-center transition-opacity duration-300" role="alert">
                {message}
            </div>
        )}
        <div className="space-y-8">
            
            {/* Appearance Settings */}
            <div className="border-b dark:border-slate-700 pb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('settings.appearance.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.appearance.description')}</p>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAutoSaveSetting(setTheme, 'light')} className={`p-4 border-2 rounded-lg text-center ${theme === 'light' ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        <SunIcon className="w-8 h-8 mx-auto mb-2"/>
                        <span>{t('settings.appearance.light')}</span>
                    </button>
                     <button onClick={() => handleAutoSaveSetting(setTheme, 'dark')} className={`p-4 border-2 rounded-lg text-center ${theme === 'dark' ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        <MoonIcon className="w-8 h-8 mx-auto mb-2"/>
                        <span>{t('settings.appearance.dark')}</span>
                    </button>
                </div>
            </div>

            {/* Language and Display */}
            <div className="border-b dark:border-slate-700 pb-6">
                 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('settings.language.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.language.description')}</p>
                        <div className="flex rounded-md shadow-sm">
                            <button onClick={() => handleAutoSaveSetting(setLanguage, 'en')} className={`px-4 py-2 text-sm font-medium border ${language === 'en' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-l-md`}>English</button>
                            <button onClick={() => handleAutoSaveSetting(setLanguage, 'ar')} className={`px-4 py-2 text-sm font-medium border ${language === 'ar' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-r-md`}>العربية</button>
                        </div>
                   </div>
                   <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.view.description')}</p>
                         <div className="flex rounded-md shadow-sm">
                            <button onClick={() => handleAutoSaveSetting(setViewMode, 'desktop')} className={`px-4 py-2 font-medium border flex items-center ${viewMode === 'desktop' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-l-md`}>
                               <DesktopComputerIcon className="w-5 h-5 me-2" /> {t('settings.view.desktop')}
                            </button>
                            <button onClick={() => handleAutoSaveSetting(setViewMode, 'mobile')} className={`px-4 py-2 font-medium border flex items-center ${viewMode === 'mobile' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-r-md`}>
                               <DeviceMobileIcon className="w-5 h-5 me-2" /> {t('settings.view.mobile')}
                            </button>
                        </div>
                   </div>
                </div>
            </div>
            
            {/* General Settings */}
            <div className="border-b dark:border-slate-700 pb-6">
                 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('settings.general.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.general.minStock')}</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('settings.general.minStockDesc')}</p>
                        <input type="number" id="minStock" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="usdRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.general.usdRate')}</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('settings.general.usdRateDesc')}</p>
                        <input type="number" id="usdRate" value={usdRate} onChange={(e) => setUsdRate(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end items-center">
                    <button
                        onClick={handleSaveGeneral}
                        className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        {t('settings.saveChanges')}
                    </button>
                </div>
            </div>
            
             {/* Data Management */}
             <div className="border-b dark:border-slate-700 pb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('settings.data.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.data.description')}</p>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <button onClick={handleExport} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">{t('settings.data.export')}</button>
                    <button onClick={handleImportClick} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">{t('settings.data.import')}</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/json"/>
                </div>
            </div>

            {/* User Permissions (unchanged) */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('settings.permissions.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.permissions.description')}</p>
                <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-md"><span>{t('settings.permissions.admin')}</span><span className="text-green-600 dark:text-green-400 font-semibold">{t('settings.permissions.fullAccess')}</span></div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-md"><span>{t('settings.permissions.agent')}</span><span className="text-yellow-600 dark:text-yellow-400 font-semibold">{t('settings.permissions.invoiceManagement')}</span></div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-md"><span>{t('settings.permissions.accountant')}</span><span className="text-blue-600 dark:text-blue-400 font-semibold">{t('settings.permissions.viewReports')}</span></div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;