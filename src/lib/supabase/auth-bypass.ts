/**
 * DEVELOPMENT ONLY: Auth bypass utilities
 * These functions allow skipping authentication checks when DISABLE_AUTH=true
 * NEVER use these in production!
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// Cache the dev user ID so we only look it up once per process
let cachedDevUserId: string | null = null

/**
 * Gets or creates a real dev user in Supabase auth.users.
 * This is needed because campaigns.user_id has a FK constraint to auth.users.
 * A fake UUID would violate that constraint.
 */
async function getOrCreateDevUser(supabase: SupabaseClient): Promise<string> {
  if (cachedDevUserId) return cachedDevUserId

  // Try to find an existing user
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1 })
  if (existingUsers?.users?.length) {
    cachedDevUserId = existingUsers.users[0].id
    return cachedDevUserId
  }

  // No users exist — create a dev user
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: 'dev@localhost.test',
    email_confirm: true,
  })

  if (error || !newUser.user) {
    // Last resort fallback
    console.error('Failed to create dev user:', error)
    cachedDevUserId = '00000000-0000-0000-0000-000000000000'
    return cachedDevUserId
  }

  cachedDevUserId = newUser.user.id
  return cachedDevUserId
}

/**
 * Gets the current user or returns a dev user if auth is disabled.
 * In dev mode, uses a REAL user from auth.users to satisfy FK constraints.
 */
export async function getAuthUser(supabase: SupabaseClient) {
  if (process.env.DISABLE_AUTH === 'true') {
    const userId = await getOrCreateDevUser(supabase)
    return {
      data: {
        user: {
          id: userId,
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

  return await supabase.auth.getUser()
}

/**
 * Check if auth is disabled (development only)
 */
export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === 'true'
}
