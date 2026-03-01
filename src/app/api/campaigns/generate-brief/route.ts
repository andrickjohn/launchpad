import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getModelId, getModelInfo, MODEL_ASSIGNMENTS } from '@/lib/ai/models'
import { getAuthUser } from '@/lib/supabase/auth-bypass'

/**
 * POST /api/campaigns/generate-brief
 * Generates an AI-powered launch brief for a new campaign
 *
 * Request body:
 * {
 *   product_description: string
 *   target_buyer: string
 *   price_point: string
 *   geography: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   brief: {
 *     channels: Array<{
 *       name: string
 *       rank: number
 *       rationale: string
 *       methods: string[]
 *       estimated_volume: string
 *       expected_response_rate: string
 *       apify_actor: string | null
 *       sample_queries: string[]
 *     }>
 *     first_week_plan: Array<{
 *       day: string
 *       tasks: string[]
 *     }>
 *     key_insights: string[]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication (with dev bypass support)
    const { data: { user }, error: authError } = await getAuthUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { product_description, target_buyer, price_point, geography } = body

    if (!product_description || !target_buyer) {
      return NextResponse.json(
        { error: 'product_description and target_buyer are required' },
        { status: 400 }
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `You are an expert GTM (Go-To-Market) strategist specializing in product launches and outbound sales.

Analyze this product launch and create a comprehensive Launch Brief:

PRODUCT INFORMATION:
- Product: ${product_description}
- Target Buyer: ${target_buyer}
- Price Point: ${price_point || 'Not specified'}
- Geography: ${geography || 'Not specified'}

Your task is to provide:

1. RANKED CHANNEL RECOMMENDATIONS (top 5 channels)
   For each channel, provide:
   - Channel name (e.g., LinkedIn, Google Maps, Yelp, Reddit, Facebook Groups, SAM.gov)
   - Rank (1-5, 1 being best)
   - Rationale (why this channel for this product/buyer)
   - Specific methods to use
   - Estimated prospect volume
   - Expected response rate
   - Apify actor ID if applicable (research actual Apify actors)
   - 2-3 sample search queries ready to use

2. FIRST WEEK PLAN
   Day-by-day action plan for the first 7 days
   Be specific and actionable

3. KEY INSIGHTS
   3-5 critical insights about this market/buyer/approach

IMPORTANT: Different products get completely different playbooks.
- GovCon → LinkedIn + SAM.gov scraping
- Local dentists → Google Maps + Yelp
- Tech founders → LinkedIn + Twitter + Reddit
- Insurance adjusters → LinkedIn + professional associations
- YouTubers → Social Blade + YouTube + Twitter

Respond with ONLY a JSON object in this exact format:
{
  "channels": [
    {
      "name": "<channel name>",
      "rank": <1-5>,
      "rationale": "<why this channel>",
      "methods": ["<method 1>", "<method 2>"],
      "estimated_volume": "<volume estimate>",
      "expected_response_rate": "<percentage>",
      "apify_actor": "<actor ID or null>",
      "sample_queries": ["<query 1>", "<query 2>", "<query 3>"]
    }
  ],
  "first_week_plan": [
    {
      "day": "Day 1",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    }
  ],
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}`

    // Get the assigned model for this feature
    const modelTier = MODEL_ASSIGNMENTS.launchBrief
    const modelId = getModelId(modelTier)
    const modelInfo = getModelInfo(modelTier)

    const message = await anthropic.messages.create({
      model: modelId,
      max_tokens: 8000,
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

    // Check if the response was truncated
    if (message.stop_reason === 'max_tokens') {
      console.warn('Brief response was truncated — attempting JSON repair')
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    let brief
    try {
      brief = JSON.parse(jsonMatch[0])
    } catch {
      // JSON was truncated — attempt repair by closing open structures
      let repaired = jsonMatch[0]
      // Close any unclosed strings
      const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
      if (quoteCount % 2 !== 0) repaired += '"'
      // Close open arrays and objects by counting brackets
      const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length
      const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length
      // Remove any trailing comma before closing
      repaired = repaired.replace(/,\s*$/, '')
      for (let i = 0; i < openBrackets; i++) repaired += ']'
      for (let i = 0; i < openBraces; i++) repaired += '}'
      try {
        brief = JSON.parse(repaired)
        console.log('Successfully repaired truncated JSON')
      } catch {
        throw new Error('AI response was truncated and could not be repaired. Please try again.')
      }
    }

    return NextResponse.json({
      success: true,
      brief,
      model: {
        name: modelInfo.name,
        version: modelInfo.version,
        id: modelId,
      },
    })

  } catch (error) {
    console.error('Error in generate-brief endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
