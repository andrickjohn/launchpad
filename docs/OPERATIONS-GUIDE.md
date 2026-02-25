# Operations Guide — LaunchPad

## Daily Routine (~10 minutes)

1. **Check Dashboard** — review overnight activity, metrics, alerts
2. **Review Approval Queue** — approve/reject/edit AI-generated drafts
3. **Check Reddit Monitor** — any relevant posts to engage with?
4. **Review Overachiever Suggestions** — anything worth trying?
5. **Scan Activity Feed** — any anomalies or errors?

## Weekly Review (~30 minutes)

1. **Metrics Review** — which campaigns performing best? Why?
2. **Template Performance** — any templates to retire or promote?
3. **Cost Check** — are API costs within budget?
4. **Prospect Pipeline** — enough prospects in queue for next week?
5. **Experiment Results** — any A/B tests concluded? Apply learnings.

## Monthly Review (~1 hour)

1. **Full metrics analysis** — trends, patterns, insights
2. **Competitive landscape check** — anything changed?
3. **AI quality check** — are drafts getting better or worse?
4. **Feature wishlist** — what would make LaunchPad better?
5. **Cost optimization** — any unnecessary API usage to cut?

## Emergency Procedures

### Email Bounce Spike
1. Pause all active sequences
2. Check bounce reasons (invalid emails? spam flagged?)
3. Clean prospect list
4. Resume with verified emails only

### API Down
- Resend down → emails queue locally, send when restored
- Anthropic down → manual drafting mode, AI features show "temporarily unavailable"
- Reddit down → monitoring paused, resume when restored
- Apify down → delay scraping, no immediate impact

### Cost Overrun
1. Check cost tracking dashboard
2. Identify which service is over budget
3. Pause non-essential API calls
4. Adjust usage limits in safety-boundaries.yaml
