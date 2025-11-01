

import React, { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';

const Reports: React.FC = () => {
    const { products, invoices, stores, settings } = useAppData();
    const { theme } = useSettings();
    const { t } = useTranslation();

    const textFillColor = theme === 'dark' ? '#e2e8f0' : '#475569';
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#e2e8f0';

    const bestSellingProducts = useMemo(() => {
        const productSales: { [key: string]: number } = {};
        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            });
        });
        
        return Object.entries(productSales)
            .map(([productId, quantity]) => ({
                name: products.find(p => p.id === productId)?.name || t('reports.unknownProduct'),
                quantity,
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [invoices, products, t]);

    const topDebtors = useMemo(() => {
        return stores.map(store => {
            const storeInvoices = invoices.filter(inv => inv.storeId === store.id);
            const totalBilled = storeInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
            const totalPaid = storeInvoices.reduce((sum, inv) => 
                sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
            return {
                name: store.name,
                debt: totalBilled - totalPaid,
            };
        })
        .filter(s => s.debt > 0)
        .sort((a, b) => b.debt - a.debt)
        .slice(0, 5);
    }, [invoices, stores]);
    
    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.stock < settings.minStock);
    }, [products, settings.minStock]);

    const formatCurrency = (value: any) => {
        if (typeof value !== 'number') return value;
        // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
        return new Intl.NumberFormat('ar-SY', { notation: 'compact', numberingSystem: 'latn' } as any).format(value);
    }
    
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t('reports.title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-gray-200">{t('reports.bestSelling.title')}</h2>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestSellingProducts} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                    <XAxis type="number" tick={{ fill: textFillColor }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: textFillColor }}/>
                    <Tooltip
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#334155' : '#ffffff', border: `1px solid ${gridStrokeColor}` }}
                        labelStyle={{ color: textFillColor }}
                    />
                    <Legend wrapperStyle={{ color: textFillColor }} />
                    <Bar dataKey="quantity" fill="#14B8A6" name={t('reports.bestSelling.legend')} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-gray-200">{t('reports.topDebtors.title')}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDebtors}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                    <XAxis dataKey="name" tick={{ fill: textFillColor }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fill: textFillColor }} />
                    <Tooltip 
                        // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
                        formatter={(value: number) => new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', numberingSystem: 'latn' } as any).format(value)}
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#334155' : '#ffffff', border: `1px solid ${gridStrokeColor}` }}
                        labelStyle={{ color: textFillColor }}
                    />
                    <Legend wrapperStyle={{ color: textFillColor }} />
                    <Bar dataKey="debt" fill="#475569" name={t('reports.topDebtors.legend')} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-gray-200">{t('reports.lowStock.title', { count: settings.minStock })}</h2>
            {lowStockProducts.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                    {lowStockProducts.map(p => (
                        <li key={p.id} className="py-3 flex justify-between items-center dark:text-gray-300">
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded-full text-sm">{t('reports.lowStock.remaining')}: {p.stock}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500 dark:text-gray-400">{t('reports.lowStock.none')}</p>}
        </div>

      </div>
    </div>
  );
};

export default Reports;