import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import { createClient } from '@/lib/supabase/server'
import { getModelId, MODEL_ASSIGNMENTS } from '@/lib/ai/models'

// Define the structure of an Apify suggestion
export interface ScrapeSuggestion {
    actorId: string
    name: string
    description: string
    estimatedCostPer1k: number
    runInput: Record<string, unknown>
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await getAuthUser(supabase)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { targetAudience, targetCount } = await request.json()

        if (!targetAudience) {
            return NextResponse.json({ error: 'Missing target audience criteria' }, { status: 400 })
        }

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

        // We use Haiku for this task as it's a fast categorization/configuration generation task
        const modelId = getModelId(MODEL_ASSIGNMENTS.categorization)

        const prompt = `You are an expert data scraper and lead generation specialist.
A user wants to build a prospect list based on this criteria:
Target Audience/Search: "${targetAudience}"
Target Quantity: ${targetCount || 100}

Recommend the best Apify actors and exact configurations to get this data.
Choose from these supported native Apify actors:
1. "compass/google-maps-scraper" (Good for local businesses, restaurants, plumbers, dentists. Needs 'searchStrings' array)
2. "bebity/linkedin-scraper" (Good for corporate profiles, B2B roles. Needs 'urls' array of LinkedIn search URLs)
3. "apify/instagram-profile-scraper" (Good for influencers, brands. Needs 'usernames' array)
4. "dainty_screw/github-user-scraper" (Good for developers, engineers. Needs 'search' string)

Return ONLY a JSON array of configuration objects. DO NOT wrap in markdown blocks. Just raw JSON.
Format:
[
  {
    "actorId": "the/actor-id",
    "name": "Human readable name for the strategy",
    "description": "Why this is a good approach for this audience",
    "estimatedCostPer1k": 5.00, // your estimated cost in USD
    "runInput": { // The exact input JSON for the Apify run
      "searchStrings": ["dentists in miami", "orthodontists in miami"], // Example for google maps
      "maxItems": ${targetCount || 100}
    }
  }
]

Provide 1 to 3 distinct strategies/actors that would work.`

        const message = await anthropic.messages.create({
            model: modelId,
            max_tokens: 2000,
            temperature: 0.2,
            messages: [{ role: 'user', content: prompt }],
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

        // Extract JSON array
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/)
        if (!jsonMatch) {
            throw new Error(`Failed to parse AI response: ${responseText}`)
        }

        const suggestions: ScrapeSuggestion[] = JSON.parse(jsonMatch[0])

        return NextResponse.json({
            success: true,
            suggestions
        })

    } catch (error) {
        console.error('Error in suggest-scrapes endpoint:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
