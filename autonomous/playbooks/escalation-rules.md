# Escalation Rules — LaunchPad

## When to Escalate to User
- Any API error that prevents core functionality
- Email bounce rate exceeds 10%
- Reddit API rate limit hit (reduce monitoring frequency)
- Anthropic API error (AI features degraded — show manual fallbacks)
- Cost tracking shows budget exceeded
- Any data inconsistency detected

## Escalation Format
Notification in the activity feed + dashboard alert banner:
"⚠️ [Issue]: [Brief description]. [Action needed or auto-action taken]."

## Auto-Recovery Actions (no escalation needed)
- Transient API failure → retry with exponential backoff (max 3)
- Rate limit hit → reduce frequency, resume when limit resets
- Failed email send → re-queue for next send window
