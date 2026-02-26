import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * POST /api/prospects/find-similar
 * Analyzes selected prospects and suggests sources to find more like them
 *
 * Request body:
 * {
 *   prospect_ids: string[]  // Array of prospect UUIDs to analyze
 * }
 *
 * Response:
 * {
 *   success: true,
 *   analysis: {
 *     patterns: string[],        // Common patterns identified
 *     recommended_sources: {      // Sources to find more prospects
 *       source: string,
 *       method: string,
 *       query: string,
 *       estimated_volume: string
 *     }[],
 *     apify_queries: string[]     // Ready-to-use Apify search queries
 *   }
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

    // Build analysis prompt
    const prospectsSummary = prospects.map(p => ({
      name: p.name || 'Unknown',
      email: p.email,
      company: p.company || 'Unknown',
      title: p.title || 'Unknown',
      linkedin: p.linkedin_url ? 'Yes' : 'No',
      website: p.website || 'Unknown',
    }))

    const prompt = `You are an expert at finding B2B prospects. Analyze these prospects and suggest where to find more like them.

Prospects:
${JSON.stringify(prospectsSummary, null, 2)}

Analyze:
1. What patterns do you see? (job titles, industries, company sizes, locations)
2. What are the best sources to find more prospects like these?
3. What specific search queries should be used?

For each recommended source, provide:
- Source name (LinkedIn, Google Maps, Yelp, Reddit, Facebook Groups, etc.)
- Method (scraping tool, manual search, API)
- Specific query to use
- Estimated prospect volume
- Apify actor to use if applicable

Respond with ONLY a JSON object in this exact format:
{
  "patterns": ["<pattern 1>", "<pattern 2>", "<pattern 3>"],
  "recommended_sources": [
    {
      "source": "<source name>",
      "method": "<how to access>",
      "query": "<specific search query>",
      "estimated_volume": "<number range>",
      "apify_actor": "<actor ID if applicable, otherwise null>"
    }
  ],
  "apify_queries": ["<ready-to-use query 1>", "<ready-to-use query 2>"]
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-20250122',
      max_tokens: 2000,
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

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      analysis,
    })

  } catch (error) {
    console.error('Error in find-similar endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
