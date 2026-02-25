# Test Specification: Full Integration

## The Complete Flow Test
This tests the entire product end-to-end as a real user would use it.

## Acceptance Criteria
- [ ] Complete flow: sign up → create campaign → wizard generates brief → import prospects → score → draft outreach → approve → send → track on dashboard
- [ ] All three screens share data correctly
- [ ] Activity feed reflects all actions across screens
- [ ] Metrics on dashboard are accurate after the flow

## E2E Test
```
1. Sign up with email
2. Land on Prospects screen (empty state)
3. Create new campaign — enter product description
4. Campaign Wizard generates launch brief
5. Import CSV of prospects
6. Click "Score these prospects" — scores appear
7. Navigate to Outreach screen
8. Select prospect, click "Draft cold email" — draft appears in queue
9. Review draft, edit subject line, approve
10. Send the email
11. Navigate to Dashboard
12. See: 1 campaign active, X prospects, 1 email sent
13. Activity feed shows all actions in order
14. Click on activity item — navigates to relevant detail
```

## What "Done" Looks Like
A user can go from zero to sending their first outreach email in under 5 minutes,
with AI assistance at every step. Everything they do is tracked and visible on
the dashboard.
