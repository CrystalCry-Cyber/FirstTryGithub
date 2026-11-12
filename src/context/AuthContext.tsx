import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredSession, getStoredUsers, saveStoredSession, getInitialUsers } from '../storage';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { getEnvAuthConfig } from '../config/authConfig';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  resetAllAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sinkronkan akun .env ke Supabase jika terhubung
  const syncEnvAccountsToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const initialUsers = getInitialUsers();
    try {
      for (const u of initialUsers) {
        await supabase
          .from('users')
          .upsert(
            {
              id: u.id,
              username: u.username,
              password: u.password,
              name: u.name,
              role: u.role,
              is_active: u.isActive,
            },
            { onConflict: 'id' }
          );
      }
    } catch (err) {
      console.warn('Gagal sinkron akun .env ke Supabase:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const saved = getStoredSession();
      const envConfig = getEnvAuthConfig();

      await syncEnvAccountsToSupabase();

      if (saved) {
        // Jika akun yang tersimpan adalah Admin atau Staff, sesuaikan dengan .env
        if (saved.role === 'ADMIN') {
          const freshAdmin: User = {
            ...saved,
            username: envConfig.admin.username,
            password: envConfig.admin.password,
            name: envConfig.admin.name,
          };
          setCurrentUser(freshAdmin);
          saveStoredSession(freshAdmin);
        } else if (saved.role === 'STAFF' && saved.id === 'usr_staff') {
          const freshStaff: User = {
            ...saved,
            username: envConfig.staff.username,
            password: envConfig.staff.password,
            name: envConfig.staff.name,
          };
          setCurrentUser(freshStaff);
          saveStoredSession(freshStaff);
        } else {
          setCurrentUser(saved);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    const envConfig = getEnvAuthConfig();

    // 1. Cek langsung dengan kredensial master dari .env
    if (cleanUsername === envConfig.admin.username && password === envConfig.admin.password) {
      const adminUser: User = {
        id: 'usr_admin',
        username: envConfig.admin.username,
        password: envConfig.admin.password,
        name: envConfig.admin.name,
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-01-15T08:00:00.000Z',
      };
      setCurrentUser(adminUser);
      saveStoredSession(adminUser);
      return { success: true };
    }

    if (cleanUsername === envConfig.staff.username && password === envConfig.staff.password) {
      const staffUser: User = {
        id: 'usr_staff',
        username: envConfig.staff.username,
        password: envConfig.staff.password,
        name: envConfig.staff.name,
        role: 'STAFF',
        isActive: true,
        createdAt: '2026-02-01T08:30:00.000Z',
      };
      setCurrentUser(staffUser);
      saveStoredSession(staffUser);
      return { success: true };
    }

    // 2. Cek akun tambahan dari Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('username', cleanUsername)
          .eq('password', password)
          .maybeSingle();

        if (!error && data) {
          if (!data.is_active) {
            return {
              success: false,
              message: 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator Lab.',
            };
          }

          const user: User = {
            id: data.id,
            username: data.username,
            password: data.password,
            name: data.name,
            role: data.role,
            isActive: data.is_active,
            createdAt: data.created_at,
          };

          setCurrentUser(user);
          saveStoredSession(user);
          return { success: true };
        }
      } catch {
        // Fallback ke penyimpanan lokal
      }
    }

    // 3. Cek dari penyimpanan lokal
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (!user) {
      return {
        success: false,
        message: 'Username atau password tidak sesuai. Silakan periksa kembali.',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator Lab.',
      };
    }

    setCurrentUser(user);
    saveStoredSession(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    saveStoredSession(null);
  };

  const resetAllAccounts = async () => {
    // Reset akun lokal ke akun dari .env
    const initialUsers = getInitialUsers();
    saveStoredSession(null);
    localStorage.setItem('simlab_users', JSON.stringify(initialUsers));
    setCurrentUser(null);

    // Reset akun Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').delete().neq('id', 'placeholder');
        for (const u of initialUsers) {
          await supabase.from('users').insert([
            {
              id: u.id,
              username: u.username,
              password: u.password,
              name: u.name,
              role: u.role,
              is_active: u.isActive,
              created_at: u.createdAt,
            },
          ]);
        }
      } catch (err) {
        console.warn('Gagal reset tabel users di Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, resetAllAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
