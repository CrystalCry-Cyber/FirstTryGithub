import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BoxIcon } from './Icons';
import { getEnvAuthConfig } from '../config/authConfig';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const envConfig = getEnvAuthConfig();

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

  const handleFillDemo = async (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorNotice('');
    setIsSubmitting(true);
    const res = await login(demoUser, demoPass);
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
              Username Pengguna
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

        <section className="demo-accounts-box" aria-labelledby="demo-accounts-title">
          <h2 id="demo-accounts-title" className="demo-accounts-title">
            Akun Demo Pengujian (Dosen / Penguji)
          </h2>
          <p className="demo-accounts-desc">
            Klik tombol di bawah ini untuk langsung masuk tanpa perlu mengetik manual:
          </p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn-demo btn-demo-admin"
              onClick={() => handleFillDemo(envConfig.admin.username, envConfig.admin.password)}
            >
              <span className="demo-role-badge">ADMIN</span>
              <span className="demo-creds">{envConfig.admin.username} / {envConfig.admin.password}</span>
            </button>

            <button
              type="button"
              className="btn-demo btn-demo-staff"
              onClick={() => handleFillDemo(envConfig.staff.username, envConfig.staff.password)}
            >
              <span className="demo-role-badge">STAFF</span>
              <span className="demo-creds">{envConfig.staff.username} / {envConfig.staff.password}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

