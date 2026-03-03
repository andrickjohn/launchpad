import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import Anthropic from '@anthropic-ai/sdk'
import { getModelId } from '@/lib/ai/models'

/**
 * POST /api/campaigns/[id]/actions/revise
 * AI-powered revision of action content.
 * Body: { action_id, prompt }
 *
 * Takes the current action content + user's revision prompt,
 * sends to Claude Haiku, returns the revised content.
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
        const { action_id, prompt } = body

        if (!action_id || !prompt) {
            return NextResponse.json({ error: 'action_id and prompt are required' }, { status: 400 })
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

        // Build the AI prompt based on action type
        let contentDescription = ''
        if (actionType === 'email_draft') {
            contentDescription = `Subject: ${content.subject || ''}\n\nBody:\n${content.body || ''}`
        } else if (actionType === 'social_post') {
            contentDescription = `Message:\n${content.message || content.body || ''}`
        } else if (actionType === 'scrape_config') {
            contentDescription = `Description: ${content.description || ''}\nActor: ${content.actor_id || ''}\nQueries: ${Array.isArray(content.queries) ? content.queries.join(', ') : ''}`
        } else if (actionType === 'manual_task') {
            const steps = Array.isArray(content.steps)
                ? content.steps.map((s: unknown, i: number) => `${i + 1}. ${typeof s === 'string' ? s : (s as Record<string, unknown>).description || JSON.stringify(s)}`).join('\n')
                : ''
            contentDescription = `Description: ${content.description || ''}\n${steps ? `Steps:\n${steps}` : ''}`
        } else {
            contentDescription = JSON.stringify(content, null, 2)
        }

        const systemPrompt = `You are a marketing strategist and copywriting expert helping refine campaign actions for a product launch.
You will receive the current content of a campaign action and a revision request from the user.
Revise the content according to the user's instructions while maintaining the same format and structure.

IMPORTANT: Return ONLY valid JSON matching the original content structure. Do not include any explanation outside the JSON.
- For email_draft: return {"subject": "...", "body": "..."}
- For social_post: return {"message": "..."}
- For manual_task: return the same structure as the original (e.g. {"description": "...", "steps": [...], "estimated_time": "..."})
- For scrape_config: return {"description": "...", "actor_id": "...", "queries": [...]}
- Preserve any extra fields from the original content that aren't being revised.`

        const userPrompt = `Here is the current action (type: ${actionType}, title: "${action.title}"):

${contentDescription}

User's revision request: "${prompt}"

Return the revised content as JSON only.`

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI not configured (missing API key)' }, { status: 500 })
        }

        const anthropic = new Anthropic({ apiKey })
        const modelId = getModelId('haiku')

        const message = await anthropic.messages.create({
            model: modelId,
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        })

        const aiText = message.content[0].type === 'text' ? message.content[0].text : ''

        // Parse the AI response as JSON
        let revisedContent: Record<string, unknown>
        try {
            // Try to extract JSON from the response (handle markdown code blocks)
            const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiText]
            revisedContent = JSON.parse(jsonMatch[1]!.trim())
        } catch {
            return NextResponse.json({
                error: 'AI returned invalid JSON. Try a different prompt.',
                raw_response: aiText,
            }, { status: 422 })
        }

        // Merge with original content to preserve any extra fields
        const mergedContent = { ...content, ...revisedContent }

        // Save the revised content back to the action
        actions[actionIndex].content = mergedContent
        actions[actionIndex].updated_at = new Date().toISOString()

        const { error: updateError } = await supabase
            .from('campaigns')
            .update({ launch_brief: { ...brief, generated_actions: actions } })
            .eq('id', campaignId)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            revised_content: mergedContent,
            title: action.title,
        })
    } catch (error) {
        console.error('Error in action revise:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
