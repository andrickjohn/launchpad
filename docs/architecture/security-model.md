# Security Model — LaunchPad

## Authentication
- Supabase Auth with magic link (email)
- Session stored in httpOnly cookie
- Middleware enforces auth on all /app/* routes

## Authorization
- Row Level Security (RLS) on all tables
- Roles: owner, va
- VA restrictions enforced at both UI and API level

## Data Protection
- All inputs validated with zod schemas server-side
- PII minimized (email + name only for prospects)
- No raw SQL — Supabase client library only
- API keys in environment variables only

## API Security
- Rate limiting on all public-facing routes
- CORS configured for production domain only
- Security headers (CSP, X-Frame-Options, etc.) via Next.js config

## External API Security
- All external API calls (Apify, Resend, Anthropic, Reddit) server-side only
- API keys never exposed to client
- Mock mode for development (no real API calls)
