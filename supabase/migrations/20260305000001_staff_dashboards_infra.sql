-- ============================================================================
-- Phase 5 Plan 01: Staff Dashboards Infrastructure
-- ============================================================================
-- This migration provides the database foundation for staff dashboards:
-- 1. Fix notifications table Realtime publication (REPLICA IDENTITY FULL)
-- 2. Add AFTER INSERT trigger on cereri for NOT-01 (new cerere notification)
-- 3. Refine notify_cerere_status_change() for NOT-02 (selective staff notifications)
-- 4. Add primarii UPDATE RLS policy for admin/primar role
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FIX NOTIFICATIONS TABLE REALTIME PUBLICATION
-- ============================================================================
-- The notifications table (from dashboard_revamp_tables migration) was never
-- added to supabase_realtime publication. This causes NotificationDropdown
-- Realtime subscription to silently miss INSERT events. The bell badge does
-- not update in real-time without this.

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication (idempotent: will error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'notifications already in supabase_realtime publication';
END $$;

-- ============================================================================
-- 2. AFTER INSERT TRIGGER ON cereri FOR NOT-01 (new cerere submission)
-- ============================================================================
-- NOT-01: When a citizen submits a new cerere (status = 'depusa'), notify
-- all functionari and admin users at the same primarie. This is an INSERT
-- trigger because new cereri start as 'depusa' directly (no draft->depusa
-- UPDATE path triggers the existing notify_cerere_status_change).

CREATE OR REPLACE FUNCTION public.notify_new_cerere()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_staff_user RECORD;
  v_action_url TEXT;
BEGIN
  -- Build the action URL for the cerere
  v_action_url := '/cereri/' || NEW.id;

  -- Notify all approved functionari and admin at this primarie
  -- Exclude the submitting user (solicitant_id) from notifications
  BEGIN
    FOR v_staff_user IN
      SELECT user_id
      FROM public.user_primarii
      WHERE primarie_id = NEW.primarie_id
        AND status = 'approved'
        AND rol IN ('functionar', 'admin')
        AND user_id != NEW.solicitant_id
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
        'action_required',
        'normal',
        'Cerere noua depusa',
        format('O noua cerere a fost depusa: #%s', NEW.numar_inregistrare),
        v_action_url,
        'Vezi Cererea',
        NOW() + INTERVAL '30 days'
      );
    END LOOP;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create new cerere notifications for cerere %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_new_cerere IS
  'NOT-01: Notify all functionari and admin when a new cerere is submitted (INSERT with status=depusa)';

-- Create trigger: fires AFTER INSERT on cereri only when status is 'depusa'
CREATE TRIGGER trg_notify_new_cerere
  AFTER INSERT ON public.cereri
  FOR EACH ROW
  WHEN (NEW.status = 'depusa')
  EXECUTE FUNCTION public.notify_new_cerere();

-- ============================================================================
-- 3. REFINE notify_cerere_status_change() FOR NOT-02
-- ============================================================================
-- Replace the existing function to make staff notifications selective:
-- - Citizen resubmit (info_suplimentare -> in_verificare): notify functionari + admin
-- - Cerere needs approval (any -> in_aprobare): notify primar only
-- - All other status changes: notify citizen only (no generic staff loop)
-- Citizen notification logic is preserved exactly from the Phase 4 version.

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
    -- SELECTIVE STAFF NOTIFICATIONS (NOT-02)
    -- ============================================================
    -- Only notify staff for key action-required transitions.
    -- Replaces the generic all-staff loop from Phase 4.

    -- Case 1: Citizen resubmitted documents (info_suplimentare -> in_verificare)
    -- Notify all functionari and admin so they can re-review
    IF NEW.status = 'in_verificare' AND OLD.status = 'info_suplimentare' THEN
      BEGIN
        FOR v_staff_user IN
          SELECT user_id
          FROM public.user_primarii
          WHERE primarie_id = NEW.primarie_id
            AND status = 'approved'
            AND rol IN ('functionar', 'admin')
            AND user_id != auth.uid()
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
            'action_required',
            'normal',
            'Documente retrimise',
            format('Cetateanul a retrimis documente pentru cererea #%s', NEW.numar_inregistrare),
            v_action_url,
            'Vezi Cererea',
            NOW() + INTERVAL '30 days'
          );
        END LOOP;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Failed to create resubmit staff notifications for cerere %: %', NEW.id, SQLERRM;
      END;

    -- Case 2: Cerere needs primar approval (any -> in_aprobare)
    -- Notify only primar users
    ELSIF NEW.status = 'in_aprobare' THEN
      BEGIN
        FOR v_staff_user IN
          SELECT user_id
          FROM public.user_primarii
          WHERE primarie_id = NEW.primarie_id
            AND status = 'approved'
            AND rol = 'primar'
            AND user_id != auth.uid()
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
            'action_required',
            'high',
            'Cerere necesita aprobare',
            format('Cererea #%s necesita aprobarea dvs.', NEW.numar_inregistrare),
            v_action_url,
            'Vezi Cererea',
            NOW() + INTERVAL '30 days'
          );
        END LOOP;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Failed to create approval staff notifications for cerere %: %', NEW.id, SQLERRM;
      END;
    END IF;

    -- All other status changes: citizen is notified (above) but NO generic
    -- staff notification. This prevents notification fatigue for staff.

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
  'Create notifications for citizens on all status changes, and selective staff notifications for key action-required transitions (NOT-02)';

-- ============================================================================
-- 4. ADD primarii UPDATE RLS POLICY FOR ADMIN/PRIMAR ROLE
-- ============================================================================
-- Allows admin and primar users to update their primarie's info (email, phone,
-- address, working hours, config). Required for DASH-08 admin settings.

CREATE POLICY primarii_admin_update ON public.primarii
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = primarii.id
        AND up.status = 'approved'
        AND up.rol IN ('admin', 'primar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = primarii.id
        AND up.status = 'approved'
        AND up.rol IN ('admin', 'primar')
    )
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

COMMIT;
