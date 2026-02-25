# Test Specification: Email System (Outreach Screen)

## Acceptance Criteria
- [ ] Compose email with rich text editor
- [ ] Send email via Resend API
- [ ] Create 3-step email sequence with delays
- [ ] Schedule individual emails for future send
- [ ] Draft queue shows AI-generated emails awaiting approval
- [ ] Approve/reject/edit drafts before sending
- [ ] Template library: create, edit, delete, use templates
- [ ] Variable substitution: {{first_name}}, {{company}}, etc.
- [ ] Social draft area: LinkedIn, Reddit, Facebook tabs with copy button
- [ ] AI "Draft cold email" and "Draft Reddit reply" buttons work
- [ ] Daily send limit enforced (100 for free tier)

## Unit Tests
- Test: template variable substitution → Expected: all vars replaced
- Test: template with missing required var → Expected: error listing missing vars
- Test: email validation (valid address) → Expected: passes
- Test: email validation (invalid address) → Expected: fails with message
- Test: sequence step scheduling calculates correct send times → Expected: correct timestamps

## Integration Tests
- Test: send email via Resend API (mock) → Expected: 200, record in email_sends table
- Test: create sequence → Expected: sequence and steps stored
- Test: scheduler picks up due emails → Expected: sends them, updates status
- Test: draft creation via Claude Haiku (mock) → Expected: draft in queue

## E2E Tests
- Flow: compose email → select prospect → send → see in activity feed
- Flow: create template → use template for new email → variables filled
- Flow: create sequence → assign to prospect → see scheduled sends
- Flow: click "Draft cold email" for prospect → see draft in queue → approve → send
- Flow: social tab → click "Draft Reddit reply" → see draft → copy button works

## Security Tests
- Test: email body with script tag → Expected: sanitized before send
- Test: unauthorized user attempts send → Expected: 401

## Edge Cases
- Send when Resend API is down → queued for retry, user notified
- 100th email of the day → warning shown, 101st blocked with message
- Sequence step for deleted prospect → step skipped, logged

## What "Done" Looks Like
User can compose and send emails, build sequences, review AI drafts, and manage
templates all from one screen. Social drafts are in separate tabs with copy buttons.
Everything tracks to the prospect timeline.
