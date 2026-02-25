# LaunchPad

A personal launch command center for solo founders. Composes pay-as-you-go APIs
(Apify, Resend, Claude Haiku, Reddit API) into a single three-screen dashboard
for product launch outreach.

## Quick Start
1. Clone this repo
2. Copy `.env.example` to `.env.local` and fill in your API keys
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:3000`

## Architecture
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (Postgres + Auth + Realtime)
- **Hosting**: Vercel
- **Email**: Resend
- **Scraping**: Apify
- **AI**: Anthropic Claude Haiku
- **Monitoring**: Reddit API

## Project Structure
See `/docs/architecture/system-overview.md` for detailed architecture.
See `/claude.md` for the full build brief.
See `/qa/QA-STRATEGY.md` for testing approach.

## Cost
- Monthly: Under $10 at normal usage
- Infrastructure: $0 (all free tiers)
- Domain: ~$12/year (optional)
