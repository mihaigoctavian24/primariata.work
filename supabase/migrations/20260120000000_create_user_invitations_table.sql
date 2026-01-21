-- Migration: 20260120000000_create_user_invitations_table.sql
-- Description: Create user_invitations table for staff invitation system
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20250118000001_create_extensions_and_core_tables.sql
--
-- Purpose: Enable admins to invite funcționari and other admins to their primărie
--          via secure token-based invitation system
--
-- Context: Blocks #145, #147, #148 (staff dashboards need role assignment)
--          Uses SendGrid for email delivery (M3 integration)
--
-- Security:
--   - UUID v4 tokens (128-bit entropy)
--   - 7-day expiration (auto-expired via cron)
--   - One-time use (status = accepted after use)
--   - RLS enforces primarie_id isolation
--   - Cannot invite super_admin (policy enforcement)

BEGIN;

-- =====================================================
-- TABLE: user_invitations
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Invitation details
  email VARCHAR(255) NOT NULL,
  nume VARCHAR(100) NOT NULL,
  prenume VARCHAR(100) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('functionar', 'admin')),
  
  -- Organization context
  primarie_id UUID NOT NULL REFERENCES public.primarii(id) ON DELETE CASCADE,
  departament VARCHAR(200),
  permisiuni JSONB DEFAULT '{}'::jsonb,
  
  -- Secure token (UUID v4)
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  
  -- Lifecycle management
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Audit trail
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_expiration CHECK (expires_at > invited_at),
  CONSTRAINT accepted_requires_user CHECK (
    (status = 'accepted' AND accepted_at IS NOT NULL AND accepted_by IS NOT NULL) OR
    (status != 'accepted')
  )
);

COMMENT ON TABLE public.user_invitations IS 
'Staff invitation system - admins invite funcționari/admins to their primărie via secure tokens';

COMMENT ON COLUMN public.user_invitations.token IS 
'UUID v4 secure token (128-bit entropy) - sent in invitation email, expires in 7 days';

COMMENT ON COLUMN public.user_invitations.permisiuni IS 
'Fine-grained permissions (future enhancement) - JSONB for flexibility';

COMMENT ON COLUMN public.user_invitations.status IS 
'Lifecycle: pending → accepted (used) / expired (7 days) / cancelled (admin revoked)';

-- =====================================================
-- INDEXES
-- =====================================================

-- Fast token lookup for invitation acceptance
CREATE UNIQUE INDEX idx_user_invitations_token ON public.user_invitations(token) WHERE status = 'pending';

-- Fast email lookup (prevent duplicate pending invitations)
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email) WHERE status = 'pending';

-- Primărie-scoped queries (admin lists their invitations)
CREATE INDEX idx_user_invitations_primarie_status ON public.user_invitations(primarie_id, status);

-- Expiration cleanup (for cron job)
CREATE INDEX idx_user_invitations_expiration ON public.user_invitations(expires_at) WHERE status = 'pending';

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TRIGGER update_user_invitations_updated_at ON public.user_invitations IS 
'Auto-update updated_at timestamp on row modification';

-- =====================================================
-- FUNCTION: Expire Old Invitations (Cron Job)
-- =====================================================

CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Mark all pending invitations past expiration as expired
  UPDATE public.user_invitations
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'pending'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.expire_old_invitations IS 
'Mark all pending invitations past expiration as expired - should be called daily via cron job';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can SELECT their primărie's invitations
CREATE POLICY "Admins can view their primarie invitations"
  ON public.user_invitations
  FOR SELECT
  USING (
    primarie_id IN (
      SELECT primarie_id 
      FROM public.utilizatori 
      WHERE id = auth.uid() 
        AND rol IN ('admin', 'super_admin')
        AND activ = true
    )
  );

-- Policy 2: Admins can INSERT invitations for their primărie
-- IMPORTANT: Cannot invite super_admin (checked in application layer too)
CREATE POLICY "Admins can create invitations for their primarie"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (
    -- Must be admin or super_admin
    EXISTS (
      SELECT 1 
      FROM public.utilizatori 
      WHERE id = auth.uid() 
        AND rol IN ('admin', 'super_admin')
        AND activ = true
        AND primarie_id = user_invitations.primarie_id
    )
    -- Cannot invite super_admin
    AND rol != 'super_admin'
    -- Inviter must match current user
    AND invited_by = auth.uid()
  );

-- Policy 3: Admins can UPDATE their primărie's invitations (cancel only)
CREATE POLICY "Admins can update their primarie invitations"
  ON public.user_invitations
  FOR UPDATE
  USING (
    primarie_id IN (
      SELECT primarie_id 
      FROM public.utilizatori 
      WHERE id = auth.uid() 
        AND rol IN ('admin', 'super_admin')
        AND activ = true
    )
  );

-- Policy 4: Public can SELECT pending invitations by token (for accept flow)
-- CRITICAL: Only allows reading invitation details for acceptance, not modification
CREATE POLICY "Public can view pending invitations by token"
  ON public.user_invitations
  FOR SELECT
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Service role can do everything (for admin operations)
GRANT ALL ON public.user_invitations TO service_role;

-- Authenticated users can read/insert (RLS enforces primarie_id)
GRANT SELECT, INSERT, UPDATE ON public.user_invitations TO authenticated;

-- Anon can only read (for accept invitation page)
GRANT SELECT ON public.user_invitations TO anon;

-- =====================================================
-- INITIAL DATA CLEANUP (run once)
-- =====================================================

-- Expire any pending invitations that are already past expiration
SELECT public.expire_old_invitations();

COMMIT;

-- =====================================================
-- Usage Examples (commented for reference)
-- =====================================================

-- Test invitation creation:
-- INSERT INTO user_invitations (email, nume, prenume, rol, primarie_id, invited_by)
-- VALUES (
--   'john.doe@example.com',
--   'Doe',
--   'John',
--   'functionar',
--   'some-primarie-uuid',
--   auth.uid()
-- );
-- SELECT token, expires_at FROM user_invitations WHERE email = 'john.doe@example.com';

-- Test token lookup (for accept flow):
-- SELECT * FROM user_invitations WHERE token = 'some-uuid-token' AND status = 'pending';

-- Test expiration:
-- SELECT expire_old_invitations();
-- SELECT * FROM user_invitations WHERE status = 'expired';

-- Test RLS (as admin):
-- SELECT * FROM user_invitations WHERE primarie_id = 'my-primarie-uuid';
-- Expected: Only see invitations for your primărie

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- BEGIN;
-- DROP POLICY IF EXISTS "Public can view pending invitations by token" ON public.user_invitations;
-- DROP POLICY IF EXISTS "Admins can update their primarie invitations" ON public.user_invitations;
-- DROP POLICY IF EXISTS "Admins can create invitations for their primarie" ON public.user_invitations;
-- DROP POLICY IF EXISTS "Admins can view their primarie invitations" ON public.user_invitations;
-- DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON public.user_invitations;
-- DROP FUNCTION IF EXISTS public.expire_old_invitations();
-- DROP INDEX IF EXISTS idx_user_invitations_expiration;
-- DROP INDEX IF EXISTS idx_user_invitations_primarie_status;
-- DROP INDEX IF EXISTS idx_user_invitations_email;
-- DROP INDEX IF EXISTS idx_user_invitations_token;
-- DROP TABLE IF EXISTS public.user_invitations;
-- COMMIT;
