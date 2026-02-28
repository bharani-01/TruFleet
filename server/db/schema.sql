-- ============================================================
-- TruFleet — Supabase Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- ── VEHICLES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id                  TEXT      PRIMARY KEY,         -- License plate, e.g. "TN-45-AB-1234"
  make                TEXT      NOT NULL,
  type                TEXT      NOT NULL,
  vin                 TEXT,
  engine_no           TEXT,
  year                INTEGER,
  owner               TEXT      NOT NULL,
  owner_initials      TEXT,
  owner_color         TEXT      DEFAULT '#3B82F6',
  status              TEXT      NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Blocked')),
  photo               TEXT,                          -- Unsplash or uploaded URL
  insurance_provider  TEXT,
  policy_number       TEXT,
  insurance_expiry    DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── AUDIT LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT      PRIMARY KEY DEFAULT ('EVT_' || extract(epoch FROM NOW())::BIGINT::TEXT),
  type        TEXT      NOT NULL DEFAULT 'SYSTEM'
                CHECK (type IN ('AUTH', 'ADMIN', 'SYSTEM', 'DISPATCH')),
  entity_id   TEXT      NOT NULL,
  description TEXT      NOT NULL,
  status      TEXT      NOT NULL DEFAULT 'SUCCESS',
  detail      TEXT,
  json_data   JSONB,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON audit_logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type      ON audit_logs (type);


-- ── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT      NOT NULL,
  email      TEXT      NOT NULL UNIQUE,
  role       TEXT      NOT NULL DEFAULT 'Fleet Admin'
               CHECK (role IN ('Fleet Admin', 'Dispatcher', 'Truck Owner')),
  company    TEXT,
  initials   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE vehicles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;

-- Allow all operations with the anon/publishable key (for demo)
-- In production, tighten these policies per role.
CREATE POLICY "Allow all on vehicles"   ON vehicles   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users"      ON users      FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- SEED DATA — Run once to populate demo fleet
-- ============================================================
INSERT INTO vehicles (id, make, type, vin, engine_no, year, owner, owner_initials, owner_color, status, photo, insurance_provider, policy_number, insurance_expiry)
VALUES
  ('TN-45-AB-1234', 'Volvo FH16',         'Heavy Commercial', 'MAT-894723-XJ9', 'ENG-84738292', 2023, 'John Doe',      'JD', '#3B82F6', 'Active',  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100', 'TATA AIG',      'POL-TATA-112233',  '2026-11-12'),
  ('KA-05-CD-5678', 'Tata Prima',          'Heavy Commercial', 'TAT-112233-PL0', 'ENG-11223344', 2021, 'Rahul Lal',     'RL', '#F59E0B', 'Active',  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100', 'HDFC ERGO',     'POL-HDFC-772233',  '2026-03-04'),
  ('MH-12-EF-9012', 'Ashok Leyland',       'Light Truck',      'ASH-998877-QQ2', 'ENG-99887766', 2020, 'Sarah Mehta',   'SM', '#EF4444', 'Blocked', 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100', 'ICICI Lombard', 'POL-ICICI-998811', '2026-02-10'),
  ('AP-12-XX-9988', 'Eicher Pro 6031',     'Medium Commercial','EIC-445566-RF3', 'ENG-44556677', 2022, 'Priya Sharma',  'PS', '#10B981', 'Active',  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100', 'Allianz',       'POL-ALLI-445566',  '2026-09-15'),
  ('DL-01-ZZ-3344', 'BharatBenz 2523',     'Heavy Commercial', 'BHB-334455-KK9', 'ENG-33445566', 2023, 'Arjun Verma',   'AV', '#8B5CF6', 'Active',  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100', 'HDFC ERGO',     'POL-HDFC-334455',  '2027-01-20'),
  ('RJ-14-MN-7722', 'Mahindra Blazo',      'Medium Commercial','MAH-772233-TT1', 'ENG-77223311', 2021, 'Meena Gupta',   'MG', '#F97316', 'Active',  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100', 'TATA AIG',      'POL-TATA-772233',  '2026-03-01'),
  ('GJ-05-PQ-5511', 'Volvo FE',            'Light Truck',      'VOL-551122-GG5', 'ENG-55112233', 2022, 'Ravi Joshi',    'RJ', '#0EA5E9', 'Active',  'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100', 'ICICI Lombard', 'POL-ICICI-551122', '2026-08-30'),
  ('TN-33-GH-4321', 'Tata LPT 3118',       'Heavy Commercial', 'TAT-432100-WX7', 'ENG-43210099', 2020, 'David Cruz',    'DC', '#64748B', 'Active',  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100', 'HDFC ERGO',     'POL-HDFC-432100',  '2026-03-05'),
  ('MH-04-TS-9900', 'Scania R450',          'Heavy Commercial', 'SCA-990011-BB3', 'ENG-99001122', 2024, 'Fatima Khan',   'FK', '#EC4899', 'Active',  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100', 'Allianz',       'POL-ALLI-990011',  '2027-06-14'),
  ('KL-07-BB-1100', 'Ashok Leyland U-Truck','Light Truck',      'ASH-110099-ZZ6', 'ENG-11009988', 2019, 'Thomas Roy',    'TR', '#14B8A6', 'Blocked', 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100', 'ICICI Lombard', 'POL-ICICI-110099', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_logs (id, type, entity_id, description, status, detail, json_data, timestamp)
VALUES
  ('TXN_8849202',    'AUTH',   'TN-45-AB-1234', 'Dispatch Authorization Request', 'AUTHORIZED', 'Key Verified',       '{"transaction_id":"TXN_8849202","auth_token":"sha256:a7f...9c2","latency_ms":42,"checks":{"insurance":true,"registration":true}}', '2026-02-28T14:32:05.842Z'),
  ('TXN_8849201',    'AUTH',   'KA-05-CD-5678', 'Dispatch Authorization Request', 'DENIED',     'Insurance Expired',  '{"transaction_id":"TXN_8849201","error_code":"INS_EXP_001","policy_expiry":"2026-02-25","block_action":true}',                   '2026-02-28T14:31:42.110Z'),
  ('CRON_INS_SYNC',  'SYSTEM', 'SYSTEM',        'Automated Insurance Sync',        'COMPLETE',   'Updated 14 records', '{"job_id":"CRON_INS_SYNC","provider":"HDFC_API","records_processed":1250,"records_updated":14}',                               '2026-02-28T14:28:10.005Z'),
  ('EVT_ADMIN_4492', 'ADMIN',  'ADMIN_CO',      'Manual Vehicle Block',            'SUCCESS',    'User Override',      '{"target_id":"MH-12-EF-9012","reason":"Pending investigation","admin_id":"U_4492"}',                                          '2026-02-28T14:15:33.912Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (name, email, role, company, initials)
VALUES ('Chief Officer', 'admin@trufleet.com', 'Fleet Admin', 'TruFleet Operations', 'CO')
ON CONFLICT (email) DO NOTHING;
