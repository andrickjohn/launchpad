import { createClient } from '@/lib/supabase/server'
import type { Prospect, ProspectWithCampaign } from '@/lib/types/database'

/**
 * Database operations for prospects
 * All queries use Row Level Security (RLS) - users can only access their own data
 */

export async function getProspects(
  campaignId?: string,
  status?: string,
  sortBy: 'created_at' | 'name' | 'score' = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<ProspectWithCampaign[]> {
  const supabase = await createClient()

  let query = supabase
    .from('prospects')
    .select('*, campaign:campaigns(*)')
    .order(sortBy, { ascending: sortOrder === 'asc' })

  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching prospects:', error)
    throw error
  }

  return data || []
}

export async function getProspect(id: string): Promise<ProspectWithCampaign | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prospects')
    .select('*, campaign:campaigns(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching prospect:', error)
    return null
  }

  return data
}

export async function createProspect(
  prospect: Omit<Prospect, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Prospect> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('prospects')
    .insert({
      ...prospect,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating prospect:', error)
    throw error
  }

  return data
}

export async function updateProspect(
  id: string,
  updates: Partial<Omit<Prospect, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Prospect> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating prospect:', error)
    throw error
  }

  return data
}

export async function deleteProspect(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting prospect:', error)
    throw error
  }
}

export async function getProspectStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count: total } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: newCount } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'new')

  const { count: contactedCount } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'contacted')

  const { count: convertedCount } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'converted')

  return {
    total: total || 0,
    new: newCount || 0,
    contacted: contactedCount || 0,
    converted: convertedCount || 0,
  }
}
