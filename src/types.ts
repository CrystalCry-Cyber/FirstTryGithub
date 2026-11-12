export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  borrowedCount: number;
  availableCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'DIPINJAM' | 'SELESAI';

export interface Transaction {
  id: string;
  borrowerName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  borrowDate: string;
  returnDate: string | null;
  status: TransactionStatus;
  processedBy: string;
  returnedBy: string | null;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

