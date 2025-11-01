import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Product, Store, Invoice, AppSettings, Payment } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_INVOICES } from '../constants';

const APP_DATA_KEY = 'pos-v2-data';

interface AppData {
  products: Product[];
  stores: Store[];
  invoices: Invoice[];
  settings: AppSettings;
  categories: string[];
}

interface AppContextType extends AppData {
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (categoryName: string) => boolean;
  deleteCategory: (categoryName: string) => void;
  addStore: (store: Omit<Store, 'id'>) => void;
  deleteStore: (storeId: string) => void;
  updateSettings: (newSettings: AppSettings) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  addPayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(APP_DATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      localStorage.removeItem(APP_DATA_KEY);
    }
    
    const initialProducts = INITIAL_PRODUCTS;
    return {
      products: initialProducts,
      stores: INITIAL_STORES,
      invoices: INITIAL_INVOICES,
      settings: { minStock: 10, usdRate: 13500 },
      categories: Array.from(new Set(initialProducts.map(p => p.category))).sort(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      alert('Failed to save data. Your browser storage might be full.');
    }
  }, [appData]);

  const addCategory = useCallback((categoryName: string): boolean => {
    const trimmedName = categoryName.trim();
    let success = false;
    setAppData(prev => {
        if (trimmedName && !prev.categories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
            success = true;
            return { ...prev, categories: [...prev.categories, trimmedName].sort() };
        }
        return prev;
    });
    return success;
  }, []);
  
  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setAppData(prev => {
        const newProducts = [...prev.products, { ...product, id: `p${Date.now()}` }];
        let newCategories = prev.categories;
        if (product.category && !prev.categories.includes(product.category)) {
            newCategories = [...prev.categories, product.category].sort();
        }
        return { ...prev, products: newProducts, categories: newCategories };
    });
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setAppData(prev => {
        const newProducts = prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        let newCategories = prev.categories;
        if (updatedProduct.category && !prev.categories.includes(updatedProduct.category)) {
            newCategories = [...prev.categories, updatedProduct.category].sort();
        }
        return { ...prev, products: newProducts, categories: newCategories };
    });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    const invoicesUsingProduct = appData.invoices.filter(invoice => 
      invoice.items.some(item => item.productId === productId)
    );

    if (invoicesUsingProduct.length > 0) {
      const invoiceNumbers = invoicesUsingProduct.map(i => i.invoiceNumber).join(', ');
      alert(`لا يمكن حذف هذا المنتج لأنه مستخدم في الفواتير التالية: ${invoiceNumbers}.`);
      return;
    }
    
    setAppData(prev => ({...prev, products: prev.products.filter(p => p.id !== productId)}));
  }, [appData.invoices]);
  
  const deleteCategory = useCallback((categoryName: string) => {
    setAppData(prev => {
        const newProducts = prev.products.map(p => p.category === categoryName ? { ...p, category: 'غير مصنف' } : p);
        const newCategories = prev.categories.filter(c => c !== categoryName);
        return { ...prev, products: newProducts, categories: newCategories };
    });
  }, []);

  const addStore = useCallback((store: Omit<Store, 'id'>) => {
    setAppData(prev => ({...prev, stores: [...prev.stores, { ...store, id: `s${Date.now()}` }] }));
  }, []);

  const deleteStore = useCallback((storeId: string) => {
    setAppData(prevData => {
        const invoicesToDelete = prevData.invoices.filter(inv => inv.storeId === storeId);
        let updatedProducts = [...prevData.products];

        invoicesToDelete.forEach(invoice => {
            invoice.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const currentProduct = updatedProducts[productIndex];
                    updatedProducts[productIndex] = {
                        ...currentProduct,
                        stock: currentProduct.stock + item.quantity,
                    };
                }
            });
        });

        const updatedStores = prevData.stores.filter(s => s.id !== storeId);
        const updatedInvoices = prevData.invoices.filter(inv => inv.storeId !== storeId);

        return { ...prevData, products: updatedProducts, stores: updatedStores, invoices: updatedInvoices };
    });
  }, []);
  
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setAppData(prev => ({...prev, settings: newSettings}));
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    setAppData(prev => {
      const newInvoiceNumber = `INV-${String(prev.invoices.length + 1).padStart(3, '0')}`;
      const newInvoice: Invoice = { ...invoice, id: `i${Date.now()}`, invoiceNumber: newInvoiceNumber };
      
      let updatedProducts = [...prev.products];
      newInvoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            const currentProduct = updatedProducts[productIndex];
            updatedProducts[productIndex] = { ...currentProduct, stock: currentProduct.stock - item.quantity };
        }
      });
      
      return { ...prev, products: updatedProducts, invoices: [newInvoice, ...prev.invoices] };
    });
  }, []);
  
  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    setAppData(prev => ({...prev, invoices: prev.invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i)}));
  }, []);
  
  const deleteInvoice = useCallback((invoiceId: string) => {
      setAppData(prev => {
          const invoiceToDelete = prev.invoices.find(i => i.id === invoiceId);
          if (invoiceToDelete) {
              let updatedProducts = [...prev.products];
              invoiceToDelete.items.forEach(item => {
                  const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                  if (productIndex !== -1) {
                      const currentProduct = updatedProducts[productIndex];
                      updatedProducts[productIndex] = { ...currentProduct, stock: currentProduct.stock + item.quantity };
                  }
              });
              const updatedInvoices = prev.invoices.filter(i => i.id !== invoiceId);
              return { ...prev, products: updatedProducts, invoices: updatedInvoices };
          }
          return prev;
      });
  }, []);
  
  const addPayment = useCallback((invoiceId: string, payment: Omit<Payment, 'id'>) => {
      setAppData(prev => ({
          ...prev,
          invoices: prev.invoices.map(invoice => {
              if (invoice.id === invoiceId) {
                  const newPayments = [...invoice.payments, {...payment, id: `pay${Date.now()}`}];
                  const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
                  const newStatus = totalPaid >= invoice.totalAmount ? 'paid' : 'partial';
                  return { ...invoice, payments: newPayments, status: newStatus };
              }
              return invoice;
          })
      }));
  }, []);

  const exportData = useCallback(() => {
    const jsonString = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `pos-data-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [appData]);

  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && data.stores && data.invoices && data.settings && data.categories) {
        setAppData(data);
        alert('تم استيراد البيانات بنجاح!');
      } else {
        throw new Error('الملف غير صالح أو لا يحتوي على البيانات المطلوبة.');
      }
    } catch (error: any) {
      console.error('Error importing data:', error);
      alert(`حدث خطأ أثناء استيراد البيانات: ${error.message}`);
    }
  }, []);

  const value = {
    ...appData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addStore,
    deleteStore,
    updateSettings,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    exportData,
    importData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
};