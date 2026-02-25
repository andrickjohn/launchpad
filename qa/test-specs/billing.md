# Test Specification: Billing / Cost Tracking

## Note
LaunchPad is a personal tool — no Stripe integration needed.
"Billing" here means tracking API costs (Apify, Anthropic, Resend).

## Acceptance Criteria
- [ ] Dashboard shows estimated API costs for current billing period
- [ ] Cost tracking per service: Apify runs, Anthropic API calls, Resend emails
- [ ] Daily/weekly cost summary
- [ ] Alert when approaching budget thresholds

## Unit Tests
- Test: cost calculator for Anthropic (tokens × rate) → Expected: correct dollar amount
- Test: cost calculator for Apify (run count × avg cost) → Expected: correct estimate
- Test: cost calculator for Resend (sends over free tier) → Expected: correct overage

## Integration Tests
- Test: API call logger stores cost metadata → Expected: record in cost_tracking table
- Test: cost summary API returns correct totals → Expected: matches sum of records

## What "Done" Looks Like
The dashboard shows a small "API Costs" card with this month's estimated spend
broken down by service, with a simple alert if approaching $10/month.
