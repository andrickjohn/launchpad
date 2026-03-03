'use server'

import { createClient } from '@/lib/supabase/server'
import { Prospect, Outreach, ActivityLog, Campaign } from '@/lib/types/database'

export interface ContactTimelineEvent {
    id: string
    type: 'outreach' | 'activity'
    date: string
    title: string
    description: string
    metadata?: Record<string, unknown> | null
    icon?: string // Optional icon hint for the UI (e.g. 'mail', 'check')
}

export interface CRMContact extends Prospect {
    campaign?: Campaign | null
    lastActivityDate: string | null
    totalOutreachAttempts: number
}

/**
 * Fetches all prospects globally for the CRM view.
 * Includes basic campaign info and aggregates outreach counts.
 */
export async function getCRMContacts(): Promise<CRMContact[]> {
    const supabase = await createClient()

    // For a real production app with millions of rows, this would be a specialized RPC
    // or a view. For the LaunchPad builder scale, we can fetch prospects and related data.
    const { data: prospects, error } = await supabase
        .from('prospects')
        .select(`
      *,
      campaign:campaigns(id, name),
      outreach(id, created_at)
    `)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching CRM contacts:', error)
        return []
    }

    return (prospects || []).map((p) => {
        // calculate simple aggregations
        const relatedOutreach = p.outreach as unknown as Outreach[] | null
        const attemptCount = relatedOutreach ? relatedOutreach.length : 0

        // Find latest outreach date if available
        let lastActivityDate = p.updated_at
        if (relatedOutreach && relatedOutreach.length > 0) {
            const dates = relatedOutreach.map(o => new Date(o.created_at).getTime())
            const maxDate = new Date(Math.max(...dates))
            if (maxDate > new Date(lastActivityDate)) {
                lastActivityDate = maxDate.toISOString()
            }
        }

        // Clean up the object to match Prospect type without the extra join arrays
        const { campaign, ...prospectData } = p

        return {
            ...(prospectData as Prospect),
            campaign: Array.isArray(campaign) ? campaign[0] : campaign,
            totalOutreachAttempts: attemptCount,
            lastActivityDate
        }
    })
}

/**
 * Builds a chronological timeline for a single prospect, interleaving
 * Outreach attempts and system ActivityLogs.
 */
export async function getContactTimeline(prospectId: string): Promise<ContactTimelineEvent[]> {
    const supabase = await createClient()

    // Fetch Outreach
    const { data: outreachData } = await supabase
        .from('outreach')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })

    // Fetch Activity Log expressly tied to this prospect
    const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('entity_type', 'prospect')
        .eq('entity_id', prospectId)
        .order('created_at', { ascending: false })

    const events: ContactTimelineEvent[] = []

    // Format Outreach into timeline events
    if (outreachData) {
        outreachData.forEach((o: Outreach) => {
            events.push({
                id: `outreach-${o.id}`,
                type: 'outreach',
                date: o.created_at,
                title: `Outreach: ${o.channel.charAt(0).toUpperCase() + o.channel.slice(1)}`,
                description: `Status: ${o.status}. ${o.subject ? `Subject: ${o.subject}` : ''}`,
                metadata: { channel: o.channel, status: o.status, body: o.body }
            })
        })
    }

    // Format ActivityLog into timeline events
    if (activityData) {
        activityData.forEach((a: ActivityLog) => {
            // Don't duplicate outreach creation if we already have it from the outreach table
            // (Unless we want extremely granular "drafted" vs "sent" logs)
            if (a.activity_type !== 'outreach_sent') {
                events.push({
                    id: `activity-${a.id}`,
                    type: 'activity',
                    date: a.created_at,
                    title: formatActivityType(a.activity_type),
                    description: a.description,
                    metadata: a.metadata
                })
            }
        })
    }

    // Sort by date descending (newest first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return events
}

// Helper to format enum strings into readable titles
function formatActivityType(type: string): string {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
