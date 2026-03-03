-- ============================================================================
-- Phase 4 Plan 01: Cerere Istoric & Workflow Engine Migration
-- ============================================================================
-- This migration implements the cereri processing lifecycle engine:
-- 1. Add in_aprobare to cereri status CHECK constraint
-- 2. Add SLA columns to cereri table
-- 3. Alter tipuri_cereri.documente_necesare from TEXT[] to JSONB
-- 4. Create cerere_istoric table
-- 5. Rewrite validate_cerere_status_transition() with full role-based matrix
-- 6. Create record_cerere_status_change() AFTER UPDATE trigger
-- 7. Fix notify_cerere_status_change() column name bugs + staff notifications
-- 8. Auto-set SLA deadline on submit (depusa -> in_verificare)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ADD in_aprobare TO cereri STATUS CHECK CONSTRAINT
-- ============================================================================

-- Find and drop the existing CHECK constraint on cereri.status
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.cereri'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%IN%depusa%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.cereri DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped cereri status CHECK constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No CHECK constraint found on cereri.status -- skipping drop';
  END IF;
END $$;

-- Re-create with in_aprobare included
ALTER TABLE public.cereri ADD CONSTRAINT cereri_status_check CHECK (
  status IN (
    'depusa', 'in_verificare', 'info_suplimentare', 'in_procesare',
    'in_aprobare', 'aprobata', 'respinsa', 'anulata', 'finalizata'
  )
);

-- ============================================================================
-- 2. ADD SLA COLUMNS TO cereri TABLE
-- ============================================================================

ALTER TABLE public.cereri
  ADD COLUMN IF NOT EXISTS sla_paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_total_paused_days NUMERIC(10,2) DEFAULT 0;

-- ============================================================================
-- 3. ALTER tipuri_cereri.documente_necesare FROM TEXT[] TO JSONB
-- ============================================================================

ALTER TABLE public.tipuri_cereri
  ALTER COLUMN documente_necesare TYPE JSONB
  USING CASE
    WHEN documente_necesare IS NULL THEN NULL
    ELSE (
      SELECT jsonb_agg(
        jsonb_build_object(
          'tip', lower(elem),
          'denumire', elem,
          'obligatoriu', true
        )
      )
      FROM unnest(documente_necesare) AS elem
    )
  END;

ALTER TABLE public.tipuri_cereri
  ALTER COLUMN documente_necesare SET DEFAULT '[]'::jsonb;

-- ============================================================================
-- 4. CREATE cerere_istoric TABLE
-- ============================================================================

CREATE TABLE public.cerere_istoric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cerere_id UUID NOT NULL REFERENCES public.cereri(id) ON DELETE CASCADE,
  primarie_id UUID NOT NULL REFERENCES public.primarii(id) ON DELETE CASCADE,
  tip VARCHAR(50) NOT NULL CHECK (tip IN ('status_change', 'nota_interna', 'document_request')),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  motiv TEXT,
  documente_solicitate JSONB,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  vizibil_cetatean BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cerere_istoric_cerere ON public.cerere_istoric(cerere_id, created_at DESC);
CREATE INDEX idx_cerere_istoric_actor ON public.cerere_istoric(actor_id);
CREATE INDEX idx_cerere_istoric_tip ON public.cerere_istoric(tip);

-- Enable RLS
ALTER TABLE public.cerere_istoric ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Citizens can SELECT where vizibil_cetatean = true and they have access to the primarie
CREATE POLICY "Citizens can view visible cerere_istoric entries"
  ON public.cerere_istoric
  FOR SELECT
  USING (
    vizibil_cetatean = true
    AND EXISTS (
      SELECT 1 FROM public.user_primarii
      WHERE user_id = auth.uid()
        AND primarie_id = cerere_istoric.primarie_id
        AND status = 'approved'
    )
  );

-- Staff (functionar, admin, primar) can see ALL entries for their primarie
CREATE POLICY "Staff can view all cerere_istoric entries"
  ON public.cerere_istoric
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_primarii
      WHERE user_id = auth.uid()
        AND primarie_id = cerere_istoric.primarie_id
        AND status = 'approved'
        AND rol IN ('functionar', 'admin', 'primar')
    )
  );

