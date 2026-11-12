import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { BorrowIcon, CheckIcon } from './Icons';

export const BorrowingManager: React.FC = () => {
  const { items, transactions, borrowItem } = useInventory();
  const { currentUser } = useAuth();

  const [borrowerName, setBorrowerName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DIPINJAM' | 'SELESAI'>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const availableStock = selectedItem ? selectedItem.availableCount : 0;

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedItemId) {
      setFeedback({ type: 'error', message: 'Silakan pilih barang yang akan dipinjam.' });
      return;
    }

    if (!borrowerName.trim()) {
      setFeedback({ type: 'error', message: 'Nama peminjam wajib diisi.' });
      return;
    }

    if (quantity < 1) {
      setFeedback({ type: 'error', message: 'Jumlah peminjaman minimal 1 unit.' });
      return;
    }

    if (quantity > availableStock) {
      setFeedback({
        type: 'error',
        message: `Jumlah permintaan (${quantity} unit) melebihi stok yang tersedia (${availableStock} unit).`,
      });
      return;
    }

    const res = await borrowItem({
      borrowerName,
      itemId: selectedItemId,
      quantity,
      borrowDate,
      notes,
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Peminjaman untuk ${borrowerName} berhasil dicatat ke dalam sistem.`,
      });
      setBorrowerName('');
      setQuantity(1);
      setNotes('');
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Gagal menyimpan transaksi peminjaman.',
      });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pencatatan Peminjaman Perlengkapan</h1>
          <p className="page-subtitle">
            Formulir operasional untuk mencatat peminjaman alat laboratorium kepada mahasiswa atau dosen.
          </p>
        </div>
      </div>

      <div className="borrow-layout">
        <section className="card-box form-card" aria-labelledby="borrow-form-title">
          <div className="card-box-header">
            <div>
              <h2 id="borrow-form-title" className="card-box-title">Formulir Peminjaman Baru</h2>
              <p className="card-box-subtitle">Petugas pencatat: {currentUser?.username}</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`alert-box ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}
              role="alert"
            >
              {feedback.type === 'success' && <CheckIcon size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleBorrowSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="borrower-name" className="form-label">
                Nama Lengkap Peminjam
              </label>
              <input
                id="borrower-name"
                type="text"
                required
                className="input-text"
                placeholder="Contoh: Rian Hidayat (NIM: 22010101)"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="select-item" className="form-label">
                Pilih Perlengkapan Laboratorium
              </label>
              <select
                id="select-item"
                className="select-box"
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setQuantity(1);
                }}
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code}] {item.name} (Tersedia: {item.availableCount} unit)
                  </option>
                ))}
              </select>
            </div>

            <div className="stock-info-banner">
              <span className="stock-info-title">Status Stok Saat Ini:</span>
              <span className={`stock-info-val ${availableStock > 0 ? 'text-success' : 'text-danger'}`}>
                {availableStock > 0 ? `${availableStock} unit siap dipinjam` : 'Stok habis'}
              </span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="borrow-quantity" className="form-label">
                  Jumlah Unit
                </label>
                <input
                  id="borrow-quantity"
                  type="number"
                  min="1"
                  max={availableStock > 0 ? availableStock : 1}
                  required
                  disabled={availableStock === 0}
                  className="input-text"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="borrow-date" className="form-label">
                  Tanggal Pinjam
                </label>
                <input
                  id="borrow-date"
                  type="date"
                  required
                  className="input-text"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="borrow-notes" className="form-label">
                Keperluan / Keterangan (Opsional)
              </label>
              <textarea
                id="borrow-notes"
                className="textarea-box"
                rows={2}
                placeholder="Contoh: Praktikum Pemrograman Platform Khusus di Lab 2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={availableStock === 0}
              className="btn-primary w-full"
            >
              <BorrowIcon size={18} />
              <span>Simpan Transaksi Peminjaman</span>
            </button>
          </form>
        </section>

        <section className="card-box table-card" aria-labelledby="history-title">
          <div className="card-box-header">
            <div>
              <h2 id="history-title" className="card-box-title">Daftar Transaksi Peminjaman</h2>
              <p className="card-box-subtitle">Total tercatat: {transactions.length} transaksi</p>
            </div>

            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                Semua ({transactions.length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'DIPINJAM' ? 'active' : ''}`}
                onClick={() => setStatusFilter('DIPINJAM')}
              >
                Aktif ({transactions.filter((t) => t.status === 'DIPINJAM').length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'SELESAI' ? 'active' : ''}`}
                onClick={() => setStatusFilter('SELESAI')}
              >
                Selesai ({transactions.filter((t) => t.status === 'SELESAI').length})
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <BorrowIcon size={40} className="empty-icon" />
              <p className="empty-text">Tidak ada data transaksi yang sesuai filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nama Peminjam</th>
                    <th scope="col">Barang</th>
                    <th scope="col" className="text-center">Jumlah</th>
                    <th scope="col">Tgl Pinjam</th>
                    <th scope="col">Status</th>
                    <th scope="col">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.id}>
                      <td>
                        <span className="font-semibold text-dark">{trx.borrowerName}</span>
                        {trx.notes && <span className="text-notes">{trx.notes}</span>}
                      </td>
                      <td>
                        <span className="code-pill font-mono">{trx.itemCode}</span> {trx.itemName}
                      </td>
                      <td className="text-center font-medium">{trx.quantity} unit</td>
                      <td>{trx.borrowDate}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            trx.status === 'DIPINJAM' ? 'status-borrowed' : 'status-completed'
                          }`}
                        >
                          {trx.status === 'DIPINJAM' ? 'Dipinjam' : 'Selesai'}
                        </span>
                      </td>
                      <td className="text-muted">{trx.processedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

