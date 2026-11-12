import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { ReturnIcon, CheckIcon } from './Icons';
import { Transaction } from '../types';

export const ReturnManager: React.FC = () => {
  const { transactions, returnItem } = useInventory();
  const { currentUser } = useAuth();

  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const activeLoans = transactions.filter((t) => t.status === 'DIPINJAM');
  const completedLoans = transactions.filter((t) => t.status === 'SELESAI');

  const handleProcessReturn = async () => {
    if (!selectedTrx) return;

    const res = await returnItem(selectedTrx.id);
    if (res.success) {
      setSuccessMsg(
        `Pengembalian ${selectedTrx.quantity} unit ${selectedTrx.itemName} oleh ${selectedTrx.borrowerName} berhasil dicatat.`
      );
      setSelectedTrx(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proses Pengembalian Peralatan</h1>
          <p className="page-subtitle">
            Pemeriksaan dan pengembalian unit alat laboratorium yang sedang dipinjam.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert-box alert-success mb-4" role="alert">
          <CheckIcon size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card-box mb-6">
        <div className="card-box-header">
          <div>
            <h2 className="card-box-title">Daftar Peminjaman Aktif (Perlu Dikembalikan)</h2>
            <p className="card-box-subtitle">
              Terdapat <strong>{activeLoans.length}</strong> transaksi peminjaman yang belum selesai
            </p>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="empty-state">
            <CheckIcon size={44} className="empty-icon text-success" />
            <p className="empty-text">Semua peminjaman telah dikembalikan.</p>
            <span className="empty-sub">Tidak ada peralatan yang tertunggak saat ini.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Nama Peminjam</th>
                  <th scope="col">Kode & Nama Perlengkapan</th>
                  <th scope="col" className="text-center">Jumlah</th>
                  <th scope="col">Tanggal Pinjam</th>
                  <th scope="col">Petugas Peminjam</th>
                  <th scope="col" className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((trx) => (
                  <tr key={trx.id}>
                    <td>
                      <span className="font-semibold text-dark">{trx.borrowerName}</span>
                      {trx.notes && <span className="text-notes">{trx.notes}</span>}
                    </td>
                    <td>
                      <span className="code-pill font-mono">{trx.itemCode}</span> {trx.itemName}
                    </td>
                    <td className="text-center font-bold text-dark">{trx.quantity} unit</td>
                    <td>{trx.borrowDate}</td>
                    <td className="text-muted">{trx.processedBy}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => setSelectedTrx(trx)}
                        aria-label={`Proses pengembalian untuk ${trx.borrowerName}`}
                      >
                        <ReturnIcon size={16} />
                        <span>Proses Pengembalian</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-box">
        <div className="card-box-header">
          <div>
            <h2 className="card-box-title">Riwayat Pengembalian Selesai</h2>
            <p className="card-box-subtitle">
              Peralatan yang telah berhasil dikembalikan ke rak laboratorium
            </p>
          </div>
        </div>

        {completedLoans.length === 0 ? (
          <div className="empty-state">
            <ReturnIcon size={40} className="empty-icon" />
            <p className="empty-text">Belum ada riwayat pengembalian.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Peminjam</th>
                  <th scope="col">Barang</th>
                  <th scope="col" className="text-center">Jumlah</th>
                  <th scope="col">Tgl Pinjam</th>
                  <th scope="col">Tgl Kembali</th>
                  <th scope="col">Diterima Oleh</th>
                  <th scope="col" className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedLoans.map((trx) => (
                  <tr key={trx.id}>
                    <td className="font-medium">{trx.borrowerName}</td>
                    <td>
                      <span className="code-pill font-mono">{trx.itemCode}</span> {trx.itemName}
                    </td>
                    <td className="text-center">{trx.quantity} unit</td>
                    <td>{trx.borrowDate}</td>
                    <td>
                      <span className="font-medium text-success">{trx.returnDate || '-'}</span>
                    </td>
                    <td>{trx.returnedBy || '-'}</td>
                    <td className="text-center">
                      <span className="status-badge status-completed">Selesai</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTrx && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
          <div className="modal-card">
            <h2 id="return-modal-title" className="modal-title">Konfirmasi Pengembalian Barang</h2>
            <p className="modal-desc">
              Pastikan peralatan yang dikembalikan dalam kondisi baik dan lengkap sesuai jumlah yang dipinjam.
            </p>

            <div className="summary-box">
              <div className="summary-row">
                <span className="summary-label">Nama Peminjam:</span>
                <span className="summary-value font-semibold">{selectedTrx.borrowerName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Perlengkapan:</span>
                <span className="summary-value">[{selectedTrx.itemCode}] {selectedTrx.itemName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Jumlah Unit:</span>
                <span className="summary-value font-bold text-dark">{selectedTrx.quantity} unit</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tanggal Peminjaman:</span>
                <span className="summary-value">{selectedTrx.borrowDate}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Petugas Penerima:</span>
                <span className="summary-value">{currentUser?.name} ({currentUser?.username})</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedTrx(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleProcessReturn}
              >
                <CheckIcon size={18} />
                <span>Konfirmasi Barang Diterima</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

