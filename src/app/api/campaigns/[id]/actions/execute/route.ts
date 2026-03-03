import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'

/**
 * POST /api/campaigns/[id]/actions/execute
 * Execute an approved action. Body: { action_id }
 *
 * For scrape_config: creates a scrape_job and imports results as prospects
 * For email_draft: creates outreach records for matching prospects
 * For manual_task/social_post: logs completion to activity_log
 *
 * All executions write to activity_log for CRM timeline visibility.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: campaignId } = await params

        const { data: { user }, error: authError } = await getAuthUser(supabase)
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action_id } = body

        if (!action_id) {
            return NextResponse.json({ error: 'action_id is required' }, { status: 400 })
        }

        // Fetch campaign and find the action
        const { data: campaign, error } = await supabase
            .from('campaigns')
            .select('launch_brief, name')
            .eq('id', campaignId)
            .single()

        if (error || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        const brief = campaign.launch_brief as Record<string, unknown>
        const actions = (brief.generated_actions || []) as Array<Record<string, unknown>>
        const actionIndex = actions.findIndex(a => a.id === action_id)

        if (actionIndex === -1) {
            return NextResponse.json({ error: 'Action not found' }, { status: 404 })
        }

        const action = actions[actionIndex]
        const actionType = action.action_type as string
        const content = action.content as Record<string, unknown>

        let executionResult: Record<string, unknown> = {}

        // ------- EXECUTE BASED ON TYPE -------

        if (actionType === 'scrape_config') {
            // Create a scrape job entry
            const { data: scrapeJob, error: scrapeError } = await supabase
                .from('scrape_jobs')
                .insert({
                    user_id: user.id,
                    list_id: null,
                    status: 'pending',
                    actor_id: String(content.actor_id || 'unknown'),
                    run_input: content,
                    target_count: null,
                    cost_usd: 0,
                })
                .select()
                .single()

            if (scrapeError) {
                console.error('Failed to create scrape job:', scrapeError)
                return NextResponse.json({ error: 'Failed to create scrape job' }, { status: 500 })
            }

            executionResult = { type: 'scrape', scrape_job_id: scrapeJob?.id, message: 'Scrape job queued' }

            // Log to activity_log
            await supabase.from('activity_log').insert({
                user_id: user.id,
                actor_id: user.id,
                activity_type: 'campaign_activated',
                entity_type: 'campaign',
                entity_id: campaignId,
                description: `Executed scrape action: ${action.title}`,
                metadata: { action_id, scrape_job_id: scrapeJob?.id },
            })

        } else if (actionType === 'email_draft') {
            // Find prospects in this campaign to create outreach for
            const { data: prospects } = await supabase
                .from('prospects')
                .select('id, email, name')
                .eq('campaign_id', campaignId)
                .limit(100)

            const subject = String(content.subject || '')
            const emailBody = String(content.body || '')
            const outreachRecords: Array<Record<string, unknown>> = []

            if (prospects && prospects.length > 0) {
                for (const prospect of prospects) {
                    // Personalize: replace {{name}}, {{company}}, {{email}}
                    const personalizedBody = emailBody
                        .replace(/\{\{name\}\}/g, prospect.name || 'there')
                        .replace(/\{\{email\}\}/g, prospect.email)

                    const personalizedSubject = subject
                        .replace(/\{\{name\}\}/g, prospect.name || 'there')
                        .replace(/\{\{email\}\}/g, prospect.email)

                    outreachRecords.push({
                        user_id: user.id,
                        prospect_id: prospect.id,
                        campaign_id: campaignId,
                        channel: 'email',
                        status: 'draft',
                        subject: personalizedSubject,
                        body: personalizedBody,
                        sequence_step: 1,
                        metadata: { source_action_id: action_id },
                    })
                }

                const { error: outreachError } = await supabase
                    .from('outreach')
                    .insert(outreachRecords)

                if (outreachError) {
                    console.error('Failed to create outreach records:', outreachError)
                    return NextResponse.json({ error: 'Failed to create email outreach' }, { status: 500 })
                }
            }

            executionResult = {
                type: 'email',
                outreach_created: outreachRecords.length,
                message: `Created ${outreachRecords.length} email drafts for campaign prospects`,
            }

            // Log to activity_log
            await supabase.from('activity_log').insert({
                user_id: user.id,
                actor_id: user.id,
                activity_type: 'outreach_sent',
                entity_type: 'campaign',
                entity_id: campaignId,
                description: `Created ${outreachRecords.length} email drafts from action: ${action.title}`,
                metadata: { action_id, count: outreachRecords.length },
            })

            // Also log per-prospect for CRM timeline
            if (prospects && prospects.length > 0) {
                const prospectLogs = prospects.map(p => ({
                    user_id: user.id,
                    actor_id: user.id,
                    activity_type: 'outreach_sent' as const,
                    entity_type: 'prospect',
                    entity_id: p.id,
                    description: `Email draft created: "${subject}"`,
                    metadata: { action_id, campaign_id: campaignId },
                }))

                await supabase.from('activity_log').insert(prospectLogs)
            }

        } else if (actionType === 'manual_task' || actionType === 'social_post') {
            // Manual completion — just log to activity_log for CRM visibility
            executionResult = {
                type: 'manual',
                message: 'Action marked as completed',
            }

            await supabase.from('activity_log').insert({
                user_id: user.id,
                actor_id: user.id,
                activity_type: 'campaign_activated',
                entity_type: 'campaign',
                entity_id: campaignId,
                description: `Completed action: ${action.title}`,
                metadata: { action_id, action_type: actionType },
            })
        } else {
            executionResult = { type: 'unknown', message: 'Action type not supported for execution' }
        }

        // ------- MARK ACTION AS COMPLETED -------
        actions[actionIndex].status = 'completed'
        actions[actionIndex].executed_at = new Date().toISOString()
        actions[actionIndex].execution_result = executionResult
        actions[actionIndex].updated_at = new Date().toISOString()

        const { error: updateError } = await supabase
            .from('campaigns')
            .update({ launch_brief: { ...brief, generated_actions: actions } })
            .eq('id', campaignId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, result: executionResult, action: actions[actionIndex] })
    } catch (error) {
        console.error('Error in action execute:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
