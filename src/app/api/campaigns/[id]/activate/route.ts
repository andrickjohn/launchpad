import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getModelId, getModelInfo, MODEL_ASSIGNMENTS } from '@/lib/ai/models'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import type { ModelTier } from '@/lib/ai/models'

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

    // Parse optional model override
    let modelOverride: ModelTier | undefined
    try {
      const body = await request.json()
      if (body.model_tier && ['haiku', 'sonnet', 'opus'].includes(body.model_tier)) {
        modelOverride = body.model_tier as ModelTier
      }
    } catch {
      // No body — use defaults
    }

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.launch_brief) {
      return NextResponse.json({ error: 'Campaign has no launch brief. Generate one first.' }, { status: 400 })
    }

    const brief = campaign.launch_brief as Record<string, unknown>

    if (brief.activated_at) {
      return NextResponse.json({ error: 'Campaign is already activated' }, { status: 400 })
    }

    // Get model
    const modelTier = modelOverride || MODEL_ASSIGNMENTS.campaignActivation
    const modelId = getModelId(modelTier)
    const modelInfo = getModelInfo(modelTier)

    const prompt = `You are an expert outreach campaign planner. Given a launch brief, generate concrete, executable action items for each day of the first week.

CAMPAIGN CONTEXT:
- Product: ${campaign.product_description || 'Not specified'}
- Target Buyer: ${campaign.target_buyer || 'Not specified'}
- Price Point: ${campaign.price_point || 'Not specified'}
- Geography: ${campaign.geography || 'Not specified'}

LAUNCH BRIEF:
${JSON.stringify(brief, null, 2)}

Generate action items for each day (1-7). For each action, provide the exact content needed to execute:

- For EMAIL actions: Write a complete cold email with subject line and body. Personalize with {{name}} and {{company}} placeholders.
- For LINKEDIN actions: Write the exact post or connection message.
- For REDDIT actions: Write a helpful reply or post (no spam — genuine value).
- For FACEBOOK actions: Write a group post or comment.
- For SCRAPE actions: Specify the Apify actor ID and exact search queries.
- For TASK actions: Describe the manual task clearly with steps.

Respond with ONLY a JSON array in this exact format:
[
  {
    "day": 1,
    "channel": "email",
    "action_type": "email_draft",
    "title": "Cold email to [segment]",
    "content": {
      "subject": "Quick question about {{company}}'s approach to...",
      "body": "Hi {{name}},\\n\\nI noticed..."
    },
    "sort_order": 0
  }
]

RULES:
- Generate 20-30 actions across all 7 days
- Day 1-2: Focus on setup, scraping, and first outreach
- Day 3-4: Follow-up emails, social engagement
- Day 5-7: Expand channels, refine messaging, new segments
- Each email must have a complete, ready-to-send subject and body
- Social posts must be ready to copy-paste
- Valid channels: email, linkedin, reddit, facebook, scrape, task
- Valid action_types: email_draft, social_post, scrape_config, manual_task
- sort_order starts at 0 for each day`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: modelId,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response — no JSON array found')
    }

    let actions: Array<{
      day: number
      channel: string
      action_type: string
      title: string
      content: Record<string, unknown>
      sort_order: number
    }>

    try {
      actions = JSON.parse(jsonMatch[0])
    } catch {
      // Attempt repair for truncated JSON
      let repaired = jsonMatch[0]
      const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
      if (quoteCount % 2 !== 0) repaired += '"'
      repaired = repaired.replace(/,\s*$/, '')
      const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length
      const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length
      for (let i = 0; i < openBraces; i++) repaired += '}'
      for (let i = 0; i < openBrackets; i++) repaired += ']'
      actions = JSON.parse(repaired)
    }

    // Validate and normalize
    const validChannels = ['email', 'linkedin', 'reddit', 'facebook', 'scrape', 'task']
    const validTypes = ['email_draft', 'social_post', 'scrape_config', 'manual_task']

    const generatedActions = actions
      .filter(a => validChannels.includes(a.channel) && validTypes.includes(a.action_type))
      .map((a, i) => ({
        id: crypto.randomUUID(),
        day: Math.min(Math.max(a.day, 1), 7),
        channel: a.channel,
        action_type: a.action_type,
        title: a.title,
        content: a.content,
        status: 'pending' as const,
        sort_order: a.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    // Store actions inside the launch_brief JSONB — no separate table needed
    const updatedBrief = {
      ...brief,
      generated_actions: generatedActions,
      activated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ launch_brief: updatedBrief })
      .eq('id', id)

    if (updateError) {
      console.error('Error saving campaign actions:', updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      actions: generatedActions,
      stats: {
        total: generatedActions.length,
        byDay: generatedActions.reduce((acc, a) => {
          acc[a.day] = (acc[a.day] || 0) + 1
          return acc
        }, {} as Record<number, number>),
      },
      model: { name: modelInfo.name, version: modelInfo.version, id: modelId },
    })
  } catch (error) {
    console.error('Error in activate endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
