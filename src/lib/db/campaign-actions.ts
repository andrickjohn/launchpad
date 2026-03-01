import { createClient } from '@/lib/supabase/server'
import type { CampaignAction, CampaignActionStats } from '@/lib/types/database'

/**
 * Campaign actions stored inside campaigns.launch_brief.generated_actions (JSONB).
 */

async function getBrief(campaignId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('launch_brief')
    .eq('id', campaignId)
    .single()

  if (error || !data) return null
  return data.launch_brief as Record<string, unknown> | null
}

export async function getActionsByCampaign(campaignId: string): Promise<CampaignAction[]> {
  const brief = await getBrief(campaignId)
  if (!brief?.generated_actions) return []

  const actions = brief.generated_actions as CampaignAction[]
  return actions.sort((a, b) => a.day - b.day || a.sort_order - b.sort_order)
}

export async function getActionsByDay(campaignId: string, day: number): Promise<CampaignAction[]> {
  const all = await getActionsByCampaign(campaignId)
  return all.filter(a => a.day === day)
}

export async function getActionStats(campaignId: string): Promise<CampaignActionStats> {
  const brief = await getBrief(campaignId)
  if (!brief?.generated_actions) {
    return { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, skipped: 0 }
  }

  const actions = brief.generated_actions as CampaignAction[]
  return {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    approved: actions.filter(a => a.status === 'approved').length,
    rejected: actions.filter(a => a.status === 'rejected').length,
    completed: actions.filter(a => a.status === 'completed').length,
    skipped: actions.filter(a => a.status === 'skipped').length,
  }
}
