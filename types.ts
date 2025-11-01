// FIX: Populating file with type definitions for Product, Invoice, Store, and Settings to be used across the application.
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'card';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  storeId: string;
  items: InvoiceItem[];
  totalAmount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'partial';
  payments: Payment[];
}

export interface Store {
  id: string;
  name: string;
  location: string;
  owner: string;
  phone: string;
}

export interface AppSettings {
  minStock: number;
  usdRate: number;
}