# Security Rules — LaunchPad

## Authentication
- All routes except landing page require authentication via Supabase Auth
- Use middleware to enforce auth on all /app/* routes
- Magic link auth (email) — no passwords to manage
- VA users get a restricted auth role

## Authorization
- Row Level Security (RLS) on every Supabase table
- Three roles: owner, va, public
- Owner: full CRUD on everything
- VA: read all, execute approved actions, cannot modify templates/settings/billing
- Public: nothing (landing page only)

## Data Protection
- Never store raw PII beyond what's needed (prospect email + name, nothing more)
- Sanitize all inputs with zod before database operations
- No raw SQL — use Supabase client library
- Rate limit API routes (use middleware counter)

## Secrets
- All API keys in environment variables only
- .env.local never committed
- Supabase anon key is public (safe) — service role key is server-only
- Anthropic API key: server-only, never exposed to client

## Headers
- Strict CSP headers via next.config.js
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
