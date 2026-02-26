import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/outreach/send
 * Sends an email via Resend or schedules it
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prospect_id, subject, body: emailBody, scheduled_at } = body

    if (!prospect_id || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'prospect_id, subject, and body are required' },
        { status: 400 }
      )
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

    // If scheduled, create scheduled outreach
    if (scheduled_at) {
      const { data: outreach, error } = await supabase
        .from('outreach')
        .insert({
          user_id: user.id,
          prospect_id,
          channel: 'email',
          status: 'scheduled',
          subject,
          body: emailBody,
          scheduled_at,
        })
        .select()
        .single()

      if (error) {
        console.error('Error scheduling email:', error)
        return NextResponse.json({ error: 'Failed to schedule email' }, { status: 500 })
      }

      return NextResponse.json({ success: true, outreach })
    }

    // Send immediately via Resend
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'LaunchPad <onboarding@resend.dev>', // Change this to your verified domain
        to: [prospect.email],
        subject,
        text: emailBody,
      })

      if (emailError) {
        console.error('Resend error:', emailError)
        return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 500 })
      }

      // Record in database
      const { data: outreach, error } = await supabase
        .from('outreach')
        .insert({
          user_id: user.id,
          prospect_id,
          channel: 'email',
          status: 'sent',
          subject,
          body: emailBody,
          sent_at: new Date().toISOString(),
          metadata: { resend_id: emailData?.id },
        })
        .select()
        .single()

      if (error) {
        console.error('Error recording outreach:', error)
      }

      // Update prospect status
      await supabase
        .from('prospects')
        .update({ status: 'contacted' })
        .eq('id', prospect_id)

      return NextResponse.json({ success: true, outreach, email_id: emailData?.id })
    } catch (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in send endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
