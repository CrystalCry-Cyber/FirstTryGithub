import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, EditIcon, CheckIcon } from './Icons';
import { User } from '../types';

export const UserManager: React.FC = () => {
  const { users, addStaffUser, updateUser, toggleUserStatus } = useInventory();
  const { currentUser } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="alert-box alert-error">
          Akses Ditolak: Anda tidak memiliki izin untuk mengelola akun pengguna.
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormName('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormPassword('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessNotice('');

    if (editingUser) {
      const res = await updateUser(editingUser.id, {
        name: formName,
        password: formPassword || undefined,
      });

      if (!res.success) {
        setFormError(res.message || 'Gagal mengubah data staf.');
        return;
      }

      setSuccessNotice(`Data akun ${editingUser.username} berhasil diperbarui.`);
    } else {
      const res = await addStaffUser({
        username: formUsername,
        password: formPassword,
        name: formName,
      });

      if (!res.success) {
        setFormError(res.message || 'Gagal menambahkan staf baru.');
        return;
      }

      setSuccessNotice(`Akun staf baru ${formUsername} berhasil dibuat.`);
    }

    setIsAddModalOpen(false);
  };

  const handleToggle = async (user: User) => {
    setSuccessNotice('');
    const res = await toggleUserStatus(user.id);
    if (!res.success) {
      alert(res.message);
    } else {
      setSuccessNotice(`Status akun ${user.username} berhasil diubah.`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Akun Petugas Laboratorium</h1>
          <p className="page-subtitle">
            Kelola hak akses pengguna, tambah akun staf operasional, atau nonaktifkan akun yang tidak aktif.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenAdd}
        >
          <PlusIcon size={18} />
          <span>Tambah Akun Staf</span>
        </button>
      </div>

      {successNotice && (
        <div className="alert-box alert-success mb-4" role="alert">
          <CheckIcon size={18} />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="card-box">
        <div className="card-box-header">
          <div>
            <h2 className="card-box-title">Daftar Pengguna Sistem</h2>
            <p className="card-box-subtitle">Total: {users.length} akun terdaftar</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Nama Lengkap</th>
                <th scope="col">Username</th>
                <th scope="col">Role Akses</th>
                <th scope="col" className="text-center">Status Akun</th>
                <th scope="col">Tanggal Dibuat</th>
                <th scope="col" className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold text-dark">{user.name}</td>
                  <td>
                    <span className="code-pill font-mono">{user.username}</span>
                  </td>
                  <td>
                    <span className={`role-pill role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      className={`status-badge ${
                        user.isActive ? 'status-available' : 'status-unavailable'
                      }`}
                    >
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="text-right">
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn-action-edit"
                        onClick={() => handleOpenEdit(user)}
                        title="Ubah data pengguna"
                      >
                        <EditIcon size={16} />
                        <span>Ubah</span>
                      </button>

                      {user.role !== 'ADMIN' && (
                        <button
                          type="button"
                          className={user.isActive ? 'btn-action-danger' : 'btn-action-success'}
                          onClick={() => handleToggle(user)}
                          title={user.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                        >
                          <span>{user.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="modal-card">
            <h2 id="user-modal-title" className="modal-title">
              {editingUser ? `Ubah Data Staf: ${editingUser.username}` : 'Tambah Akun Staf Baru'}
            </h2>
            <p className="modal-desc">
              Akun dengan role Staff dapat mencatat peminjaman dan pengembalian barang laboratorium.
            </p>

            {formError && (
              <div className="alert-box alert-error mb-4" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group">
                <label htmlFor="user-name" className="form-label">Nama Lengkap Petugas</label>
                <input
                  id="user-name"
                  type="text"
                  required
                  className="input-text"
                  placeholder="Contoh: Muhammad Akbar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-username" className="form-label">Username</label>
                <input
                  id="user-username"
                  type="text"
                  required
                  disabled={!!editingUser}
                  className="input-text"
                  placeholder="Contoh: akbar"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                />
                {editingUser && (
                  <span className="form-helper">Username tidak dapat diubah setelah dibuat.</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="user-password" className="form-label">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Masuk'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  required={!editingUser}
                  className="input-text"
                  placeholder="Minimal 6 karakter"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
