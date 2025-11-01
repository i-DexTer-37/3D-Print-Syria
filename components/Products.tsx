

import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Product } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';


const ProductForm: React.FC<{ product?: Product; onSave: (product: Omit<Product, 'id'> | Product) => void; onCancel: () => void; categories: string[]; }> = ({ product, onSave, onCancel, categories }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [stock, setStock] = useState(product?.stock || 0);
    const [category, setCategory] = useState(product?.category || '');
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = { name, price, stock, category: category || 'غير مصنف', imageUrl };
        if (product) {
            onSave({ ...product, ...productData });
        } else {
            onSave(productData);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">{t('products.form.name')}</label>
                <input value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" id="name" type="text" required />
            </div>
             <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="price">{t('products.form.price')}</label>
                <input value={price} onChange={e => setPrice(Number(e.target.value))} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" id="price" type="number" required />
            </div>
             <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="stock">{t('products.form.stock')}</label>
                <input value={stock} onChange={e => setStock(Number(e.target.value))} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" id="stock" type="number" required />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="category">{t('products.form.category')}</label>
                 <input 
                    id="category"
                    type="text"
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                    required 
                    list="category-list"
                />
                <datalist id="category-list">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="imageUrl">{t('products.form.imageUrl')}</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-slate-600 dark:border-slate-500 dark:text-white" id="imageUrl" type="text" />
            </div>
            <div className="flex items-center justify-end pt-4">
                <button onClick={onCancel} type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline me-2">{t('common.cancel')}</button>
                <button type="submit" className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{t('common.save')}</button>
            </div>
        </form>
    );
};


const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, deleteCategory } = useAppData();
  const { t, lang } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCategoryName, setNewCategoryName] = useState('');

  const categoriesForFilter = useMemo(() => ['all', ...categories], [categories]);

  const filteredProducts = useMemo(() => {
      return products.filter(product => {
          const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
          const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
      });
  }, [products, searchQuery, selectedCategory]);

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
        updateProduct(productData);
    } else {
        addProduct(productData);
    }
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  }

  const handleConfirmDeleteProduct = () => {
    if (deletingProduct) {
        deleteProduct(deletingProduct.id);
        setDeletingProduct(null);
    }
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCategory(newCategoryName)) {
        alert(t('products.categoryExistsError'));
    } else {
        setNewCategoryName('');
    }
  };
  
  const handleCategoryDelete = (categoryName: string) => {
    if (categoryName === 'غير مصنف' || categoryName === 'Uncategorized') {
        alert(t('products.cannotDeleteDefaultCategory'));
        return;
    }
    setDeletingCategory(categoryName);
  };

  const handleConfirmDeleteCategory = () => {
      if (deletingCategory) {
          deleteCategory(deletingCategory);
          setDeletingCategory(null);
      }
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };
  
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    // FIX: Cast Intl.NumberFormat options to 'any' to allow 'numberingSystem' which is valid but may not be in older TS lib definitions.
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, numberingSystem: 'latn' } as any).format(amount);
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('products.title')}</h1>
        <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
            <button onClick={() => setCategoryModalOpen(true)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center">
                <TagIcon className={`w-5 h-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`}/>
                {t('products.manageCategories')}
            </button>
            <button onClick={openAddModal} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center justify-center">
                <PlusIcon className={`w-5 h-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`}/>
                {t('products.addProduct')}
            </button>
        </div>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input 
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="shadow-sm appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
        <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="shadow-sm appearance-none border rounded w-full sm:w-1/4 py-2 px-3 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
            <option value="all">{t('products.allCategories')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">{t('products.table.image')}</th>
              <th className="py-3 px-6 text-right">{t('products.table.product')}</th>
              <th className="py-3 px-6 text-right">{t('products.table.category')}</th>
              <th className="py-3 px-6 text-right">{t('products.table.price')}</th>
              <th className="py-3 px-6 text-right">{t('products.table.stock')}</th>
              <th className="py-3 px-6 text-center">{t('products.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700">
                <td className="py-3 px-6 text-right whitespace-nowrap">
                  <img src={product.imageUrl || 'https://picsum.photos/40'} alt={product.name} className="w-10 h-10 rounded-full object-cover"/>
                </td>
                <td className="py-3 px-6 text-right">
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="py-3 px-6 text-right">{product.category}</td>
                <td className="py-3 px-6 text-right">{formatCurrency(product.price)}</td>
                <td className="py-3 px-6 text-right">{product.stock}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center">
                    <button onClick={() => openEditModal(product)} className="w-5 h-5 mx-2 transform hover:text-teal-500 hover:scale-110">
                      <PencilIcon />
                    </button>
                    <button onClick={() => handleDeleteProduct(product)} className="w-5 h-5 transform hover:text-red-500 hover:scale-110">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <Modal title={editingProduct ? t('products.editProduct') : t('products.addProduct')} onClose={() => setIsModalOpen(false)}>
            <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => setIsModalOpen(false)} categories={categories} />
        </Modal>
      )}

      {isCategoryModalOpen && (
        <Modal title={t('products.manageCategories')} onClose={() => setCategoryModalOpen(false)}>
            <form onSubmit={handleAddCategory} className="flex items-center space-x-2 rtl:space-x-reverse border-b dark:border-slate-600 pb-4 mb-4">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('products.addCategoryPlaceholder')}
                    className="flex-grow shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-white leading-tight focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                />
                <button type="submit" className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center shrink-0">
                    <PlusIcon className={`w-5 h-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`}/>
                    {t('common.add')}
                </button>
            </form>
            <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('products.deleteCategoryInfo')}
                </p>
                {categories.map(category => (
                    <div key={category} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <span className="font-medium">{category}</span>
                        {category !== 'غير مصنف' && category !== 'Uncategorized' ? (
                             <button onClick={() => handleCategoryDelete(category)} className="text-gray-400 hover:text-red-600">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <span className="text-xs text-gray-400">{t('products.defaultCategory')}</span>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
      )}

      {deletingProduct && (
        <ConfirmationModal
            message={t('products.deleteConfirm', { productName: deletingProduct.name })}
            onConfirm={handleConfirmDeleteProduct}
            onCancel={() => setDeletingProduct(null)}
        />
      )}

      {deletingCategory && (
        <ConfirmationModal
            message={t('products.deleteCategoryConfirm', { categoryName: deletingCategory })}
            onConfirm={handleConfirmDeleteCategory}
            onCancel={() => setDeletingCategory(null)}
        />
      )}

    </div>
  );
};

export default Products;