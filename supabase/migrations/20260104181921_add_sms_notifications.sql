-- =====================================================
-- Migration: Add SMS Notifications Support
-- =====================================================
-- Created: 2026-01-04
-- Purpose: Add SMS preferences and rate limiting for Twilio integration
-- =====================================================

-- Add SMS preferences columns to utilizatori table
ALTER TABLE utilizatori
ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telefon VARCHAR(20);

COMMENT ON COLUMN utilizatori.sms_notifications_enabled IS 'User preference for SMS notifications (default: disabled)';
COMMENT ON COLUMN utilizatori.telefon IS 'User phone number for SMS notifications (format: +40723456789)';

-- Create SMS logs table for rate limiting and audit trail
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES utilizatori(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    twilio_sid VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_created ON sms_logs(user_id, created_at DESC);

-- Add comments
COMMENT ON TABLE sms_logs IS 'Audit trail and rate limiting for SMS notifications sent via Twilio';
COMMENT ON COLUMN sms_logs.id IS 'Unique identifier for SMS log entry';
COMMENT ON COLUMN sms_logs.user_id IS 'User who received the SMS';
COMMENT ON COLUMN sms_logs.phone_number IS 'Phone number where SMS was sent';
COMMENT ON COLUMN sms_logs.message_type IS 'Type of SMS: cerere_submitted, status_changed, cerere_finalizata';
COMMENT ON COLUMN sms_logs.success IS 'Whether SMS was sent successfully';
COMMENT ON COLUMN sms_logs.twilio_sid IS 'Twilio message SID (unique identifier from Twilio)';
COMMENT ON COLUMN sms_logs.error_message IS 'Error message if SMS failed';
COMMENT ON COLUMN sms_logs.created_at IS 'When SMS was sent (for rate limiting)';

-- RLS Policies for sms_logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own SMS logs
CREATE POLICY "Users can view own SMS logs"
ON sms_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only service role can insert SMS logs (backend operation)
CREATE POLICY "Service role can insert SMS logs"
ON sms_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add validation constraint for phone number format
ALTER TABLE utilizatori
ADD CONSTRAINT telefon_format_check CHECK (
    telefon IS NULL OR telefon ~ '^\+[1-9]\d{1,14}$'
);

COMMENT ON CONSTRAINT telefon_format_check ON utilizatori IS 'Validate phone number format (E.164: +40723456789)';

-- Grant permissions
GRANT SELECT ON sms_logs TO authenticated;
GRANT ALL ON sms_logs TO service_role;
