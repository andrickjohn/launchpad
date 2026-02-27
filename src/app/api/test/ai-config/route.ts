import { NextResponse } from 'next/server'
import { getModelId, getModelInfo, MODEL_ASSIGNMENTS, getAllModels } from '@/lib/ai/models'
import Anthropic from '@anthropic-ai/sdk'

/**
 * TEST ENDPOINT - No auth required
 * Verifies AI configuration before user testing
 */
export async function GET() {
  try {
    // Get the model that will be used for launch briefs
    const modelTier = MODEL_ASSIGNMENTS.launchBrief
    const modelId = getModelId(modelTier)
    const modelInfo = getModelInfo(modelTier)

    // Check if Anthropic API key is set
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY

    // Try to initialize Anthropic client
    let anthropicStatus = 'not_tested'
    let testMessage = null

    if (hasApiKey) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        })

        // Make a minimal test call to verify the model works
        const message = await anthropic.messages.create({
          model: modelId,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        })

        anthropicStatus = 'success'
        testMessage = message.content[0].type === 'text' ? message.content[0].text : 'Response received'
      } catch (error: any) {
        anthropicStatus = 'error'
        testMessage = error.message || String(error)
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      configuration: {
        launchBriefModel: {
          tier: modelTier,
          id: modelId,
          name: modelInfo.name,
          version: modelInfo.version,
        },
        allModels: getAllModels().map(m => ({
          tier: m.tier,
          id: m.id,
          name: m.name,
          version: m.version,
        })),
      },
      anthropicApi: {
        keyConfigured: hasApiKey,
        status: anthropicStatus,
        testMessage: testMessage,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || String(error),
      },
      { status: 500 }
    )
  }
}