-- Staff can INSERT entries
CREATE POLICY "Staff can insert cerere_istoric entries"
  ON public.cerere_istoric
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_primarii
      WHERE user_id = auth.uid()
        AND primarie_id = cerere_istoric.primarie_id
        AND status = 'approved'
        AND rol IN ('functionar', 'admin', 'primar')
    )
  );

-- Service role can do anything (for triggers)
CREATE POLICY "Service role full access on cerere_istoric"
  ON public.cerere_istoric
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant usage
GRANT SELECT, INSERT ON public.cerere_istoric TO authenticated;
GRANT ALL ON public.cerere_istoric TO service_role;
GRANT SELECT ON public.cerere_istoric TO anon;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.cerere_istoric;

-- ============================================================================
-- 5. REWRITE validate_cerere_status_transition() TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_cerere_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_is_owner BOOLEAN;
  v_valid BOOLEAN := false;
  v_termen_legal_zile INT;
  v_additional_paused NUMERIC;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Determine if user is the cerere owner (citizen)
  v_is_owner := (v_user_id = NEW.solicitant_id);

  -- Get user role for this primarie (if not owner acting as citizen)
  IF NOT v_is_owner THEN
    SELECT rol INTO v_user_role
    FROM public.user_primarii
    WHERE user_id = v_user_id
      AND primarie_id = NEW.primarie_id
      AND status = 'approved'
    LIMIT 1;
  END IF;

  -- If user is the owner, treat as cetatean role regardless of user_primarii role
  IF v_is_owner THEN
    v_user_role := 'cetatean';
  END IF;

  -- Block transitions from terminal states
  IF OLD.status IN ('finalizata', 'anulata', 'respinsa') THEN
    RAISE EXCEPTION 'Cannot change status of % cerere (ID: %)', OLD.status, OLD.id;
  END IF;

  -- ============================================================
  -- FULL TRANSITION MATRIX (from CONTEXT.md)
  -- ============================================================

  -- depusa -> in_verificare (functionar+), anulata (cetatean owner)
  IF OLD.status = 'depusa' THEN
    IF NEW.status = 'in_verificare' AND v_user_role IN ('functionar', 'admin', 'primar') THEN
      v_valid := true;
    ELSIF NEW.status = 'anulata' AND v_user_role = 'cetatean' AND v_is_owner THEN
      v_valid := true;
    END IF;

  -- in_verificare -> info_suplimentare, in_procesare, respinsa (functionar+), anulata (cetatean owner)
  ELSIF OLD.status = 'in_verificare' THEN
    IF NEW.status IN ('info_suplimentare', 'in_procesare', 'respinsa') AND v_user_role IN ('functionar', 'admin', 'primar') THEN
      v_valid := true;
    ELSIF NEW.status = 'anulata' AND v_user_role = 'cetatean' AND v_is_owner THEN
      v_valid := true;
    END IF;

  -- info_suplimentare -> in_verificare (cetatean owner resubmit), anulata (cetatean owner)
  ELSIF OLD.status = 'info_suplimentare' THEN
    IF NEW.status = 'in_verificare' AND v_user_role = 'cetatean' AND v_is_owner THEN
      v_valid := true;
    ELSIF NEW.status = 'anulata' AND v_user_role = 'cetatean' AND v_is_owner THEN
      v_valid := true;
    END IF;

  -- in_procesare -> in_aprobare, respinsa (functionar+), anulata (cetatean owner)
  ELSIF OLD.status = 'in_procesare' THEN
    IF NEW.status IN ('in_aprobare', 'respinsa') AND v_user_role IN ('functionar', 'admin', 'primar') THEN
      v_valid := true;
    ELSIF NEW.status = 'anulata' AND v_user_role = 'cetatean' AND v_is_owner THEN
      v_valid := true;
    END IF;

  -- in_aprobare -> aprobata, respinsa (primar ONLY)
  ELSIF OLD.status = 'in_aprobare' THEN
    IF NEW.status IN ('aprobata', 'respinsa') AND v_user_role = 'primar' THEN
      v_valid := true;
    END IF;

  -- aprobata -> finalizata (any staff: functionar, admin, primar)
  ELSIF OLD.status = 'aprobata' THEN
    IF NEW.status = 'finalizata' AND v_user_role IN ('functionar', 'admin', 'primar') THEN
      v_valid := true;
    END IF;

  END IF;

  -- Reject invalid transitions
  IF NOT v_valid THEN
    RAISE EXCEPTION 'Invalid status transition from % to % for role % (cerere ID: %)',
      OLD.status, NEW.status, COALESCE(v_user_role, 'unknown'), OLD.id;
  END IF;

  -- ============================================================
  -- AUTO-SET data_finalizare ON TERMINAL STATES
  -- ============================================================

  IF NEW.status = 'finalizata' AND OLD.status != 'finalizata' THEN
    NEW.data_finalizare := NOW();
  END IF;

  -- ============================================================
  -- SLA PAUSE: Entering info_suplimentare -> record pause start
  -- ============================================================

  IF NEW.status = 'info_suplimentare' AND OLD.status != 'info_suplimentare' THEN
    NEW.sla_paused_at := NOW();
  END IF;

  -- ============================================================
  -- SLA RESUME: Leaving info_suplimentare -> calculate paused days, extend deadline
  -- ============================================================

  IF OLD.status = 'info_suplimentare' AND NEW.status != 'info_suplimentare' THEN
    IF OLD.sla_paused_at IS NOT NULL THEN
      v_additional_paused := EXTRACT(EPOCH FROM (NOW() - OLD.sla_paused_at)) / 86400.0;
      NEW.sla_total_paused_days := COALESCE(OLD.sla_total_paused_days, 0) + v_additional_paused;
      -- Extend the deadline by the paused duration
      IF OLD.data_termen IS NOT NULL THEN
        NEW.data_termen := OLD.data_termen + make_interval(days := CEIL(v_additional_paused)::int);
      END IF;
    END IF;
    NEW.sla_paused_at := NULL;
  END IF;

  -- ============================================================
  -- AUTO-SET SLA DEADLINE ON SUBMIT (depusa -> in_verificare)
  -- ============================================================

  IF OLD.status = 'depusa' AND NEW.status = 'in_verificare' THEN
    IF NEW.data_termen IS NULL THEN
      SELECT termen_legal_zile INTO v_termen_legal_zile
      FROM public.tipuri_cereri
      WHERE id = NEW.tip_cerere_id;

      IF v_termen_legal_zile IS NOT NULL AND v_termen_legal_zile > 0 THEN
        NEW.data_termen := NOW() + (v_termen_legal_zile * INTERVAL '1 day');
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_cerere_status_transition IS
  'Enforce role-based status transition rules, SLA pause/resume, and auto-set deadlines for cereri workflow';

