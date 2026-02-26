import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/templates
 * Creates a new template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, channel, subject, body: templateBody } = body

    if (!name || !channel || !templateBody) {
      return NextResponse.json(
        { error: 'name, channel, and body are required' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        channel,
        subject,
        body: templateBody,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error in templates POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
