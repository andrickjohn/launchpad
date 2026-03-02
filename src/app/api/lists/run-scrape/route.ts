import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await getAuthUser(supabase)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { listName, description, actorId, runInput, targetCount, costUsd } = await request.json()

        if (!listName || !actorId || !runInput) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const apifyClient = new ApifyClient({
            token: process.env.APIFY_API_TOKEN || '',
        })

        // 1. Create the Prospect List record
        const { data: prospectList, error: listError } = await supabase
            .from('prospects_lists')
            .insert({
                user_id: user.id,
                name: listName,
                description: description || null,
            })
            .select()
            .single()

        // Handle schema discrepancy: Some versions named it prospect_lists, some prospects_lists. 
        // Fallback if the first fails.
        let listId = prospectList?.id
        if (listError) {
            const { data: fallbackList, error: fallbackError } = await supabase
                .from('prospect_lists')
                .insert({
                    user_id: user.id,
                    name: listName,
                    description: description || null,
                })
                .select()
                .single()

            if (fallbackError) {
                throw new Error(`Failed to create list: ${fallbackError.message}`)
            }
            listId = fallbackList.id
        }

        // 2. Mock Apify execution if no token is provided (to prevent actual billing during testing)
        const isMock = !process.env.APIFY_API_TOKEN || process.env.APIFY_API_TOKEN.trim() === ''

        let externalRunId = `mock-${crypto.randomUUID()}`
        let jobStatus = 'pending'

        if (!isMock) {
            // 3. Fire the actual Apify Actor asynchronously
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://launchpad-example.com' // Set this in Vercel
                const run = await apifyClient.actor(actorId).start(runInput, {
                    webhooks: [
                        {
                            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.ABORTED', 'ACTOR.RUN.TIMED_OUT'],
                            requestUrl: `${baseUrl}/api/lists/webhook/apify`
                        }
                    ]
                })
                externalRunId = run.id
                jobStatus = 'running'
            } catch (apifyErr: unknown) {
                console.error("Apify execution error:", apifyErr)
                jobStatus = 'failed'
                const errorMessage = apifyErr instanceof Error ? apifyErr.message : 'Unknown Apify Error'
                throw new Error(`Apify failed to start: ${errorMessage}`)
            }
        } else {
            // In mock mode, we'll pretend it completed immediately and insert fake prospects
            jobStatus = 'completed'

            // Insert mock prospects to demonstrate the flow
            const mockProspects = Array.from({ length: targetCount || 5 }).map((_, i) => ({
                user_id: user.id,
                list_id: listId,
                email: `mock-prospect-${i}-${Date.now()}@example.com`,
                name: `Mock Prospect ${i}`,
                company: 'Mock Company LLC',
                status: 'new'
            }))

            await supabase.from('prospects').insert(mockProspects)
        }

        // 4. Create the Scrape Job tracking record
        const { data: scrapeJob, error: jobError } = await supabase
            .from('scrape_jobs')
            .insert({
                user_id: user.id,
                list_id: listId,
                status: jobStatus,
                actor_id: actorId,
                run_input: runInput,
                target_count: targetCount || null,
                cost_usd: costUsd || 0,
                external_run_id: externalRunId,
            })
            .select()
            .single()

        if (jobError) {
            throw new Error(`Failed to create job record: ${jobError.message}`)
        }

        return NextResponse.json({
            success: true,
            listId,
            jobId: scrapeJob.id,
            isMock,
            message: isMock
                ? 'Mock job created successfully (No APIFY_API_TOKEN found)'
                : 'Apify job started successfully'
        })

    } catch (error) {
        console.error('Error in run-scrape endpoint:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
