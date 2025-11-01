
// FIX: Creating the StoreCard component to display store information.
import React, { useState } from 'react';
import type { Store } from '../types';
import { useAppData } from '../hooks/useAppData';
import { LocationIcon, PhoneIcon, TrashIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';
import ConfirmationModal from './ConfirmationModal';

interface StoreCardProps {
  store: Store;
  debt: number;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, debt }) => {
  const { deleteStore } = useAppData();
  const { t, lang } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteStore(store.id);
    setIsConfirmOpen(false);
  };

  const formatCurrency = (amount: number) => {
    // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, numberingSystem: 'latn' } as any).format(amount);
  };
  
  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{store.name}</h3>
              <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
                <TrashIcon className="w-5 h-5"/>
              </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p className="flex items-center"><LocationIcon className={`w-4 h-4 text-gray-400 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} /> {store.location}</p>
              <p className="flex items-center"><PhoneIcon className={`w-4 h-4 text-gray-400 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} /> {store.phone}</p>
              <p>{t('storeCard.owner')}: {store.owner}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('storeCard.totalDebt')}:</p>
          <p className={`text-xl font-bold ${debt > 0 ? 'text-red-600' : 'text-teal-600'}`}>{formatCurrency(debt)}</p>
        </div>
      </div>
      {isConfirmOpen && (
        <ConfirmationModal
          message={t('storeCard.deleteMessage', { storeName: store.name })}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
};

export default StoreCard;
