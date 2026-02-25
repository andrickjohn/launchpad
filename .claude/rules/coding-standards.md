# Coding Standards — LaunchPad

## Language & Framework
- TypeScript strict mode — no `any` types except at API boundaries with explicit casting
- Next.js 14 App Router — all new pages in `src/app/`
- React Server Components by default; add `"use client"` only when needed
- Tailwind CSS for all styling — no CSS modules, no styled-components

## File Organization
- One component per file
- Co-locate component, types, and tests
- Use barrel exports (`index.ts`) for feature folders
- Database queries in `src/lib/db/` — not in components or API routes

## Naming
- Components: PascalCase (`ProspectCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- API routes: kebab-case (`/api/prospects/score-all`)
- Database tables: snake_case (`prospect_scores`)
- Types/interfaces: PascalCase with descriptive names (`ProspectWithTimeline`)

## Error Handling
- Every API route has try/catch with meaningful error responses
- Client-side: error boundaries at page level, toast notifications for action failures
- Never swallow errors silently — log them at minimum

## Performance
- Lazy load heavy components (charts, editors)
- Use `loading.tsx` for route-level loading states
- Paginate lists over 50 items
- Use Supabase realtime only where genuinely needed (activity feed)

## Security
- Validate all inputs server-side (zod schemas)
- Row Level Security on all Supabase tables
- Auth check on every API route and server action
- No secrets in client-side code
- Sanitize all user-generated content before rendering
