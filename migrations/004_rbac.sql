-- ============================================================
-- TruFleet Migration 004 — Role-Based Access Control (RBAC)
-- ============================================================
-- Run this against your Supabase database (SQL Editor or CLI).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING.

-- ── 1. Add role column to users table ───────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer';

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 2. Enforce valid role values ────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_valid_role' AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_valid_role
            CHECK (role IN (
                'super_admin',
                'admin',
                'fleet_manager',
                'dispatcher',
                'insurance_agent',
                'owner',
                'viewer'
            ));
    END IF;
END$$;

-- ── 3. Seed: upgrade any null/empty role to 'admin' ─────────
UPDATE users
SET role = 'admin'
WHERE role IS NULL OR role = '' OR role = 'viewer';

-- ── 4. Optional: role_audit_log table ───────────────────────
CREATE TABLE IF NOT EXISTS role_audit_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_role    TEXT,
    new_role    TEXT        NOT NULL,
    changed_by  TEXT        NOT NULL,   -- email of admin performing the change
    reason      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_audit_target  ON role_audit_log(target_user);
CREATE INDEX IF NOT EXISTS idx_role_audit_created ON role_audit_log(created_at DESC);

-- ── 5. updated_at auto-trigger ───────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Done ─────────────────────────────────────────────────────
-- Roles available: super_admin, admin, fleet_manager,
--                  dispatcher, insurance_agent, owner, viewer
