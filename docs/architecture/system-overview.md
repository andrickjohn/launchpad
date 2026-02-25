# System Overview — LaunchPad

## Architecture: Serverless Monolith

LaunchPad is a Next.js 14 app deployed on Vercel with Supabase as the backend.
It's a serverless monolith — one codebase, no microservices, no containers.

```
┌─────────────────────────────────┐
│         Vercel (Hosting)        │
│  ┌───────────────────────────┐  │
│  │   Next.js 14 App Router   │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ │  │
│  │  │Pros-│ │Out- │ │Dash-│ │  │
│  │  │pects│ │reach│ │board│ │  │
│  │  └─────┘ └─────┘ └─────┘ │  │
│  │  ┌───────────────────────┐│  │
│  │  │    API Routes         ││  │
│  │  │  /api/prospects/*     ││  │
│  │  │  /api/outreach/*      ││  │
│  │  │  /api/campaigns/*     ││  │
│  │  │  /api/ai/*            ││  │
│  │  └───────────────────────┘│  │
│  └───────────────────────────┘  │
└──────────────┬──────────────────┘
               │
    ┌──────────┼──────────────────┐
    │          │                  │
    ▼          ▼                  ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Supabase│ │External│ │  Scheduled   │
│  DB +  │ │  APIs  │ │   Tasks      │
│  Auth  │ │        │ │ (Vercel Cron)│
└────────┘ └────────┘ └──────────────┘
              │
    ┌─────────┼─────────┐─────────┐
    ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐
│Resend│ │Apify │ │Anthro- │ │Reddit│
│      │ │      │ │pic API │ │ API  │
└──────┘ └──────┘ └────────┘ └──────┘
```

## Data Model (Core Tables)

- `users` — managed by Supabase Auth
- `campaigns` — product launches with AI-generated briefs
- `prospects` — contacts with scores and alternative tags
- `touchpoints` — timeline of all interactions per prospect
- `email_sends` — every email sent with status and engagement
- `sequences` — email drip sequences with steps
- `templates` — reusable email/message templates
- `drafts` — AI-generated content awaiting approval
- `activity_log` — everything that happens, chronologically
- `reddit_monitors` — keyword monitors with latest results
- `cost_tracking` — API cost estimates per service

## Security Model
See `/docs/architecture/security-model.md`
