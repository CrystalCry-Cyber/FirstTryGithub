import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ClockIcon, SearchIcon } from './Icons';

export const HistoryViewer: React.FC = () => {
  const { logs } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat & Log Audit Aktivitas</h1>
          <p className="page-subtitle">
            Catatan kronologis seluruh interaksi pengguna terhadap inventaris dan transaksi laboratorium.
          </p>
        </div>
      </div>

      <div className="card-box">
        <div className="card-box-header">
          <div>
            <h2 className="card-box-title">Log Sistem Terverifikasi</h2>
            <p className="card-box-subtitle">Total: {logs.length} catatan tercatat</p>
          </div>

          <div className="search-input-wrapper" style={{ maxWidth: '320px' }}>
            <label htmlFor="log-search" className="sr-only">Cari catatan log</label>
            <SearchIcon size={18} className="search-icon" />
            <input
              id="log-search"
              type="text"
              className="input-text search-input"
              placeholder="Cari aktivitas, rincian, atau petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <ClockIcon size={40} className="empty-icon" />
            <p className="empty-text">Tidak ada log aktivitas yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '180px' }}>Waktu & Tanggal</th>
                  <th scope="col" style={{ width: '180px' }}>Jenis Tindakan</th>
                  <th scope="col">Rincian Perubahan</th>
                  <th scope="col" style={{ width: '140px' }}>Pelaku</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const d = new Date(log.timestamp);
                  return (
                    <tr key={log.id}>
                      <td className="text-muted text-sm font-mono">
                        {d.toLocaleDateString('id-ID')}{' '}
                        {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td>
                        <span className="font-semibold text-dark">{log.action}</span>
                      </td>
                      <td>{log.details}</td>
                      <td>
                        <span className="code-pill font-mono">{log.actor}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

