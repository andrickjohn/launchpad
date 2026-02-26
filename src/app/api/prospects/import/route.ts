import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * Validation schema for bulk prospect import
 */
const prospectSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

const importSchema = z.object({
  prospects: z.array(prospectSchema),
  campaign_id: z.string().uuid().optional(),
})

/**
 * POST /api/prospects/import
 * Bulk import prospects from CSV
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = importSchema.parse(body)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Import prospects one by one (could be optimized with batch insert)
    for (const prospect of validated.prospects) {
      try {
        const prospectData = {
          ...prospect,
          user_id: user.id,
          campaign_id: validated.campaign_id || null,
          linkedin_url: prospect.linkedin_url || null,
          website: prospect.website || null,
          status: 'new' as const,
        }

        const { error } = await supabase.from('prospects').insert(prospectData)

        if (error) {
          results.failed++
          results.errors.push(`${prospect.email}: ${error.message}`)
        } else {
          results.success++
        }
      } catch (err) {
        results.failed++
        results.errors.push(
          `${prospect.email}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }

    // Log activity
    if (results.success > 0) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        actor_id: user.id,
        activity_type: 'prospect_added',
        entity_type: 'prospects',
        entity_id: user.id, // Using user ID as we don't have a single prospect ID
        description: `Imported ${results.success} prospects from CSV`,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error importing prospects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
