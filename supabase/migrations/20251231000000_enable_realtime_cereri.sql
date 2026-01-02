-- =====================================================
-- MIGRATION: Enable Realtime for Cereri Table
-- =====================================================
-- Purpose: Enable Supabase Realtime subscriptions for cereri status updates
-- Date: 2025-12-31
-- Author: ATLAS
-- Issue: #75 - Real-Time Notificații pentru Cerere Status Updates
-- =====================================================

-- Enable Realtime for cereri table
-- REPLICA IDENTITY FULL ensures all columns are included in change events
ALTER TABLE cereri REPLICA IDENTITY FULL;

-- Enable Realtime for notificari table (for notification badge updates)
ALTER TABLE notificari REPLICA IDENTITY FULL;

-- Comments
COMMENT ON TABLE cereri IS 'Cereri de documente - Realtime enabled for status updates';
COMMENT ON TABLE notificari IS 'Multi-channel notifications - Realtime enabled for badge updates';
