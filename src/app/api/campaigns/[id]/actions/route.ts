import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'

/**
 * GET /api/campaigns/[id]/actions
 * Fetch all actions from campaign's launch_brief.generated_actions
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await getAuthUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('launch_brief')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const brief = campaign.launch_brief as Record<string, unknown> | null
    const actions = (brief?.generated_actions || []) as Array<Record<string, unknown>>

    // Group by day
    const grouped: Record<number, typeof actions> = {}
    for (const action of actions) {
      const day = action.day as number
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(action)
    }

    return NextResponse.json({ success: true, actions, grouped })
  } catch (error) {
    console.error('Error in actions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/campaigns/[id]/actions
 * Update a single action. Body: { action_id, ...updates }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await getAuthUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action_id, ...updates } = body

    if (!action_id) {
      return NextResponse.json({ error: 'action_id is required' }, { status: 400 })
    }

    // Fetch campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('launch_brief')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const brief = campaign.launch_brief as Record<string, unknown>
    const actions = (brief.generated_actions || []) as Array<Record<string, unknown>>

    // Find and update the action
    const actionIndex = actions.findIndex(a => a.id === action_id)
    if (actionIndex === -1) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    if (updates.status !== undefined) actions[actionIndex].status = updates.status
    if (updates.content !== undefined) actions[actionIndex].content = updates.content
    if (updates.title !== undefined) actions[actionIndex].title = updates.title
    actions[actionIndex].updated_at = new Date().toISOString()

    // Save back
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ launch_brief: { ...brief, generated_actions: actions } })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, action: actions[actionIndex] })
  } catch (error) {
    console.error('Error in actions PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
