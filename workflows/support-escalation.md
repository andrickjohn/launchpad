# Workflow: Support Escalation

## Note: For personal tool, "support" = error handling and self-help

## Trigger: Error occurs anywhere in the app

## Steps:

### Step 1: Error Classification
- API error (external service down)
- Validation error (user input issue)
- Auth error (session/permission issue)
- Data error (inconsistency detected)
- Unknown error

### Step 2: Auto-Recovery (if possible)
- API error → retry with backoff (max 3 attempts)
- Auth error → redirect to re-login
- Validation error → show inline error message

### Step 3: User Notification
- Toast notification with:
  - What happened (plain English)
  - What to do (actionable step)
  - Severity indicator (info/warning/error)

### Step 4: Logging
- Log full error to activity feed
- Include: timestamp, action, error type, auto-recovery result
- For recurring errors: surface pattern in daily report
