# Skill: Data Analysis — LaunchPad

## Metrics Tracked
- Response rate: emails replied to / emails sent
- Conversion rate: prospects converted / prospects contacted
- Template performance: response rate per template
- Channel performance: which import source yields best prospects
- Time-to-response: average time from send to reply
- Sequence performance: which step gets the most engagement

## Dashboard Calculations
- All metrics calculated server-side via Supabase views or API routes
- Cache expensive calculations (recalculate every 15 minutes, not on every page load)
- Use Recharts for visualization
- Show trends: this week vs last week, this campaign vs average

## AI Scoring (Claude Haiku)
- Score prospects 1-5 based on: profile completeness, industry match, engagement signals
- Scoring prompt defined in `/prompts/product/prospect-scorer.md`
- Batch scoring: send up to 20 prospects per API call (structured in a single prompt)
- Store scores in `prospect_scores` table with timestamp and reasoning
