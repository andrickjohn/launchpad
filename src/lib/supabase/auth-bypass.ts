/**
 * DEVELOPMENT ONLY: Auth bypass utilities
 * These functions allow skipping authentication checks when DISABLE_AUTH=true
 * NEVER use these in production!
 */

import type { SupabaseClient } from '@supabase/supabase-js'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Gets the current user or returns a fake dev user if auth is disabled
 * Use this instead of supabase.auth.getUser() in API routes
 */
export async function getAuthUser(supabase: SupabaseClient) {
  // In development with DISABLE_AUTH=true, return a fake user
  if (process.env.DISABLE_AUTH === 'true') {
    return {
      data: {
        user: {
          id: DEV_USER_ID,
          email: 'dev@localhost',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    }
  }

  // Normal auth flow
  return await supabase.auth.getUser()
}

/**
 * Check if auth is disabled (development only)
 */
export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === 'true'
}
