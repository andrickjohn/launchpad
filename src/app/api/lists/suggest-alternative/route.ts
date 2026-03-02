import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import { createClient } from '@/lib/supabase/server'
import { getModelId, MODEL_ASSIGNMENTS } from '@/lib/ai/models'
import { SUPPORTED_SCRAPERS } from '@/lib/apify/scrapers'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await getAuthUser(supabase)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { targetAudience, targetCount, actorId } = await request.json()

        if (!targetAudience || !actorId) {
            return NextResponse.json({ error: 'Missing target audience or actorId' }, { status: 400 })
        }

        const scraper = SUPPORTED_SCRAPERS.find(s => s.actorId === actorId)
        if (!scraper) {
            return NextResponse.json({ error: 'Invalid or unsupported actorId requested' }, { status: 400 })
        }

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const modelId = getModelId(MODEL_ASSIGNMENTS.categorization)

        const prompt = `You are an expert data scraper and lead generation specialist.
A user wants to build a prospect list based on this criteria:
Target Audience/Search: "${targetAudience}"
Target Quantity: ${targetCount || 100}

They specifically want you to generate an Apify configuration exclusively for THIS actor:
ID: ${scraper.actorId}
Name: ${scraper.name}
Instructions: ${scraper.inputTypeHelp}

Return ONLY a single JSON object. DO NOT wrap in markdown blocks. Just raw JSON.
Format:
{
    "actorId": "${scraper.actorId}",
    "name": "${scraper.name} Alternative",
    "description": "How this actor can be creatively applied to reach this audience",
    "estimatedCostPer1k": ${scraper.baseCostPer1k},
    "runInput": { // The exact input JSON for the Apify run
      // Example for google maps: "searchStrings": ["dentists in miami"]
      // Example for linkedin: "urls": ["https://linkedin.com/search/results/people/"]
      "maxItems": ${targetCount || 100}
    }
}
`

        const message = await anthropic.messages.create({
            model: modelId,
            max_tokens: 1500,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

        // Extract JSON object
        const jsonMatch = responseText.match(/\{\s*["']actorId["'][\s\S]*\}\s*/)
        if (!jsonMatch) {
            throw new Error(`Failed to parse AI response: ${responseText}`)
        }

        const suggestion = JSON.parse(jsonMatch[0])

        return NextResponse.json({
            success: true,
            suggestion
        })

    } catch (error) {
        console.error('Error in suggest-alternative endpoint:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
