// FIX: Implementing the Dashboard component to display summary information.
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Store } from '../types';
import StoreCard from './StoreCard';
import Modal from './Modal';
import { PlusIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';

const StoreForm: React.FC<{ onSave: (store: Omit<Store, 'id'>) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [owner, setOwner] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, location, owner, phone });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder={t('dashboard.storeForm.name')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" required />
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder={t('dashboard.storeForm.location')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" required />
                <input value={owner} onChange={e => setOwner(e.target.value)} placeholder={t('dashboard.storeForm.owner')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" required />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('dashboard.storeForm.phone')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" required />
            </div>
            <div className="flex items-center justify-end mt-6">
                <button onClick={onCancel} type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline me-2">
                    {t('common.cancel')}
                </button>
                <button type="submit" className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    {t('common.save')}
                </button>
            </div>
        </form>
    );
};

const Dashboard: React.FC = () => {
    const { products, invoices, stores, settings, addStore } = useAppData();
    const { t, lang } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const storesWithDebts = useMemo(() => stores.map(store => {
        const storeInvoices = invoices.filter(inv => inv.storeId === store.id);
        const totalBilled = storeInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalPaid = storeInvoices.reduce((sum, inv) => 
            sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
        return { store, debt: totalBilled - totalPaid };
    }), [stores, invoices]);

    const filteredStores = useMemo(() => storesWithDebts.filter(({ store }) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [storesWithDebts, searchQuery]);

    const totalDebts = storesWithDebts.reduce((acc, { debt }) => acc + (debt > 0 ? debt : 0), 0);
    const lowStockProducts = products.filter(p => p.stock < settings.minStock).length;
    
    const handleSaveStore = (storeData: Omit<Store, 'id'>) => {
        addStore(storeData);
        setIsModalOpen(false);
    };

    const formatCurrency = (amount: number) => {
        // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
        return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', numberingSystem: 'latn' } as any).format(amount);
    };

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t('dashboard.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400">{t('dashboard.totalDebts')}</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebts)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400">{t('dashboard.productCount')}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{products.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400">{t('dashboard.storeCount')}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stores.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400">{t('dashboard.lowStock')}</h3>
                    <p className="text-3xl font-bold text-yellow-600">{lowStockProducts}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{t('dashboard.storesTitle')}</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder={t('dashboard.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full sm:w-auto"
                    />
                     <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center justify-center">
                        <PlusIcon className={`w-5 h-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`}/>
                        {t('dashboard.addStoreButton')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map(({ store, debt }) => (
                    <StoreCard key={store.id} store={store} debt={debt} />
                ))}
            </div>

            {isModalOpen && (
                <Modal title={t('dashboard.addStoreButton')} onClose={() => setIsModalOpen(false)}>
                    <StoreForm onSave={handleSaveStore} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;