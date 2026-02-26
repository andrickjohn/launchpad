import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * Validation schema for prospect creation
 */
const prospectSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  campaign_id: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['new', 'contacted', 'responded', 'converted', 'not_interested']).default('new'),
})

/**
 * POST /api/prospects
 * Create a new prospect
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
    const validated = prospectSchema.parse(body)

    // Clean empty strings to null
    const prospectData = {
      ...validated,
      campaign_id: validated.campaign_id || null,
      linkedin_url: validated.linkedin_url || null,
      website: validated.website || null,
      user_id: user.id,
    }

    // Insert prospect
    const { data, error } = await supabase
      .from('prospects')
      .insert(prospectData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      actor_id: user.id,
      activity_type: 'prospect_added',
      entity_type: 'prospects',
      entity_id: data.id,
      description: `Added prospect: ${data.name || data.email}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating prospect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/prospects
 * Get all prospects for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('prospects')
      .select('*, campaign:campaigns(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
