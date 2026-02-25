# Workflow: Daily Operations

## Trigger: Scheduled (runs automatically via cron)

## Steps:
1. **06:00** — Reddit keyword check
   - Query Reddit API for monitored keywords
   - Store new posts in database
   - Flag high-relevance posts for dashboard

2. **07:00** — Engagement processing
   - Check Resend webhook data for opens/clicks/replies
   - Update prospect engagement records
   - Trigger follow-up scheduling for engaged prospects

3. **08:00** — Scheduled sends
   - Check for sequence steps due in next 2 hours
   - Send via Resend API
   - Log results

4. **08:30** — Metrics recalculation
   - Recalculate: response rate, conversion rate, template performance
   - Update dashboard cache

5. **09:00** — Daily report generation
   - Compile previous 24h activity
   - Generate report via Claude Haiku
   - Store in dashboard

6. **17:00** — Evening processing
   - Re-check engagement
   - Queue tomorrow's follow-ups
   - Update cost tracking
   - Log daily summary
