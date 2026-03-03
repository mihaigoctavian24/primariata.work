-- Migration: Fix user_primarii RLS infinite recursion
-- Dependencies: 20260302000001_create_user_primarii_and_rewrite_rls.sql
--
-- Problem: The user_primarii_admin_all RLS policy used a subquery on user_primarii
-- itself, causing PostgreSQL infinite recursion when any query touched user_primarii.
--
-- Fix: Extract admin/super_admin checks into SECURITY DEFINER functions that bypass
-- RLS internally, breaking the recursive cycle.

-- 1. Create SECURITY DEFINER helper to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin_of_primarie(p_primarie_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.primarie_id = p_primarie_id
      AND up.status = 'approved'
      AND up.rol IN ('admin', 'primar')
  );
$function$;

-- 2. Create SECURITY DEFINER helper for super_admin check
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.rol = 'super_admin'
      AND up.status = 'approved'
  );
$function$;

-- 3. Drop and recreate the admin RLS policy using the new helper function
DROP POLICY IF EXISTS user_primarii_admin_all ON public.user_primarii;
CREATE POLICY user_primarii_admin_all ON public.user_primarii
  FOR ALL
  USING (is_admin_of_primarie(primarie_id));

-- 4. Drop and recreate the super_admin RLS policy using the new helper function
DROP POLICY IF EXISTS user_primarii_super_admin ON public.user_primarii;
CREATE POLICY user_primarii_super_admin ON public.user_primarii
  FOR ALL
  USING (is_super_admin());
