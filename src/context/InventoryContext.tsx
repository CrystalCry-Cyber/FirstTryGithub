import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Transaction, User, ActivityLog } from '../types';
import {
  getStoredItems,
  saveStoredItems,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredUsers,
  saveStoredUsers,
  getStoredLogs,
  saveStoredLogs,
  resetToDefaultData,
} from '../storage';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

interface InventoryContextType {
  items: Item[];
  transactions: Transaction[];
  users: User[];
  logs: ActivityLog[];
  isCloudConnected: boolean;
  addItem: (item: Omit<Item, 'id' | 'borrowedCount' | 'availableCount' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message?: string }>;
  updateItem: (id: string, updates: Partial<Pick<Item, 'name' | 'category' | 'stock'>>) => Promise<{ success: boolean; message?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; message?: string }>;
  borrowItem: (data: { borrowerName: string; itemId: string; quantity: number; borrowDate: string; notes?: string }) => Promise<{ success: boolean; message?: string }>;
  returnItem: (transactionId: string) => Promise<{ success: boolean; message?: string }>;
  addStaffUser: (data: { username: string; password: string; name: string }) => Promise<{ success: boolean; message?: string }>;
  updateUser: (id: string, updates: Partial<Pick<User, 'name' | 'password' | 'isActive'>>) => Promise<{ success: boolean; message?: string }>;
  toggleUserStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  resetAllData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const loadData = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const [itemsRes, trxRes, usersRes, logsRes] = await Promise.all([
          supabase.from('items').select('*').order('code', { ascending: true }),
          supabase.from('transactions').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('*').order('created_at', { ascending: true }),
          supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50),
        ]);

        if (itemsRes.data && itemsRes.data.length > 0) {
          setItems(
            itemsRes.data.map((i: any) => ({
              id: i.id,
              code: i.code,
              name: i.name,
              category: i.category,
              stock: i.stock,
              borrowedCount: i.borrowed_count,
              availableCount: i.available_count,
              createdAt: i.created_at,
              updatedAt: i.updated_at,
            }))
          );
        } else {
          setItems(getStoredItems());
        }

        if (trxRes.data && trxRes.data.length > 0) {
          setTransactions(
            trxRes.data.map((t: any) => ({
              id: t.id,
              borrowerName: t.borrower_name,
              itemId: t.item_id,
              itemCode: t.item_code,
              itemName: t.item_name,
              quantity: t.quantity,
              borrowDate: t.borrow_date,
              returnDate: t.return_date,
              status: t.status,
              processedBy: t.processed_by,
              returnedBy: t.returned_by,
              notes: t.notes || '',
              createdAt: t.created_at,
            }))
          );
        } else {
          setTransactions(getStoredTransactions());
        }

        if (usersRes.data && usersRes.data.length > 0) {
          setUsers(
            usersRes.data.map((u: any) => ({
              id: u.id,
              username: u.username,
              password: u.password,
              name: u.name,
              role: u.role,
              isActive: u.is_active,
              createdAt: u.created_at,
            }))
          );
        } else {
          setUsers(getStoredUsers());
        }

        if (logsRes.data && logsRes.data.length > 0) {
          setLogs(
            logsRes.data.map((l: any) => ({
              id: l.id,
              action: l.action,
              actor: l.actor,
              details: l.details,
              timestamp: l.timestamp,
            }))
          );
        } else {
          setLogs(getStoredLogs());
        }
        return;
      } catch (err) {
        console.error('Error fetching Supabase data, fallback to local storage:', err);
      }
    }

    setItems(getStoredItems());
    setTransactions(getStoredTransactions());
    setUsers(getStoredUsers());
    setLogs(getStoredLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLog = async (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      actor: currentUser ? currentUser.username : 'Sistem',
      details,
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('activity_logs').insert([
          {
            id: newLog.id,
            action: newLog.action,
            actor: newLog.actor,
            details: newLog.details,
            timestamp: newLog.timestamp,
          },
        ]);
      } catch (err) {
        console.error('Supabase log insert error:', err);
      }
    }

    const updated = [newLog, ...logs];
    setLogs(updated);
    saveStoredLogs(updated);
  };

  const addItem = async (
    itemData: Omit<Item, 'id' | 'borrowedCount' | 'availableCount' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat menambahkan data barang.' };
    }

    const trimmedCode = itemData.code.trim().toUpperCase();
    const trimmedName = itemData.name.trim();

    if (!trimmedCode || !trimmedName) {
      return { success: false, message: 'Kode dan nama barang wajib diisi.' };
    }

    if (items.some((i) => i.code.toUpperCase() === trimmedCode)) {
      return { success: false, message: `Kode barang ${trimmedCode} sudah digunakan.` };
    }

    if (itemData.stock < 1) {
      return { success: false, message: 'Jumlah stok minimal 1 unit.' };
    }

    const now = new Date().toISOString();
    const newItem: Item = {
      id: `itm_${Date.now()}`,
      code: trimmedCode,
      name: trimmedName,
      category: itemData.category.trim() || 'Umum',
      stock: itemData.stock,
      borrowedCount: 0,
      availableCount: itemData.stock,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('items').insert([
          {
            id: newItem.id,
            code: newItem.code,
            name: newItem.name,
            category: newItem.category,
            stock: newItem.stock,
            borrowed_count: 0,
            available_count: newItem.stock,
            created_at: newItem.createdAt,
            updated_at: newItem.updatedAt,
          },
        ]);

        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal menyimpan ke Supabase: ${err.message}` };
      }
    }

    const updated = [...items, newItem];
    setItems(updated);
    saveStoredItems(updated);
    await addLog('Tambah Barang', `Menambahkan barang: ${newItem.code} - ${newItem.name} (Stok: ${newItem.stock})`);
    return { success: true };
  };

  const updateItem = async (
    id: string,
    updates: Partial<Pick<Item, 'name' | 'category' | 'stock'>>
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat mengubah data barang.' };
    }

    const existing = items.find((i) => i.id === id);
    if (!existing) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    const newStock = updates.stock !== undefined ? updates.stock : existing.stock;
    if (newStock < existing.borrowedCount) {
      return {
        success: false,
        message: `Stok tidak boleh lebih kecil dari jumlah barang yang sedang dipinjam (${existing.borrowedCount} unit).`,
      };
    }

    const available = newStock - existing.borrowedCount;
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('items')
          .update({
            name: updates.name !== undefined ? updates.name.trim() : existing.name,
            category: updates.category !== undefined ? updates.category.trim() : existing.category,
            stock: newStock,
            available_count: available,
            updated_at: now,
          })
          .eq('id', id);

        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal memperbarui di Supabase: ${err.message}` };
      }
    }

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name: updates.name !== undefined ? updates.name.trim() : item.name,
          category: updates.category !== undefined ? updates.category.trim() : item.category,
          stock: newStock,
          availableCount: available,
          updatedAt: now,
        };
      }
      return item;
    });

    setItems(updatedItems);
    saveStoredItems(updatedItems);
    await addLog('Ubah Barang', `Memperbarui barang: ${existing.code} - ${existing.name}`);
    return { success: true };
  };

  const deleteItem = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang memiliki hak akses menghapus barang.' };
    }

    const target = items.find((i) => i.id === id);
    if (!target) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    if (target.borrowedCount > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus barang karena terdapat ${target.borrowedCount} unit yang masih dipinjam.`,
      };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal menghapus dari Supabase: ${err.message}` };
      }
    }

    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveStoredItems(updated);
    await addLog('Hapus Barang', `Menghapus barang: ${target.code} - ${target.name}`);
    return { success: true };
  };

  const borrowItem = async (data: {
    borrowerName: string;
    itemId: string;
    quantity: number;
    borrowDate: string;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Sesi pengguna tidak valid. Silakan login kembali.' };
    }

    const borrower = data.borrowerName.trim();
    if (!borrower) {
      return { success: false, message: 'Nama peminjam wajib diisi.' };
    }

    if (data.quantity < 1) {
      return { success: false, message: 'Jumlah peminjaman minimal 1 unit.' };
    }

    const targetItem = items.find((i) => i.id === data.itemId);
    if (!targetItem) {
      return { success: false, message: 'Pilihan barang tidak ditemukan.' };
    }

    if (targetItem.availableCount < data.quantity) {
      return {
        success: false,
        message: `Stok tidak mencukupi. Tersedia ${targetItem.availableCount} unit, permintaan ${data.quantity} unit.`,
      };
    }

    const newBorrowed = targetItem.borrowedCount + data.quantity;
    const newAvailable = targetItem.stock - newBorrowed;
    const now = new Date().toISOString();

    const newTransaction: Transaction = {
      id: `trx_${Date.now()}`,
      borrowerName: borrower,
      itemId: targetItem.id,
      itemCode: targetItem.code,
      itemName: targetItem.name,
      quantity: data.quantity,
      borrowDate: data.borrowDate || now.split('T')[0],
      returnDate: null,
      status: 'DIPINJAM',
      processedBy: currentUser.username,
      returnedBy: null,
      notes: data.notes?.trim() || '',
      createdAt: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: trxErr } = await supabase.from('transactions').insert([
          {
            id: newTransaction.id,
            borrower_name: newTransaction.borrowerName,
            item_id: newTransaction.itemId,
            item_code: newTransaction.itemCode,
            item_name: newTransaction.itemName,
            quantity: newTransaction.quantity,
            borrow_date: newTransaction.borrowDate,
            return_date: null,
            status: 'DIPINJAM',
            processed_by: newTransaction.processedBy,
            returned_by: null,
            notes: newTransaction.notes,
            created_at: newTransaction.createdAt,
          },
        ]);

        if (trxErr) {
          return { success: false, message: `Galat Supabase (Transaksi): ${trxErr.message}` };
        }

        const { error: itemErr } = await supabase
          .from('items')
          .update({
            borrowed_count: newBorrowed,
            available_count: newAvailable,
            updated_at: now,
          })
          .eq('id', targetItem.id);

        if (itemErr) {
          return { success: false, message: `Galat Supabase (Stok Barang): ${itemErr.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal mencatat peminjaman ke Supabase: ${err.message}` };
      }
    }

    const updatedItems = items.map((item) => {
      if (item.id === targetItem.id) {
        return {
          ...item,
          borrowedCount: newBorrowed,
          availableCount: newAvailable,
          updatedAt: now,
        };
      }
      return item;
    });

    const updatedTransactions = [newTransaction, ...transactions];

    setItems(updatedItems);
    saveStoredItems(updatedItems);
    setTransactions(updatedTransactions);
    saveStoredTransactions(updatedTransactions);

    await addLog(
      'Peminjaman Barang',
      `${borrower} meminjam ${data.quantity} unit ${targetItem.name} (${targetItem.code}). Diproses oleh ${currentUser.username}.`
    );

    return { success: true };
  };

  const returnItem = async (transactionId: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Sesi pengguna tidak valid.' };
    }

    const targetTrx = transactions.find((t) => t.id === transactionId);
    if (!targetTrx) {
      return { success: false, message: 'Data transaksi tidak ditemukan.' };
    }

    if (targetTrx.status === 'SELESAI') {
      return { success: false, message: 'Transaksi ini telah selesai diproses sebelumnya.' };
    }

    const returnDateStr = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const targetItem = items.find((i) => i.id === targetTrx.itemId);
    const newBorrowed = targetItem ? Math.max(0, targetItem.borrowedCount - targetTrx.quantity) : 0;
    const newAvailable = targetItem ? targetItem.stock - newBorrowed : 0;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: trxErr } = await supabase
          .from('transactions')
          .update({
            status: 'SELESAI',
            return_date: returnDateStr,
            returned_by: currentUser.username,
          })
          .eq('id', transactionId);

        if (trxErr) {
          return { success: false, message: `Galat Supabase (Transaksi): ${trxErr.message}` };
        }

        if (targetItem) {
          const { error: itemErr } = await supabase
            .from('items')
            .update({
              borrowed_count: newBorrowed,
              available_count: newAvailable,
              updated_at: now,
            })
            .eq('id', targetItem.id);

          if (itemErr) {
            return { success: false, message: `Galat Supabase (Stok Barang): ${itemErr.message}` };
          }
        }
      } catch (err: any) {
        return { success: false, message: `Gagal memproses pengembalian di Supabase: ${err.message}` };
      }
    }

    const updatedTransactions = transactions.map((t) => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'SELESAI' as const,
          returnDate: returnDateStr,
          returnedBy: currentUser.username,
        };
      }
      return t;
    });

    const updatedItems = items.map((item) => {
      if (item.id === targetTrx.itemId) {
        return {
          ...item,
          borrowedCount: newBorrowed,
          availableCount: newAvailable,
          updatedAt: now,
        };
      }
      return item;
    });

    setTransactions(updatedTransactions);
    saveStoredTransactions(updatedTransactions);
    setItems(updatedItems);
    saveStoredItems(updatedItems);

    await addLog(
      'Pengembalian Barang',
      `Pengembalian ${targetTrx.quantity} unit ${targetTrx.itemName} (${targetTrx.itemCode}) dari ${targetTrx.borrowerName} selesai. Diproses oleh ${currentUser.username}.`
    );

    return { success: true };
  };

  const addStaffUser = async (data: {
    username: string;
    password: string;
    name: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat menambahkan pengguna.' };
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanUsername || !data.password || !cleanName) {
      return { success: false, message: 'Semua kolom pengguna wajib diisi.' };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username ${cleanUsername} telah digunakan.` };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      password: data.password,
      name: cleanName,
      role: 'STAFF',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('users').insert([
          {
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            name: newUser.name,
            role: newUser.role,
            is_active: true,
            created_at: newUser.createdAt,
          },
        ]);

        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal membuat akun di Supabase: ${err.message}` };
      }
    }

    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
    await addLog('Tambah Akun Staff', `Menambahkan akun staf: ${newUser.username} (${newUser.name})`);
    return { success: true };
  };

  const updateUser = async (
    id: string,
    updates: Partial<Pick<User, 'name' | 'password' | 'isActive'>>
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat memperbarui pengguna.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const patch: any = {};
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.password) patch.password = updates.password;
    if (updates.isActive !== undefined) patch.is_active = updates.isActive;

    if (isSupabaseConfigured && supabase && Object.keys(patch).length > 0) {
      try {
        const { error } = await supabase.from('users').update(patch).eq('id', id);
        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal memperbarui di Supabase: ${err.message}` };
      }
    }

    const updatedUsers = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          name: updates.name !== undefined ? updates.name.trim() : u.name,
          password: updates.password ? updates.password : u.password,
          isActive: updates.isActive !== undefined ? updates.isActive : u.isActive,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    await addLog('Ubah Pengguna', `Memperbarui akun: ${targetUser.username}`);
    return { success: true };
  };

  const toggleUserStatus = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat mengubah status akun.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    if (targetUser.role === 'ADMIN') {
      return { success: false, message: 'Akun Administrator tidak dapat dinonaktifkan.' };
    }

    const newStatus = !targetUser.isActive;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('users').update({ is_active: newStatus }).eq('id', id);
        if (error) {
          return { success: false, message: `Galat Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, message: `Gagal memperbarui status di Supabase: ${err.message}` };
      }
    }

    const updatedUsers = users.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u));

    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    await addLog(
      'Status Akun Diubah',
      `Akun ${targetUser.username} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`
    );
    return { success: true };
  };

  const resetAllData = () => {
    resetToDefaultData();
    setItems(getStoredItems());
    setTransactions(getStoredTransactions());
    setUsers(getStoredUsers());
    setLogs(getStoredLogs());
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        transactions,
        users,
        logs,
        isCloudConnected: isSupabaseConfigured,
        addItem,
        updateItem,
        deleteItem,
        borrowItem,
        returnItem,
        addStaffUser,
        updateUser,
        toggleUserStatus,
        resetAllData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory harus digunakan di dalam InventoryProvider');
  }
  return context;
};
