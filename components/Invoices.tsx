import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Invoice, InvoiceItem, Payment } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import PaymentModal from './PaymentModal';
import { PlusIcon, EyeIcon, TrashIcon, CashIcon, CheckCircleIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';

// Helper function to get status color
const getStatusChip = (status: 'paid' | 'unpaid' | 'partial', t: (key: string) => string) => {
    switch (status) {
        case 'paid':
            return <span className="px-2 py-1 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">{t('invoices.status.paid')}</span>;
        case 'unpaid':
            return <span className="px-2 py-1 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">{t('invoices.status.unpaid')}</span>;
        case 'partial':
            return <span className="px-2 py-1 text-xs font-semibold leading-5 text-yellow-800 bg-yellow-100 rounded-full">{t('invoices.status.partial')}</span>;
        default:
            return null;
    }
};

const formatCurrency = (amount: number) => {
    // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, numberingSystem: 'latn' } as any).format(amount);
};

const InvoiceDetailsModal: React.FC<{ invoice: Invoice; onClose: () => void; }> = ({ invoice, onClose }) => {
    const { products, stores, settings } = useAppData();
    const { t } = useTranslation();
    const store = stores.find(s => s.id === invoice.storeId);
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <Modal title={`${t('invoices.details.title')} #${invoice.invoiceNumber}`} onClose={onClose}>
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>{t('invoices.details.store')}:</strong> {store?.name || t('invoices.details.unknown')}</p>
                <p><strong>{t('invoices.details.date')}:</strong> {new Date(invoice.date).toLocaleDateString('ar-SY', { numberingSystem: 'latn' } as any)}</p>
                <p><strong>{t('invoices.details.status')}:</strong> {getStatusChip(invoice.status, t)}</p>

                <h4 className="font-bold pt-2 border-t dark:border-slate-600 mt-4">{t('invoices.details.products')}</h4>
                <ul className="divide-y dark:divide-slate-600">
                    {invoice.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                            <li key={item.productId} className="flex justify-between py-2">
                                <span>{product?.name || t('invoices.details.deletedProduct')} (x{item.quantity})</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        )
                    })}
                </ul>
                
                <h4 className="font-bold pt-2 border-t dark:border-slate-600 mt-4">{t('invoices.details.payments')}</h4>
                {invoice.payments.length > 0 ? (
                    <ul className="divide-y dark:divide-slate-600">
                        {invoice.payments.map(p => (
                            <li key={p.id} className="flex justify-between py-2">
                                <span>{new Date(p.date).toLocaleDateString('ar-SY', { numberingSystem: 'latn' } as any)} ({p.method === 'cash' ? t('invoices.details.cash') : t('invoices.details.card')})</span>
                                <span>{formatCurrency(p.amount)}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500">{t('invoices.details.noPayments')}</p>}
                
                <div className="font-bold text-base pt-4 border-t dark:border-slate-600 mt-4 space-y-2 text-right">
                    <p>{t('invoices.details.total')}: {formatCurrency(invoice.totalAmount)}</p>
                    <p>{t('invoices.details.paidAmount')}: {formatCurrency(totalPaid)}</p>
                    <p className="text-red-600">{t('invoices.details.remaining')}: {formatCurrency(invoice.totalAmount - totalPaid)}</p>
                    <p className="text-gray-500 text-sm">{t('invoices.details.usdRate', { rate: formatCurrency(settings.usdRate) })}: {formatCurrency(invoice.totalAmount / settings.usdRate).replace('SYP', '$')}</p>
                </div>
            </div>
        </Modal>
    );
};


const InvoiceForm: React.FC<{ onSave: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const { stores, products } = useAppData();
    const { t } = useTranslation();
    const [storeId, setStoreId] = useState<string>('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [currentProductId, setCurrentProductId] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState(1);

    const availableProducts = useMemo(() => {
        return products.filter(p => !items.some(i => i.productId === p.id));
    }, [products, items]);
    
    const handleAddItem = () => {
        const product = products.find(p => p.id === currentProductId);
        if (!product || currentQuantity <= 0) return;
        if (currentQuantity > product.stock) {
            alert(t('invoices.form.stockError', { quantity: currentQuantity, stock: product.stock }));
            return;
        }

        const newItem: InvoiceItem = {
            productId: product.id,
            quantity: currentQuantity,
            price: product.price, // Use current price
        };
        setItems(prev => [...prev, newItem]);
        setCurrentProductId('');
        setCurrentQuantity(1);
    };

    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId || items.length === 0) {
            alert(t('invoices.form.validationError'));
            return;
        }
        onSave({
            storeId,
            items,
            totalAmount,
            date: new Date().toISOString().split('T')[0],
            status: 'unpaid',
            payments: [],
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-bold mb-2 dark:text-gray-300">{t('invoices.form.selectStore')}</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} className="shadow border rounded w-full py-2 px-3 dark:bg-slate-600 dark:border-slate-500 dark:text-white" required>
                    <option value="" disabled>-- {t('invoices.form.selectStore')} --</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            <div className="border dark:border-slate-600 p-4 rounded-md space-y-3">
                <h4 className="font-bold dark:text-gray-200">{t('invoices.form.addProduct')}</h4>
                <div className="flex items-end space-x-2 rtl:space-x-reverse">
                    <div className="flex-grow">
                        <label className="block text-xs dark:text-gray-400">{t('invoices.form.product')}</label>
                        <select value={currentProductId} onChange={e => setCurrentProductId(e.target.value)} className="shadow border rounded w-full py-2 px-3 dark:bg-slate-600 dark:border-slate-500 dark:text-white">
                           <option value="" disabled>-- {t('invoices.form.selectProduct')} --</option>
                           {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({t('invoices.form.stock')}: {p.stock})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs dark:text-gray-400">{t('invoices.form.quantity')}</label>
                        <input type="number" value={currentQuantity} onChange={e => setCurrentQuantity(Math.max(1, Number(e.target.value)))} className="shadow border rounded w-24 py-2 px-3 dark:bg-slate-600 dark:border-slate-500 dark:text-white"/>
                    </div>
                    <button type="button" onClick={handleAddItem} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">{t('common.add')}</button>
                </div>
            </div>

            <div>
                <h4 className="font-bold dark:text-gray-200">{t('invoices.form.invoiceItems')}</h4>
                {items.length > 0 ? (
                    <ul className="divide-y dark:divide-slate-600 mt-2">
                        {items.map(item => {
                            const product = products.find(p => p.id === item.productId)!;
                            return (
                                <li key={item.productId} className="flex justify-between items-center py-2 dark:text-gray-300">
                                    <div>{product.name}</div>
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <span>{item.quantity} x {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}</span>
                                        <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : <p className="text-gray-500 text-sm mt-2">{t('invoices.form.noItems')}</p>}
            </div>

            <div className="text-xl font-bold text-right pt-4 border-t dark:border-slate-600 dark:text-gray-200">
                {t('invoices.form.total')}: {formatCurrency(totalAmount)}
            </div>

            <div className="flex items-center justify-end pt-4">
                <button onClick={onCancel} type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded me-2">{t('common.cancel')}</button>
                <button type="submit" className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">{t('invoices.form.createButton')}</button>
            </div>
        </form>
    );
};


const Invoices: React.FC = () => {
    const { invoices, stores, deleteInvoice, addInvoice, addPayment } = useAppData();
    const { t, lang } = useTranslation();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | undefined>();
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
    const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const storeMap = useMemo(() => stores.reduce((acc, store) => {
        acc[store.id] = store.name;
        return acc;
    }, {} as Record<string, string>), [stores]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const storeName = storeMap[invoice.storeId] || '';
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  storeName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [invoices, searchQuery, storeMap]);

    const handleDelete = (invoice: Invoice) => {
        setDeletingInvoice(invoice);
    }

    const handleConfirmDelete = () => {
        if(deletingInvoice) {
            deleteInvoice(deletingInvoice.id);
            setDeletingInvoice(null);
        }
    }

    const handleSaveInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
        addInvoice(invoiceData);
        setAddModalOpen(false);
    };

    const handleSavePayment = (paymentData: Omit<Payment, 'id' | 'date'>) => {
        if (payingInvoice) {
            addPayment(payingInvoice.id, {
                ...paymentData,
                date: new Date().toISOString().split('T')[0],
            });
            setPayingInvoice(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('invoices.title')}</h1>
                 <button onClick={() => setAddModalOpen(true)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center">
                    <PlusIcon className={`w-5 h-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`}/>
                    {t('invoices.newInvoiceButton')}
                </button>
            </div>
            <div className="mb-4">
                <input 
                    type="text"
                    placeholder={t('invoices.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="shadow-sm appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-right">{t('invoices.table.number')}</th>
                            <th className="py-3 px-6 text-right">{t('invoices.table.store')}</th>
                            <th className="py-3 px-6 text-right">{t('invoices.table.date')}</th>
                            <th className="py-3 px-6 text-right">{t('invoices.table.total')}</th>
                            <th className="py-3 px-6 text-center">{t('invoices.table.status')}</th>
                            <th className="py-3 px-6 text-center">{t('invoices.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                        {filteredInvoices.map(invoice => {
                            const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
                            const remainingAmount = invoice.totalAmount - totalPaid;

                            return (
                                <tr key={invoice.id} className="border-b dark:border-slate-700 border-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700">
                                    <td className="py-3 px-6 text-right font-mono">{invoice.invoiceNumber}</td>
                                    <td className="py-3 px-6 text-right">{storeMap[invoice.storeId] || t('invoices.table.deletedStore')}</td>
                                    <td className="py-3 px-6 text-right">{new Date(invoice.date).toLocaleDateString('ar-SY', { numberingSystem: 'latn' } as any)}</td>
                                    <td className="py-3 px-6 text-right font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex flex-col items-center">
                                            {getStatusChip(invoice.status, t)}
                                            {invoice.status === 'partial' && remainingAmount > 0 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('invoices.table.remaining')}: {formatCurrency(remainingAmount)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                                            {invoice.status === 'paid' && (
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" title={t('invoices.status.paid')} />
                                            )}
                                            {invoice.status !== 'paid' && (
                                                <button onClick={() => setPayingInvoice(invoice)} className="w-5 h-5 transform hover:text-green-500 hover:scale-110" title={t('invoices.table.pay')}>
                                                    <CashIcon />
                                                </button>
                                            )}
                                            <button onClick={() => setViewingInvoice(invoice)} className="w-5 h-5 transform hover:text-teal-500 hover:scale-110" title={t('invoices.details.title')}>
                                                <EyeIcon />
                                            </button>
                                            <button onClick={() => handleDelete(invoice)} className="w-5 h-5 transform hover:text-red-500 hover:scale-110" title={t('common.deleteAction')}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <Modal title={t('invoices.newInvoiceButton')} onClose={() => setAddModalOpen(false)}>
                    <InvoiceForm onSave={handleSaveInvoice} onCancel={() => setAddModalOpen(false)} />
                </Modal>
            )}

            {viewingInvoice && (
                <InvoiceDetailsModal invoice={viewingInvoice} onClose={() => setViewingInvoice(undefined)} />
            )}

            {payingInvoice && (
                <PaymentModal
                    invoice={payingInvoice}
                    onClose={() => setPayingInvoice(null)}
                    onSave={handleSavePayment}
                />
            )}

            {deletingInvoice && (
                <ConfirmationModal
                    message={t('invoices.deleteConfirm', { invoiceNumber: deletingInvoice.invoiceNumber })}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeletingInvoice(null)}
                />
            )}
        </div>
    );
};

export default Invoices;