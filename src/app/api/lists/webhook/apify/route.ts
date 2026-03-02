import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApifyClient } from 'apify-client'

// Use service role for webhooks as there is no user session
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
})

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Example Apify webhook payload has resource.id as the run Id
        // eventType is e.g. 'ACTOR.RUN.SUCCEEDED'
        const { eventType, resource } = body

        if (!resource || !resource.id) {
            return NextResponse.json({ error: 'Missing run ID' }, { status: 400 })
        }

        const runId = resource.id

        // Find the matching scrape job
        const { data: job, error: jobError } = await supabase
            .from('scrape_jobs')
            .select('*')
            .eq('external_run_id', runId)
            .single()

        if (jobError || !job) {
            console.error('Job not found for run ID:', runId)
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        if (eventType === 'ACTOR.RUN.FAILED' || eventType === 'ACTOR.RUN.ABORTED' || eventType === 'ACTOR.RUN.TIMED_OUT') {
            await supabase
                .from('scrape_jobs')
                .update({ status: 'failed' })
                .eq('id', job.id)
            return NextResponse.json({ status: 'marked_failed' })
        }

        if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
            return NextResponse.json({ status: 'ignored' })
        }

        // It succeeded. Fetch dataset.
        const run = await client.run(runId).get()
        const datasetId = run?.defaultDatasetId

        if (!datasetId) {
            return NextResponse.json({ error: 'No default dataset' }, { status: 400 })
        }

        const { items } = await client.dataset(datasetId).listItems()

        // Map items to prospects based loosely on typical Apify outputs
        // We map what we can find. (Some scrapers use 'emails', some 'url', some 'title')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prospectsToInsert = items.map((item: any) => {
            // Find the first email we can
            let email = ''
            if (item.email) email = item.email
            else if (item.emails && item.emails.length > 0) email = item.emails[0]
            else if (item.contactEmail) email = item.contactEmail

            // If absolutely no email and we're just collecting URLs, we still need something unique or we skip.
            // Often, a scraper might not find an email. We'll skip rows without emails to keep the db clean,
            // or we can insert without email if we want to do manual review later.
            // Let's allow empty emails but try to capture name/company.

            const name = item.name || item.title || item.personName || ''
            const company = item.company || item.companyName || item.organization || ''
            const phone = item.phone || item.phoneNumber || (item.phones && item.phones[0]) || ''
            const website = item.website || item.url || ''
            const linkedin = item.linkedin || item.linkedinUrl || ''

            return {
                user_id: job.user_id,
                list_id: job.list_id,
                email: email || `unknown-${Math.random().toString(36).substring(7)}@example.com`,
                name,
                company,
                phone,
                website,
                linkedin_url: linkedin,
                status: 'new'
            }
        })

        // Batch insert
        if (prospectsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('prospects')
                .insert(prospectsToInsert)

            if (insertError) {
                console.error('Error inserting prospects:', insertError)
                return NextResponse.json({ error: 'Failed to insert prospects' }, { status: 500 })
            }
        }

        // Mark job as completed
        await supabase
            .from('scrape_jobs')
            .update({
                status: 'completed',
                // In a real scenario we'd query actual Apify usage costs but we'll leave cost_usd alone.
            })
            .eq('id', job.id)

        return NextResponse.json({
            status: 'success',
            inserted: prospectsToInsert.length
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