-- ============================================================================
-- 6. CREATE record_cerere_status_change() AFTER UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_cerere_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.cerere_istoric (
    cerere_id,
    primarie_id,
    tip,
    old_status,
    new_status,
    actor_id,
    vizibil_cetatean
  ) VALUES (
    NEW.id,
    NEW.primarie_id,
    'status_change',
    OLD.status,
    NEW.status,
    auth.uid(),
    true  -- Status changes are always visible to citizens
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't break the main transaction
    RAISE WARNING 'Failed to record cerere status change: %', SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.record_cerere_status_change IS
  'Automatically insert into cerere_istoric on cereri status change';

-- Create the AFTER UPDATE trigger
CREATE TRIGGER trg_record_cerere_status_change
  AFTER UPDATE ON public.cereri
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.record_cerere_status_change();

-- ============================================================================
-- 7. FIX notify_cerere_status_change() TRIGGER FUNCTION
-- ============================================================================
-- Fixes: NEW.numar_cerere -> NEW.numar_inregistrare
--        NEW.utilizator_id -> NEW.solicitant_id
-- Adds: Staff notification for funcționari assigned to the cerere's primarie
-- Uses correct status values: aprobata (not aprobat), respinsa (not respins)

CREATE OR REPLACE FUNCTION public.notify_cerere_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_priority VARCHAR(20);
  v_action_url TEXT;
  v_staff_user RECORD;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- Build the action URL for the cerere
    v_action_url := '/app/' ||
      (SELECT slug FROM public.judete WHERE id = (SELECT judet_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/' ||
      (SELECT slug FROM public.localitati WHERE id = (SELECT localitate_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/cereri/' || NEW.id;

    -- Determine notification content based on new status
    CASE NEW.status
      WHEN 'aprobata' THEN
        notification_title := 'Cerere Aprobata';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' a fost aprobata!';
        notification_priority := 'high';

      WHEN 'respinsa' THEN
        notification_title := 'Cerere Respinsa';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' a fost respinsa. Verificati motivul.';
        notification_priority := 'high';

      WHEN 'in_aprobare' THEN
        notification_title := 'Cerere in Aprobare';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' este in proces de aprobare.';
        notification_priority := 'medium';

      WHEN 'in_verificare' THEN
        notification_title := 'Cerere in Verificare';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' este in verificare tehnica.';
        notification_priority := 'medium';

      WHEN 'info_suplimentare' THEN
        notification_title := 'Informatii Suplimentare Necesare';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' necesita informatii suplimentare.';
        notification_priority := 'high';

      WHEN 'in_procesare' THEN
        notification_title := 'Cerere in Procesare';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' este in curs de procesare.';
        notification_priority := 'medium';

      WHEN 'finalizata' THEN
        notification_title := 'Cerere Finalizata';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' a fost finalizata.';
        notification_priority := 'high';

      WHEN 'anulata' THEN
        notification_title := 'Cerere Anulata';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' a fost anulata.';
        notification_priority := 'medium';

      ELSE
        notification_title := 'Status Actualizat';
        notification_message := 'Cererea dvs. #' || NEW.numar_inregistrare || ' si-a schimbat statusul.';
        notification_priority := 'low';
    END CASE;

    -- ============================================================
    -- CITIZEN NOTIFICATION (to solicitant_id)
    -- ============================================================
    BEGIN
      INSERT INTO public.notifications (
        utilizator_id,
        primarie_id,
        type,
        priority,
        title,
        message,
        action_url,
        action_label,
        expires_at
      ) VALUES (
        NEW.solicitant_id,
        NEW.primarie_id,
        'status_updated',
        notification_priority,
        notification_title,
        notification_message,
        v_action_url,
        'Vezi Cererea',
        NOW() + INTERVAL '30 days'
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create citizen notification for cerere %: %', NEW.id, SQLERRM;
    END;

    -- ============================================================
    -- STAFF NOTIFICATION (to funcționari/admin/primar of this primarie)
    -- ============================================================
    BEGIN
      FOR v_staff_user IN
        SELECT user_id
        FROM public.user_primarii
        WHERE primarie_id = NEW.primarie_id
          AND status = 'approved'
          AND rol IN ('functionar', 'admin', 'primar')
          AND user_id != auth.uid()  -- Don't notify the actor themselves
      LOOP
        INSERT INTO public.notifications (
          utilizator_id,
          primarie_id,
          type,
          priority,
          title,
          message,
          action_url,
          action_label,
          expires_at
        ) VALUES (
          v_staff_user.user_id,
          NEW.primarie_id,
          'status_updated',
          'low',
          'Cerere #' || NEW.numar_inregistrare || ' - Status: ' || NEW.status,
          'Cererea #' || NEW.numar_inregistrare || ' a trecut in starea: ' || NEW.status,
          v_action_url,
          'Vezi Cererea',
          NOW() + INTERVAL '30 days'
        );
      END LOOP;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create staff notifications for cerere %: %', NEW.id, SQLERRM;
    END;

    -- ============================================================
    -- UPDATE progress_data (backward compatibility)
    -- ============================================================
    NEW.progress_data := jsonb_set(
      COALESCE(NEW.progress_data, '{}'::jsonb),
      '{percentage}',
      to_jsonb(public.calculate_cerere_progress(NEW.status))
    );

    NEW.progress_data := jsonb_set(
      NEW.progress_data,
      '{current_step}',
      to_jsonb(NEW.status)
    );

    NEW.progress_data := jsonb_set(
      NEW.progress_data,
      '{last_activity}',
      to_jsonb(NOW())
    );

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_cerere_status_change IS
  'Create notifications for citizens and staff on cerere status changes (fixed column names)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

COMMIT;
