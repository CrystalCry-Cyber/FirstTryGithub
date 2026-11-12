import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BoxIcon,
  BorrowIcon,
  ReturnIcon,
  UsersIcon,
  ClockIcon,
  LogOutIcon,
  RefreshIcon,
} from './Icons';
import { useInventory } from '../context/InventoryContext';

export type ActiveTab = 'dashboard' | 'items' | 'borrow' | 'return' | 'users' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const { resetAllData, isCloudConnected } = useInventory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <ClockIcon size={18} />,
    },
    {
      id: 'items',
      label: 'Data Barang',
      icon: <BoxIcon size={18} />,
    },
    {
      id: 'borrow',
      label: 'Peminjaman',
      icon: <BorrowIcon size={18} />,
    },
    {
      id: 'return',
      label: 'Pengembalian',
      icon: <ReturnIcon size={18} />,
    },
    {
      id: 'users',
      label: 'Kelola Staf',
      icon: <UsersIcon size={18} />,
      adminOnly: true,
    },
    {
      id: 'history',
      label: 'Riwayat Log',
      icon: <ClockIcon size={18} />,
      adminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-badge" aria-hidden="true">
            <BoxIcon size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SIM-LAB</span>
            <span className="brand-subtitle">Laboratorium Komputer</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>

        <nav
          className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-label="Navigasi Utama"
        >
          <ul className="nav-list">
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    className={`nav-button ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleSelectTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className={`role-pill role-${currentUser.role.toLowerCase()}`}>
                {currentUser.role}
              </span>
              <span className={`db-pill ${isCloudConnected ? 'db-cloud' : 'db-local'}`} title={isCloudConnected ? 'Terhubung ke Database Cloud Supabase' : 'Menggunakan Persistent Local Storage Engine'}>
                {isCloudConnected ? 'Supabase' : 'Local DB'}
              </span>
            </div>

            <div className="action-buttons">
              {isAdmin && (
                <button
                  type="button"
                  className="btn-icon"
                  title="Kembalikan data ke awal (Reset Demo Data)"
                  aria-label="Kembalikan data awal demo"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <RefreshIcon size={18} />
                </button>
              )}

              <button
                type="button"
                className="btn-logout"
                onClick={logout}
                aria-label="Keluar dari akun"
              >
                <LogOutIcon size={18} />
                <span className="logout-text">Keluar</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {showResetConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div className="modal-card">
            <h2 id="reset-title" className="modal-title">Konfirmasi Reset Data</h2>
            <p className="modal-desc">
              Tindakan ini akan mengembalikan seluruh data inventaris, transaksi peminjaman, dan staf ke konfigurasi awal laboratorium. Lanjutkan?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleReset}
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

