import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { BorrowingManager } from './components/BorrowingManager';
import { ReturnManager } from './components/ReturnManager';
import { UserManager } from './components/UserManager';
import { HistoryViewer } from './components/HistoryViewer';
import { LoginPage } from './components/LoginPage';

const MainLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p className="loading-text">Memuat sistem laboratorium...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content" id="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'items' && <InventoryManager />}
        {activeTab === 'borrow' && <BorrowingManager />}
        {activeTab === 'return' && <ReturnManager />}
        {activeTab === 'users' && (isAdmin ? <UserManager /> : <Dashboard setActiveTab={setActiveTab} />)}
        {activeTab === 'history' && (isAdmin ? <HistoryViewer /> : <Dashboard setActiveTab={setActiveTab} />)}
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            Laboratory Inventory & Borrowing Management System (SIM-LAB) &copy; 2026.
          </p>
          <p className="footer-subtext">
            Praktikum Pemrograman Platform Khusus. Akses pengguna aktif: <strong>{currentUser.username}</strong> ({currentUser.role}).
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <InventoryProvider>
        <MainLayout />
      </InventoryProvider>
    </AuthProvider>
  );
};

export default App;

