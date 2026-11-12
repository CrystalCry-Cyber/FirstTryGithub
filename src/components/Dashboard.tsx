import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { BoxIcon, BorrowIcon, ReturnIcon, ClockIcon } from './Icons';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { items, transactions, logs } = useInventory();
  const { currentUser } = useAuth();

  const totalItems = items.reduce((acc, curr) => acc + curr.stock, 0);
  const totalBorrowed = items.reduce((acc, curr) => acc + curr.borrowedCount, 0);
  const totalAvailable = items.reduce((acc, curr) => acc + curr.availableCount, 0);
  const totalTransactions = transactions.length;

  const activeLoans = transactions.filter((t) => t.status === 'DIPINJAM');
  const recentLogs = logs.slice(0, 5);

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ringkasan Operasional Laboratorium</h1>
          <p className="page-subtitle">
            Selamat datang, {currentUser?.name}. Akses hak: <strong>{currentUser?.role}</strong>.
          </p>
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveTab('borrow')}
          >
            <BorrowIcon size={18} />
            <span>Catat Peminjaman</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setActiveTab('return')}
          >
            <ReturnIcon size={18} />
            <span>Pengembalian ({activeLoans.length})</span>
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Statistik Inventaris">
        <div className="stat-card">
          <div className="stat-icon-wrapper color-brand">
            <BoxIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Unit Barang</span>
            <span className="stat-value">{totalItems}</span>
            <span className="stat-meta">{items.length} jenis item terdaftar</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper color-success">
            <BoxIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Barang Tersedia</span>
            <span className="stat-value text-success">{totalAvailable}</span>
            <span className="stat-meta">Siap untuk dipinjam</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper color-warning">
            <BorrowIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Barang Dipinjam</span>
            <span className="stat-value text-warning">{totalBorrowed}</span>
            <span className="stat-meta">{activeLoans.length} transaksi aktif</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper color-info">
            <ClockIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Transaksi</span>
            <span className="stat-value">{totalTransactions}</span>
            <span className="stat-meta">Kumulatif seluruh riwayat</span>
          </div>
        </div>
      </section>

      <div className="dashboard-content-split">
        <section className="card-box" aria-labelledby="active-loans-title">
          <div className="card-box-header">
            <div>
              <h2 id="active-loans-title" className="card-box-title">Peminjaman Sedang Berlangsung</h2>
              <p className="card-box-subtitle">Peralatan yang saat ini berada di luar laboratorium</p>
            </div>
            <button
              type="button"
              className="btn-link"
              onClick={() => setActiveTab('return')}
            >
              Lihat Semua
            </button>
          </div>

          {activeLoans.length === 0 ? (
            <div className="empty-state">
              <BoxIcon size={40} className="empty-icon" />
              <p className="empty-text">Saat ini tidak ada peralatan yang sedang dipinjam.</p>
              <span className="empty-sub">Seluruh inventaris laboratorium berada di tempat.</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nama Peminjam</th>
                    <th scope="col">Barang</th>
                    <th scope="col">Jumlah</th>
                    <th scope="col">Tanggal Pinjam</th>
                    <th scope="col">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium">{t.borrowerName}</td>
                      <td>
                        <span className="code-pill">{t.itemCode}</span> {t.itemName}
                      </td>
                      <td>{t.quantity} unit</td>
                      <td>{t.borrowDate}</td>
                      <td>{t.processedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card-box" aria-labelledby="activity-title">
          <div className="card-box-header">
            <div>
              <h2 id="activity-title" className="card-box-title">Aktivitas Terkini</h2>
              <p className="card-box-subtitle">Log operasional peminjaman dan pengelolaan</p>
            </div>
            {isAdmin && (
              <button
                type="button"
                className="btn-link"
                onClick={() => setActiveTab('history')}
              >
                Seluruh Log
              </button>
            )}
          </div>

          {recentLogs.length === 0 ? (
            <div className="empty-state">
              <ClockIcon size={40} className="empty-icon" />
              <p className="empty-text">Belum ada catatan aktivitas sistem.</p>
            </div>
          ) : (
            <ul className="activity-list" aria-label="Daftar aktivitas terbaru">
              {recentLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <li key={log.id} className="activity-item">
                    <div className="activity-indicator" aria-hidden="true" />
                    <div className="activity-body">
                      <div className="activity-meta">
                        <span className="activity-action">{log.action}</span>
                        <span className="activity-time">{formattedDate}, {formattedTime}</span>
                      </div>
                      <p className="activity-details">{log.details}</p>
                      <span className="activity-actor">Oleh: {log.actor}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

