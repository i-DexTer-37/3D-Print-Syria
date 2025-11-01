// FIX: Populating file with initial mock data for products, stores, and invoices.
import type { Product, Store, Invoice } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'شاي أسود فاخر', price: 15000, stock: 120, category: 'مشروبات', imageUrl: 'https://picsum.photos/seed/p1/40' },
  { id: 'p2', name: 'قهوة عربية أصيلة', price: 25000, stock: 80, category: 'مشروبات', imageUrl: 'https://picsum.photos/seed/p2/40' },
  { id: 'p3', name: 'بسكويت بالتمر', price: 8000, stock: 200, category: 'حلويات', imageUrl: 'https://picsum.photos/seed/p3/40' },
  { id: 'p4', name: 'زيت زيتون بكر', price: 50000, stock: 4, category: 'زيوت', imageUrl: 'https://picsum.photos/seed/p4/40' },
  { id: 'p5', name: 'مربى المشمش', price: 12000, stock: 90, category: 'معلبات', imageUrl: 'https://picsum.photos/seed/p5/40' },
];

export const INITIAL_STORES: Store[] = [
  { id: 's1', name: 'متجر الياسمين', location: 'دمشق, المزة', owner: 'أحمد المصري', phone: '0912345678' },
  { id: 's2', name: 'سوبرماركت النور', location: 'حلب, الفرقان', owner: 'فاطمة الكيلاني', phone: '0987654321' },
  { id: 's3', name: 'بقالية البركة', location: 'حمص, الوعر', owner: 'خالد الشامي', phone: '0911223344' },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'i1',
    invoiceNumber: 'INV-001',
    storeId: 's1',
    date: '2023-10-26',
    items: [
      { productId: 'p1', quantity: 10, price: 14500 },
      { productId: 'p3', quantity: 20, price: 7800 },
    ],
    totalAmount: 301000,
    status: 'partial',
    payments: [{ id: 'pay1', amount: 200000, date: '2023-10-26', method: 'cash' }],
  },
  {
    id: 'i2',
    invoiceNumber: 'INV-002',
    storeId: 's2',
    date: '2023-10-25',
    items: [{ productId: 'p2', quantity: 5, price: 25000 }],
    totalAmount: 125000,
    status: 'paid',
    payments: [{ id: 'pay2', amount: 125000, date: '2023-10-25', method: 'card' }],
  },
  {
    id: 'i3',
    invoiceNumber: 'INV-003',
    storeId: 's1',
    date: '2023-10-27',
    items: [
      { productId: 'p4', quantity: 2, price: 50000 },
      { productId: 'p5', quantity: 10, price: 12000 },
    ],
    totalAmount: 220000,
    status: 'unpaid',
    payments: [],
  },
];