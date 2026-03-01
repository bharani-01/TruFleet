-- ============================================================
-- TruFleet Migration 005 — Drivers, Maintenance & Documents
-- ============================================================
-- Depends on: 001_initial.sql, 003_identity_management.sql
-- Safe to re-run (IF NOT EXISTS throughout)

-- ── 1. drivers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT    NOT NULL,
    email                   TEXT,
    phone                   TEXT,
    license_number          TEXT    NOT NULL UNIQUE,
    license_type            TEXT    NOT NULL DEFAULT 'LMV-TR'
                                    CHECK (license_type IN ('LMV','LMV-TR','HMV','HGMV','HMVT','PSV')),
    license_expiry          DATE    NOT NULL,
    date_of_birth           DATE,
    blood_group             TEXT,
    address                 TEXT,
    experience_years        INTEGER DEFAULT 0,
    status                  TEXT    NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active','inactive','suspended','on_leave')),
    photo_url               TEXT,
    emergency_contact_name  TEXT,
    emergency_contact_phone TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_status  ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_expiry  ON drivers(license_expiry);

-- ── 2. driver_assignments ────────────────────────────────────
-- Tracks which driver is assigned to which vehicle over time.
-- At most ONE current assignment per vehicle enforced via partial unique index.
CREATE TABLE IF NOT EXISTS driver_assignments (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id      UUID    NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    vehicle_id     TEXT    NOT NULL,
    assigned_from  DATE    NOT NULL DEFAULT CURRENT_DATE,
    assigned_until DATE,
    is_current     BOOLEAN NOT NULL DEFAULT TRUE,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_da_driver  ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_da_vehicle ON driver_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_da_current ON driver_assignments(vehicle_id, is_current);

CREATE UNIQUE INDEX IF NOT EXISTS idx_da_one_current
    ON driver_assignments(vehicle_id)
    WHERE is_current = TRUE;

-- ── 3. maintenance_records ───────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_records (
    id                UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        TEXT       NOT NULL,
    maintenance_type  TEXT       NOT NULL DEFAULT 'routine'
                                 CHECK (maintenance_type IN (
                                     'routine','repair','inspection',
                                     'breakdown','tyre','battery','other')),
    description       TEXT       NOT NULL,
    service_date      DATE       NOT NULL DEFAULT CURRENT_DATE,
    next_service_date DATE,
    current_km        INTEGER,
    next_service_km   INTEGER,
    vendor_name       TEXT,
    vendor_phone      TEXT,
    cost              NUMERIC(12,2) DEFAULT 0,
    status            TEXT       NOT NULL DEFAULT 'scheduled'
                                 CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maint_status  ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maint_date    ON maintenance_records(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_maint_next    ON maintenance_records(next_service_date);

-- ── 4. vehicle_documents ────────────────────────────────────
-- RC, PUC, Fitness Certificate, Permits — all with expiry tracking
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id   TEXT  NOT NULL,
    doc_type     TEXT  NOT NULL
                       CHECK (doc_type IN (
                           'rc','puc','fitness','permit_national',
                           'permit_state','road_tax','other')),
    doc_number   TEXT,
    issued_by    TEXT,
    issued_date  DATE,
    expiry_date  DATE,
    document_url TEXT,
    status       TEXT  NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','expired','cancelled')),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vdoc_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vdoc_type    ON vehicle_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_vdoc_expiry  ON vehicle_documents(expiry_date);

-- ── 5. Auto-update triggers ──────────────────────────────────
-- Reuses update_updated_at() created in migration 003.

DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
CREATE TRIGGER trg_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_maint_updated_at ON maintenance_records;
CREATE TRIGGER trg_maint_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_vdoc_updated_at ON vehicle_documents;
CREATE TRIGGER trg_vdoc_updated_at
    BEFORE UPDATE ON vehicle_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Helper: auto-expire documents past expiry_date ────────
-- Schedule this SQL (or equivalent JS) to run daily:
-- UPDATE vehicle_documents
--   SET status = 'expired', updated_at = NOW()
--   WHERE status = 'active' AND expiry_date < CURRENT_DATE;

-- ── Verification ─────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('drivers','driver_assignments','maintenance_records','vehicle_documents');
