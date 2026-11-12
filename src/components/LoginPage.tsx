import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BoxIcon } from './Icons';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');

    if (!username.trim() || !password) {
      setErrorNotice('Silakan masukkan username dan password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(username, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorNotice(res.message || 'Gagal masuk ke sistem.');
    }
  };

  return (
    <div className="login-wrapper">
      <main className="login-card">
        <header className="login-header">
          <div className="login-logo-circle" aria-hidden="true">
            <BoxIcon size={32} />
          </div>
          <h1 className="login-title">SIM-LAB</h1>
          <p className="login-subtitle">
            Sistem Informasi Manajemen Inventaris & Peminjaman Laboratorium Komputer
          </p>
        </header>

        {errorNotice && (
          <div className="alert-box alert-error mb-4" role="alert">
            {errorNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              className="input-text"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              className="input-text"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg">
            {isSubmitting ? 'Memeriksa Akses...' : 'Masuk ke Sistem'}
          </button>
        </form>
      </main>
    </div>
  );
};
