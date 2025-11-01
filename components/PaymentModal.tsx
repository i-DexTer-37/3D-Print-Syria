
import React, { useState, useMemo } from 'react';
import type { Invoice, Payment } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Modal from './Modal';

interface PaymentModalProps {
  invoice: Invoice;
  onSave: (paymentData: Omit<Payment, 'id' | 'date'>) => void;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
    // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, numberingSystem: 'latn' } as any).format(amount);
};

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onSave, onClose }) => {
    const { t } = useTranslation();

    const totalPaid = useMemo(() => invoice.payments.reduce((sum, p) => sum + p.amount, 0), [invoice.payments]);
    const remainingAmount = invoice.totalAmount - totalPaid;

    const [amount, setAmount] = useState<number>(remainingAmount);
    const [method, setMethod] = useState<'cash' | 'card'>('cash');
    const [error, setError] = useState<string>('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setAmount(Number(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || amount > remainingAmount) {
            setError(t('invoices.paymentModal.amountError'));
            return;
        }
        onSave({ amount, method });
    };

    return (
        <Modal title={t('invoices.paymentModal.title', { invoiceNumber: invoice.invoiceNumber })} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('invoices.paymentModal.remaining')}</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(remainingAmount)}</p>
                </div>

                {error && (
                    <div className="p-3 my-2 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-center" role="alert">
                        {error}
                    </div>
                )}
                
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="amount">
                        {t('invoices.paymentModal.amount')}
                    </label>
                    <input 
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                        required
                        max={remainingAmount}
                        min="1"
                    />
                </div>
                
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        {t('invoices.paymentModal.method')}
                    </label>
                    <div className="flex rounded-md shadow-sm">
                        <button 
                            type="button"
                            onClick={() => setMethod('cash')} 
                            className={`px-4 py-2 text-sm font-medium border ${method === 'cash' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-l-md w-1/2`}
                        >
                            {t('invoices.paymentModal.cash')}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMethod('card')} 
                            className={`px-4 py-2 text-sm font-medium border ${method === 'card' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600'} rounded-r-md w-1/2`}
                        >
                            {t('invoices.paymentModal.card')}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                    <button onClick={onClose} type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline me-2">{t('common.cancel')}</button>
                    <button type="submit" className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{t('invoices.paymentModal.button')}</button>
                </div>
            </form>
        </Modal>
    )
};

export default PaymentModal;
