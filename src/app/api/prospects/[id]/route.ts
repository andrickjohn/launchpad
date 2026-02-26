import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/prospects/[id]
 * Delete a prospect
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if prospect exists and belongs to user
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    // Delete the prospect
    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete prospect' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting prospect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/prospects/[id]
 * Update a prospect
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Update prospect
    const { data, error } = await supabase
      .from('prospects')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating prospect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
