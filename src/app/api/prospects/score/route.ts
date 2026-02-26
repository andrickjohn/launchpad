import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * POST /api/prospects/score
 * Scores multiple prospects using Claude Haiku AI
 *
 * Request body:
 * {
 *   prospect_ids: string[]  // Array of prospect UUIDs to score
 * }
 *
 * Response:
 * {
 *   success: true,
 *   scores: { [prospect_id: string]: { score: number, reasoning: string } }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { prospect_ids } = body

    if (!prospect_ids || !Array.isArray(prospect_ids) || prospect_ids.length === 0) {
      return NextResponse.json(
        { error: 'prospect_ids array is required' },
        { status: 400 }
      )
    }

    // Fetch prospects from database
    const { data: prospects, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .in('id', prospect_ids)
      .eq('user_id', user.id)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch prospects' },
        { status: 500 }
      )
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json(
        { error: 'No prospects found' },
        { status: 404 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const scores: Record<string, { score: number; reasoning: string }> = {}

    // Score each prospect using Claude Haiku
    for (const prospect of prospects) {
      try {
        const prompt = `You are a sales lead scoring expert. Score this prospect on a scale of 0-100 based on the available information.

Consider:
- Completeness of contact information (name, email, company, title, phone, LinkedIn)
- Quality indicators (professional email domain, job title relevance, company info)
- Engagement potential (LinkedIn profile, website, notes)

Prospect Information:
- Name: ${prospect.name || 'Not provided'}
- Email: ${prospect.email}
- Company: ${prospect.company || 'Not provided'}
- Title: ${prospect.title || 'Not provided'}
- Phone: ${prospect.phone || 'Not provided'}
- LinkedIn: ${prospect.linkedin_url || 'Not provided'}
- Website: ${prospect.website || 'Not provided'}
- Notes: ${prospect.notes || 'Not provided'}
- Current Status: ${prospect.status}

Respond with ONLY a JSON object in this exact format:
{
  "score": <number between 0-100>,
  "reasoning": "<2-3 sentence explanation of the score>"
}`

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-20250122',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        })

        // Parse Claude's response
        const responseText = message.content[0].type === 'text'
          ? message.content[0].text
          : ''

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('Failed to parse AI response')
        }

        const result = JSON.parse(jsonMatch[0])

        // Validate score range
        const score = Math.max(0, Math.min(100, Math.round(result.score)))

        scores[prospect.id] = {
          score,
          reasoning: result.reasoning || 'No reasoning provided',
        }

        // Update prospect in database
        await supabase
          .from('prospects')
          .update({ score })
          .eq('id', prospect.id)
          .eq('user_id', user.id)

      } catch (error) {
        console.error(`Error scoring prospect ${prospect.id}:`, error)
        scores[prospect.id] = {
          score: 0,
          reasoning: 'Failed to score this prospect',
        }
      }
    }

    return NextResponse.json({
      success: true,
      scores,
    })

  } catch (error) {
    console.error('Error in score endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
