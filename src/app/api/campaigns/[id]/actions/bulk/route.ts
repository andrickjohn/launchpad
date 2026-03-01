import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'

export async function POST(
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

    const { action_ids, status } = await request.json()

    if (!action_ids?.length || !status) {
      return NextResponse.json({ error: 'action_ids and status are required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'skipped']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status` }, { status: 400 })
    }

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
    const idsSet = new Set(action_ids)
    const now = new Date().toISOString()

    let updated = 0
    for (const action of actions) {
      if (idsSet.has(action.id as string)) {
        action.status = status
        action.updated_at = now
        updated++
      }
    }

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ launch_brief: { ...brief, generated_actions: actions } })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Error in actions bulk:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
