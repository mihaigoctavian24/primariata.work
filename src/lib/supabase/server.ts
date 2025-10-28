import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Create a Supabase client for use in Server Components and Server Actions
 *
 * This client is used in:
 * - Server Components (async components without 'use client')
 * - Server Actions (functions marked with 'use server')
 * - Route Handlers (app/api/*)
 *
 * It handles session management through secure HTTP-only cookies.
 *
 * @returns Promise<Typed Supabase client for server usage>
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function MyPage() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('table').select()
 *   return <div>{data}</div>
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server'
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function myAction() {
 *   const supabase = await createClient()
 *   await supabase.from('table').insert({ ... })
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase service role client that bypasses RLS
 *
 * WARNING: This client has admin privileges and bypasses Row Level Security.
 * Only use in secure server-side contexts (API routes, server actions).
 * Never expose this client or service role key to the client side.
 *
 * Use cases:
 * - Public data submission (surveys, contact forms)
 * - Admin operations that need to bypass RLS
 * - Batch operations on behalf of system
 *
 * @returns Typed Supabase client with service role privileges
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
