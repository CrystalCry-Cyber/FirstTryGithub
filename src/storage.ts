import { Item, Transaction, User, ActivityLog } from './types';
import { getEnvAuthConfig } from './config/authConfig';

const STORAGE_KEYS = {
  USERS: 'simlab_users',
  ITEMS: 'simlab_items',
  TRANSACTIONS: 'simlab_transactions',
  LOGS: 'simlab_logs',
  SESSION: 'simlab_session',
};

export const getInitialUsers = (): User[] => {
  const envConfig = getEnvAuthConfig();
  return [
    {
      id: 'usr_admin',
      username: envConfig.admin.username,
      password: envConfig.admin.password,
      name: envConfig.admin.name,
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'usr_staff',
      username: envConfig.staff.username,
      password: envConfig.staff.password,
      name: envConfig.staff.name,
      role: 'STAFF',
      isActive: true,
      createdAt: '2026-02-01T08:30:00.000Z',
    },
  ];
};

const INITIAL_ITEMS: Item[] = [
  {
    id: 'itm_001',
    code: 'BR001',
    name: 'Laptop Lenovo',
    category: 'Laptop',
    stock: 5,
    borrowedCount: 1,
    availableCount: 4,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'itm_002',
    code: 'BR002',
    name: 'Mouse Logitech',
    category: 'Aksesoris',
    stock: 10,
    borrowedCount: 2,
    availableCount: 8,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'itm_003',
    code: 'BR003',
    name: 'Keyboard Mechanical',
    category: 'Aksesoris',
    stock: 8,
    borrowedCount: 0,
    availableCount: 8,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'itm_004',
    code: 'BR004',
    name: 'Proyektor Epson',
    category: 'Proyektor',
    stock: 3,
    borrowedCount: 1,
    availableCount: 2,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'itm_005',
    code: 'BR005',
    name: 'Monitor LG',
    category: 'Monitor',
    stock: 6,
    borrowedCount: 0,
    availableCount: 6,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'itm_006',
    code: 'BR006',
    name: 'Switch TP-Link 16-Port',
    category: 'Jaringan',
    stock: 4,
    borrowedCount: 0,
    availableCount: 4,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'itm_007',
    code: 'BR007',
    name: 'Router Mikrotik RB750',
    category: 'Jaringan',
    stock: 5,
    borrowedCount: 0,
    availableCount: 5,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'itm_008',
    code: 'BR008',
    name: 'Kabel HDMI 5M',
    category: 'Kabel & Adapter',
    stock: 12,
    borrowedCount: 1,
    availableCount: 11,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'itm_009',
    code: 'BR009',
    name: 'Web Camera Logitech C920',
    category: 'Kamera',
    stock: 4,
    borrowedCount: 0,
    availableCount: 4,
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-01-15T11:00:00.000Z',
  },
  {
    id: 'itm_010',
    code: 'BR010',
    name: 'Wireless Presenter Laser',
    category: 'Aksesoris',
    stock: 6,
    borrowedCount: 0,
    availableCount: 6,
    createdAt: '2026-01-15T11:30:00.000Z',
    updatedAt: '2026-01-15T11:30:00.000Z',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx_001',
    borrowerName: 'Ahmad Fauzi (Mahasiswa TI)',
    itemId: 'itm_001',
    itemCode: 'BR001',
    itemName: 'Laptop Lenovo',
    quantity: 1,
    borrowDate: '2026-11-10',
    returnDate: null,
    status: 'DIPINJAM',
    processedBy: 'staff',
    returnedBy: null,
    notes: 'Praktikum Jaringan Komputer',
    createdAt: '2026-11-10T09:15:00.000Z',
  },
  {
    id: 'trx_002',
    borrowerName: 'Dewi Lestari (Dosen Pembimbing)',
    itemId: 'itm_004',
    itemCode: 'BR004',
    itemName: 'Proyektor Epson',
    quantity: 1,
    borrowDate: '2026-11-11',
    returnDate: null,
    status: 'DIPINJAM',
    processedBy: 'admin',
    returnedBy: null,
    notes: 'Presentasi Sidang Skripsi Ruang 302',
    createdAt: '2026-11-11T08:30:00.000Z',
  },
  {
    id: 'trx_003',
    borrowerName: 'Rian Pratama (Mahasiswa SI)',
    itemId: 'itm_002',
    itemCode: 'BR002',
    itemName: 'Mouse Logitech',
    quantity: 2,
    borrowDate: '2026-11-11',
    returnDate: null,
    status: 'DIPINJAM',
    processedBy: 'staff',
    returnedBy: null,
    notes: 'Ujian Pemrograman Web',
    createdAt: '2026-11-11T10:00:00.000Z',
  },
  {
    id: 'trx_004',
    borrowerName: 'Kurniawan Eko (Mahasiswa TI)',
    itemId: 'itm_008',
    itemCode: 'BR008',
    itemName: 'Kabel HDMI 5M',
    quantity: 1,
    borrowDate: '2026-11-12',
    returnDate: null,
    status: 'DIPINJAM',
    processedBy: 'staff',
    returnedBy: null,
    notes: 'Workshop IoT',
    createdAt: '2026-11-12T07:45:00.000Z',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_001',
    action: 'Inisialisasi Sistem',
    actor: 'Sistem',
    details: 'Data awal inventaris laboratorium berhasil dimuat.',
    timestamp: '2026-11-01T08:00:00.000Z',
  },
];

export function getStoredUsers(): User[] {
  const initial = getInitialUsers();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const parsed: User[] = JSON.parse(raw);
    const envConfig = getEnvAuthConfig();

    // Pastikan akun Admin dan Staff selalu sinkron dengan kredensial di .env
    let modified = false;
    const synced = parsed.map((u) => {
      if (u.role === 'ADMIN') {
        if (u.username !== envConfig.admin.username || u.password !== envConfig.admin.password) {
          modified = true;
          return {
            ...u,
            username: envConfig.admin.username,
            password: envConfig.admin.password,
            name: envConfig.admin.name,
          };
        }
      }
      return u;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(synced));
      return synced;
    }

    return parsed;
  } catch {
    return initial;
  }
}

export function saveStoredUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: Item[]): void {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOGS;
  }
}

export function saveStoredLogs(logs: ActivityLog[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

export function getStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function resetToDefaultData(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(getInitialUsers()));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
}
