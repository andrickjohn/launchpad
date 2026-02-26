import { createClient } from '@/lib/supabase/server'
import type { Campaign } from '@/lib/types/database'

/**
 * Database operations for campaigns
 * All queries use Row Level Security (RLS) - users can only access their own data
 */

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }

  return data || []
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching campaign:', error)
    return null
  }

  return data
}

export async function createCampaign(
  campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Campaign> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      ...campaign,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    throw error
  }

  return data
}

export async function updateCampaign(
  id: string,
  updates: Partial<Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Campaign> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    throw error
  }

  return data
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting campaign:', error)
    throw error
  }
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active campaigns:', error)
    throw error
  }

  return data || []
}
