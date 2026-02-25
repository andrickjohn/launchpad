# Skill: API Development — LaunchPad

## API Route Pattern
All API routes go in `src/app/api/` using Next.js App Router conventions.

## Standard Route Template
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  // define expected input
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const validated = requestSchema.parse(body)

    // Business logic here

    return NextResponse.json({ data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('[API_NAME]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## External API Integration Pattern
For Apify, Resend, Anthropic, Reddit — wrap each in a service class in `src/lib/services/`:
- `src/lib/services/apify.ts`
- `src/lib/services/resend.ts`
- `src/lib/services/anthropic.ts`
- `src/lib/services/reddit.ts`

Each service class:
- Takes config from environment variables
- Has typed request/response interfaces
- Has error handling with meaningful messages
- Has a mock mode for development (set via MOCK_APIS=true env var)
- Logs all calls for debugging
