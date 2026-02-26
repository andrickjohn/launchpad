import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/outreach
 * Creates a new outreach message (draft, scheduled, or sent)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prospect_id, channel, status, subject, body: messageBody, scheduled_at } = body

    if (!prospect_id || !channel || !messageBody) {
      return NextResponse.json(
        { error: 'prospect_id, channel, and body are required' },
        { status: 400 }
      )
    }

    const { data: outreach, error } = await supabase
      .from('outreach')
      .insert({
        user_id: user.id,
        prospect_id,
        channel,
        status: status || 'draft',
        subject,
        body: messageBody,
        scheduled_at,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating outreach:', error)
      return NextResponse.json({ error: 'Failed to create outreach' }, { status: 500 })
    }

    return NextResponse.json({ success: true, outreach })
  } catch (error) {
    console.error('Error in outreach POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
