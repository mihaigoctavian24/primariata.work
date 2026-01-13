-- Dashboard Revamp: Create notifications, user_achievements tables and update cereri
-- Migration created: 2026-01-09

-- ============================================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizator_id UUID NOT NULL REFERENCES public.utilizatori(id) ON DELETE CASCADE,
  primarie_id UUID NOT NULL REFERENCES public.primarii(id) ON DELETE CASCADE,

  -- Notification type and priority
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'payment_due',
    'cerere_approved',
    'cerere_rejected',
    'document_missing',
    'document_uploaded',
    'status_updated',
    'deadline_approaching',
    'action_required',
    'info'
  )),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Actions
  action_url TEXT,
  action_label TEXT,

  -- Status
  dismissed_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_notifications_utilizator ON public.notifications(utilizator_id)
  WHERE dismissed_at IS NULL;

CREATE INDEX idx_notifications_priority ON public.notifications(priority, dismissed_at)
  WHERE dismissed_at IS NULL;

CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

CREATE INDEX idx_notifications_active ON public.notifications(utilizator_id, created_at DESC)
  WHERE dismissed_at IS NULL;

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = utilizator_id);

-- Users can update (dismiss/read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = utilizator_id)
  WITH CHECK (auth.uid() = utilizator_id);

-- System can insert notifications (via service_role)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- System can delete expired notifications
CREATE POLICY "Service role can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (true);

-- Grant permissions
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- ============================================================================
-- 2. UPDATE CERERI TABLE - Add progress_data column
-- ============================================================================
ALTER TABLE public.cereri
ADD COLUMN IF NOT EXISTS progress_data JSONB DEFAULT '{
  "percentage": 0,
  "current_step": "draft",
  "eta_days": null,
  "last_activity": null,
  "timeline": []
}'::jsonb;

-- Create index for progress queries
CREATE INDEX IF NOT EXISTS idx_cereri_progress_percentage
  ON public.cereri((progress_data->>'percentage'));

-- Comment for documentation
COMMENT ON COLUMN public.cereri.progress_data IS
  'Progress tracking data including percentage, current step, ETA, and timeline';

-- ============================================================================
-- 3. CREATE USER_ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizator_id UUID NOT NULL REFERENCES public.utilizatori(id) ON DELETE CASCADE,

  -- Achievement details
  achievement_key VARCHAR(50) NOT NULL CHECK (achievement_key IN (
    'first_cerere',
    'payment_on_time',
    'expert_autorizatii',
    'organized_documents',
    'fast_responder',
    'all_payments_current',
    'power_user',
    'early_adopter'
  )),

  -- Points and progress
  points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Timestamps
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata for additional info
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Unique constraint per user per achievement
  UNIQUE(utilizator_id, achievement_key)
);

-- Indexes
CREATE INDEX idx_user_achievements_utilizator ON public.user_achievements(utilizator_id);
CREATE INDEX idx_user_achievements_points ON public.user_achievements(points DESC);
CREATE INDEX idx_user_achievements_unlocked ON public.user_achievements(unlocked_at DESC);

-- RLS Policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = utilizator_id);

-- System can manage achievements (via service_role)
CREATE POLICY "Service role can manage achievements"
  ON public.user_achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate cerere progress based on status
CREATE OR REPLACE FUNCTION calculate_cerere_progress(cerere_status VARCHAR(20))
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE cerere_status
    WHEN 'draft' THEN 0
    WHEN 'depusa' THEN 25
    WHEN 'in_verificare' THEN 40
    WHEN 'in_asteptare' THEN 50
    WHEN 'in_aprobare' THEN 75
    WHEN 'aprobat' THEN 100
    WHEN 'respins' THEN 100
    WHEN 'anulat' THEN 100
    ELSE 0
  END;
END;
$$;

-- Function to auto-expire old notifications
CREATE OR REPLACE FUNCTION expire_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND dismissed_at IS NULL;
END;
$$;

-- Function to create notification for cerere status change
CREATE OR REPLACE FUNCTION notify_cerere_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_priority VARCHAR(20);
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- Determine notification content based on new status
    CASE NEW.status
      WHEN 'aprobat' THEN
        notification_title := 'Cerere Aprobată';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' a fost aprobată!';
        notification_priority := 'high';

      WHEN 'respins' THEN
        notification_title := 'Cerere Respinsă';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' a fost respinsă. Verificați motivul.';
        notification_priority := 'high';

      WHEN 'in_aprobare' THEN
        notification_title := 'Cerere în Aprobare';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' este în proces de aprobare.';
        notification_priority := 'medium';

      WHEN 'in_verificare' THEN
        notification_title := 'Cerere în Verificare';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' este în verificare tehnică.';
        notification_priority := 'medium';

      ELSE
        -- For other status changes, create info notification
        notification_title := 'Status Actualizat';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' și-a schimbat statusul.';
        notification_priority := 'low';
    END CASE;

    -- Insert notification
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
      NEW.utilizator_id,
      NEW.primarie_id,
      'status_updated',
      notification_priority,
      notification_title,
      notification_message,
      '/app/' || (SELECT slug FROM public.judete WHERE id = (SELECT judet_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/' || (SELECT slug FROM public.localitati WHERE id = (SELECT localitate_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/cereri/' || NEW.id,
      'Vezi Cererea',
      NOW() + INTERVAL '30 days'
    );

    -- Update progress_data
    NEW.progress_data := jsonb_set(
      COALESCE(NEW.progress_data, '{}'::jsonb),
      '{percentage}',
      to_jsonb(calculate_cerere_progress(NEW.status))
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

-- Create trigger for cerere status changes
DROP TRIGGER IF EXISTS trg_cerere_status_notification ON public.cereri;
CREATE TRIGGER trg_cerere_status_notification
  BEFORE UPDATE ON public.cereri
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_cerere_status_change();

-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.notifications IS
  'Smart notifications for users about important events and actions';

COMMENT ON TABLE public.user_achievements IS
  'Gamification achievements and points for user engagement';

COMMENT ON FUNCTION calculate_cerere_progress(VARCHAR) IS
  'Calculate progress percentage based on cerere status';

COMMENT ON FUNCTION expire_old_notifications() IS
  'Helper function to clean up expired notifications';

COMMENT ON FUNCTION notify_cerere_status_change() IS
  'Automatically create notifications when cerere status changes';
