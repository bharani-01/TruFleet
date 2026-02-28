-- ============================================================================
-- TruFleet — Owner & Insurance Identity Management
-- Migration: 003_identity_management.sql
--
-- Run at: https://supabase.com/dashboard/project/fpofjkyszynfciskilot/sql
-- ============================================================================

-- ── 1. owners ─────────────────────────────────────────────────────────────
-- Stores identity of every vehicle owner (individual or company)
CREATE TABLE IF NOT EXISTS owners (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        UNIQUE,
  phone          TEXT,
  company        TEXT,
  license_number TEXT,
  license_type   TEXT        NOT NULL DEFAULT 'individual'  CHECK (license_type IN ('individual','company')),
  address        TEXT,
  kyc_status     TEXT        NOT NULL DEFAULT 'pending'     CHECK (kyc_status IN ('pending','verified','rejected')),
  kyc_note       TEXT,                                      -- reason for rejection / verifier note
  active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owners_kyc    ON owners(kyc_status);
CREATE INDEX IF NOT EXISTS idx_owners_active ON owners(active);

-- ── 2. insurance_policies ──────────────────────────────────────────────────
-- One vehicle can have many policies over time; at most one 'active' at once
CREATE TABLE IF NOT EXISTS insurance_policies (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id     TEXT        NOT NULL,                       -- FK → vehicles.id (reg number)
  provider       TEXT        NOT NULL,
  policy_number  TEXT        NOT NULL UNIQUE,
  policy_type    TEXT        NOT NULL DEFAULT 'comprehensive'
                               CHECK (policy_type IN ('comprehensive','third_party','commercial')),
  premium_amount NUMERIC(12,2),
  valid_from     DATE        NOT NULL,
  valid_until    DATE        NOT NULL,
  nominee        TEXT,
  status         TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','expired','cancelled','suspended','superseded')),
  document_url   TEXT,                                      -- Supabase Storage URL
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS idx_insurance_vehicle ON insurance_policies(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_insurance_status  ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_expiry  ON insurance_policies(valid_until);

-- ── 3. vehicle_ownership ──────────────────────────────────────────────────
-- Tracks full history of ownership; is_current = TRUE for the active owner
CREATE TABLE IF NOT EXISTS vehicle_ownership (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      TEXT        NOT NULL,                     -- FK → vehicles.id
  owner_id        UUID        NOT NULL REFERENCES owners(id) ON DELETE RESTRICT,
  ownership_type  TEXT        NOT NULL DEFAULT 'registered'
                                CHECK (ownership_type IN ('registered','hypothecated','leased','inherited')),
  from_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  to_date         DATE,                                     -- NULL = still current owner
  is_current      BOOLEAN     NOT NULL DEFAULT TRUE,
  transfer_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ownership_vehicle   ON vehicle_ownership(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_ownership_owner     ON vehicle_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_ownership_current   ON vehicle_ownership(vehicle_id, is_current);

-- ── 4. Constraint: only ONE current ownership per vehicle ──────────────────
-- Enforced at application level in server/routes/owners.js (ownership/assign)
-- For extra DB-level safety, create a partial unique index:
CREATE UNIQUE INDEX IF NOT EXISTS idx_ownership_one_current
  ON vehicle_ownership(vehicle_id)
  WHERE is_current = TRUE;

-- ── 5. Row-Level Security (optional — enable if you use Supabase Auth) ────
-- ALTER TABLE owners             ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicle_ownership  ENABLE ROW LEVEL SECURITY;

-- ── 6. Auto-update updated_at via trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_owners_updated_at ON owners;
CREATE TRIGGER trg_owners_updated_at
  BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_insurance_updated_at ON insurance_policies;
CREATE TRIGGER trg_insurance_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 7. Seed: auto-expire policies past their valid_until date ─────────────
-- You can run this as a scheduled Supabase DB function, or call it from the
-- Node.js scheduler. Provided here as a reference SQL snippet.
-- UPDATE insurance_policies
--   SET status = 'expired', updated_at = NOW()
--   WHERE status = 'active' AND valid_until < CURRENT_DATE;

-- ============================================================================
-- VERIFICATION QUERIES — run after migration to confirm tables exist
-- ============================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('owners','insurance_policies','vehicle_ownership');
