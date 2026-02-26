import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * POST /api/outreach/draft-email
 * Uses AI to draft an email for a prospect
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prospect_id } = body

    if (!prospect_id) {
      return NextResponse.json({ error: 'prospect_id is required' }, { status: 400 })
    }

    // Fetch prospect
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospect_id)
      .eq('user_id', user.id)
      .single()

    if (prospectError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `You are an expert cold email copywriter. Draft a personalized cold outreach email.

Prospect Information:
- Name: ${prospect.name || 'Unknown'}
- Email: ${prospect.email}
- Company: ${prospect.company || 'Unknown'}
- Title: ${prospect.title || 'Unknown'}
- LinkedIn: ${prospect.linkedin_url || 'Not provided'}
- Notes: ${prospect.notes || 'None'}

Write a professional, engaging cold email that:
1. Has a compelling subject line
2. Opens with personalization
3. Clearly states value proposition
4. Includes a specific call to action
5. Keeps it under 150 words

Respond with ONLY a JSON object:
{
  "subject": "<email subject>",
  "body": "<email body>"
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-20250122',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const draft = JSON.parse(jsonMatch[0])

    return NextResponse.json({ success: true, subject: draft.subject, body: draft.body })
  } catch (error) {
    console.error('Error in draft-email endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
