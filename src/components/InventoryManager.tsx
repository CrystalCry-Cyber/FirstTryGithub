import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, BoxIcon } from './Icons';

export const InventoryManager: React.FC = () => {
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Laptop');
  const [formStock, setFormStock] = useState<number>(5);
  const [errorMessage, setErrorMessage] = useState('');

  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['ALL', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, categoryFilter]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormCode(`BR00${items.length + 1}`);
    setFormName('');
    setFormCategory('Aksesoris');
    setFormStock(5);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormStock(item.stock);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (editingItem) {
      const res = await updateItem(editingItem.id, {
        name: formName,
        category: formCategory,
        stock: formStock,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal mengubah data barang.');
        return;
      }
    } else {
      const res = await addItem({
        code: formCode,
        name: formName,
        category: formCategory,
        stock: formStock,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal menambahkan barang.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const res = await deleteItem(itemToDelete.id);
    if (!res.success) {
      alert(res.message);
    }
    setItemToDelete(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Inventaris Laboratorium</h1>
          <p className="page-subtitle">
            Daftar seluruh perlengkapan, spesifikasi kategori, dan ketersediaan stok peralatan.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddModal}
          >
            <PlusIcon size={18} />
            <span>Tambah Barang Baru</span>
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <label htmlFor="search-item" className="sr-only">Cari barang laboratorium</label>
          <SearchIcon size={18} className="search-icon" />
          <input
            id="search-item"
            type="text"
            className="input-text search-input"
            placeholder="Cari berdasarkan kode, nama, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <label htmlFor="category-filter" className="filter-label">Kategori:</label>
          <select
            id="category-filter"
            className="select-box"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-box">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon size={44} className="empty-icon" />
            <p className="empty-text">Tidak ditemukan barang yang sesuai dengan kriteria pencarian.</p>
            <span className="empty-sub">Coba ubah kata kunci atau ganti filter kategori.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Kode</th>
                  <th scope="col">Nama Barang</th>
                  <th scope="col">Kategori</th>
                  <th scope="col" className="text-center">Total Stok</th>
                  <th scope="col" className="text-center">Tersedia</th>
                  <th scope="col" className="text-center">Dipinjam</th>
                  <th scope="col" className="text-center">Status</th>
                  {isAdmin && <th scope="col" className="text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isAvailable = item.availableCount > 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="code-pill font-mono">{item.code}</span>
                      </td>
                      <td className="font-medium text-dark">{item.name}</td>
                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>
                      <td className="text-center font-semibold">{item.stock} unit</td>
                      <td className="text-center">
                        <span className={`stock-count ${isAvailable ? 'text-success' : 'text-danger'}`}>
                          {item.availableCount} unit
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="stock-count text-muted">
                          {item.borrowedCount} unit
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`status-badge ${
                            isAvailable ? 'status-available' : 'status-unavailable'
                          }`}
                        >
                          {isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="text-right">
                          <div className="action-row">
                            <button
                              type="button"
                              className="btn-action-edit"
                              aria-label={`Ubah barang ${item.name}`}
                              title="Ubah data barang"
                              onClick={() => openEditModal(item)}
                            >
                              <EditIcon size={16} />
                              <span>Ubah</span>
                            </button>
                            <button
                              type="button"
                              className="btn-action-delete"
                              aria-label={`Hapus barang ${item.name}`}
                              title="Hapus data barang"
                              onClick={() => setItemToDelete(item)}
                            >
                              <TrashIcon size={16} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
          <div className="modal-card">
            <h2 id="item-modal-title" className="modal-title">
              {editingItem ? 'Ubah Informasi Barang' : 'Tambah Barang Baru'}
            </h2>
            <p className="modal-desc">
              Lengkapi formulir di bawah ini dengan informasi akurat mengenai perlengkapan laboratorium.
            </p>

            {errorMessage && (
              <div className="alert-box alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group">
                <label htmlFor="form-code" className="form-label">Kode Barang</label>
                <input
                  id="form-code"
                  type="text"
                  required
                  disabled={!!editingItem}
                  className="input-text"
                  placeholder="Contoh: BR011"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
                {editingItem && (
                  <span className="form-helper">Kode barang tidak dapat diubah setelah dibuat.</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="form-name" className="form-label">Nama Perlengkapan</label>
                <input
                  id="form-name"
                  type="text"
                  required
                  className="input-text"
                  placeholder="Contoh: Laptop Dell XPS 15"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="form-category" className="form-label">Kategori</label>
                  <input
                    id="form-category"
                    type="text"
                    required
                    className="input-text"
                    placeholder="Contoh: Laptop, Aksesoris, Jaringan"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="form-stock" className="form-label">Jumlah Total Stok</label>
                  <input
                    id="form-stock"
                    type="number"
                    min="1"
                    required
                    className="input-text"
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-item-title">
          <div className="modal-card">
            <h2 id="delete-item-title" className="modal-title">Konfirmasi Hapus Barang</h2>
            <p className="modal-desc">
              Apakah Anda yakin ingin menghapus <strong>{itemToDelete.name} ({itemToDelete.code})</strong> dari basis data inventaris laboratorium?
            </p>
            {itemToDelete.borrowedCount > 0 && (
              <div className="alert-box alert-warning">
                Perhatian: Terdapat {itemToDelete.borrowedCount} unit yang saat ini sedang dipinjam. Barang tidak dapat dihapus sebelum seluruh unit dikembalikan.
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setItemToDelete(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={itemToDelete.borrowedCount > 0}
                onClick={handleDelete}
              >
                Hapus Barang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

