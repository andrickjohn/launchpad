# Skill: Email Automation — LaunchPad

## Resend Integration
- Use Resend's Node SDK (`resend` npm package)
- All sends go through `src/lib/services/resend.ts`
- Free tier: 100 emails/day — enforce this limit in code
- Track sends in database: `email_sends` table with status, timestamps

## Email Sequences
- Stored in database: `sequences` table with `steps` JSONB column
- Each step: delay (hours), subject template, body template, conditions
- Scheduler: Next.js cron route (or Supabase Edge Function) checks every hour
  for pending sequence steps and fires them
- Cancel/pause at any time per prospect or per sequence

## Draft Queue
- AI-generated emails go to `drafts` table with status: pending/approved/rejected
- User reviews in Outreach screen, approves or edits, then sends
- Never send AI-drafted content without approval

## Templates
- Stored in `templates` table
- Support variables: {{first_name}}, {{company}}, {{custom_field}}
- Variable validation before send — reject if required vars missing
