-- Skema Database PostgreSQL untuk SIM-LAB di Supabase

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Items (Inventaris)
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0),
  borrowed_count INTEGER NOT NULL DEFAULT 0 CHECK (borrowed_count >= 0),
  available_count INTEGER NOT NULL CHECK (available_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Transactions (Peminjaman & Pengembalian)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  borrower_name TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  borrow_date DATE NOT NULL,
  return_date DATE,
  status TEXT NOT NULL CHECK (status IN ('DIPINJAM', 'SELESAI')),
  processed_by TEXT NOT NULL,
  returned_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) dengan Kebijakan Publik untuk Anon Key
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON users FOR DELETE USING (true);

CREATE POLICY "Allow public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Allow public insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update items" ON items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete items" ON items FOR DELETE USING (true);

CREATE POLICY "Allow public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete transactions" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow public read activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- Seed Data Awal Pengguna
INSERT INTO users (id, username, password, name, role, is_active)
VALUES
  ('usr_admin', 'admin', 'admin123', 'Administrator Lab', 'ADMIN', true),
  ('usr_staff1', 'staff', 'staff123', 'Budi Santoso', 'STAFF', true),
  ('usr_staff2', 'staff2', 'staff123', 'Siti Rahma', 'STAFF', true)
ON CONFLICT (username) DO NOTHING;

-- Seed Data Awal Inventaris (Sesuai Bagian D)
INSERT INTO items (id, code, name, category, stock, borrowed_count, available_count)
VALUES
  ('itm_001', 'BR001', 'Laptop Lenovo', 'Laptop', 5, 1, 4),
  ('itm_002', 'BR002', 'Mouse Logitech', 'Aksesoris', 10, 2, 8),
  ('itm_003', 'BR003', 'Keyboard Mechanical', 'Aksesoris', 8, 0, 8),
  ('itm_004', 'BR004', 'Proyektor Epson', 'Proyektor', 3, 1, 2),
  ('itm_005', 'BR005', 'Monitor LG', 'Monitor', 6, 0, 6),
  ('itm_006', 'BR006', 'Switch TP-Link 16-Port', 'Jaringan', 4, 0, 4),
  ('itm_007', 'BR007', 'Router Mikrotik RB750', 'Jaringan', 5, 0, 5),
  ('itm_008', 'BR008', 'Kabel HDMI 5M', 'Kabel & Adapter', 12, 1, 11),
  ('itm_009', 'BR009', 'Web Camera Logitech C920', 'Kamera', 4, 0, 4),
  ('itm_010', 'BR010', 'Wireless Presenter Laser', 'Aksesoris', 6, 0, 6)
ON CONFLICT (code) DO NOTHING;

-- Seed Data Transaksi Awal
INSERT INTO transactions (id, borrower_name, item_id, item_code, item_name, quantity, borrow_date, return_date, status, processed_by, notes)
VALUES
  ('trx_001', 'Ahmad Fauzi (Mahasiswa TI)', 'itm_001', 'BR001', 'Laptop Lenovo', 1, '2026-11-10', NULL, 'DIPINJAM', 'staff', 'Praktikum Jaringan Komputer'),
  ('trx_002', 'Dewi Lestari (Dosen Pembimbing)', 'itm_004', 'BR004', 'Proyektor Epson', 1, '2026-11-11', NULL, 'DIPINJAM', 'admin', 'Presentasi Sidang Skripsi Ruang 302'),
  ('trx_003', 'Rian Pratama (Mahasiswa SI)', 'itm_002', 'BR002', 'Mouse Logitech', 2, '2026-11-11', NULL, 'DIPINJAM', 'staff', 'Ujian Pemrograman Web'),
  ('trx_004', 'Kurniawan Eko (Mahasiswa TI)', 'itm_008', 'BR008', 'Kabel HDMI 5M', 1, '2026-11-12', NULL, 'DIPINJAM', 'staff', 'Workshop IoT')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Log Awal
INSERT INTO activity_logs (id, action, actor, details)
VALUES
  ('log_001', 'Inisialisasi Database', 'Sistem', 'Tabel dan data awal inventaris Supabase berhasil dikonfigurasi.')
ON CONFLICT (id) DO NOTHING;

