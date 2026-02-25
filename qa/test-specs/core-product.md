# Test Specification: Core Product (Prospects Screen)

## Acceptance Criteria
- [ ] Prospect list displays with sorting (name, score, date added, status)
- [ ] Filtering by campaign, score range, status
- [ ] CSV import parses Apify output and generic CSV formats
- [ ] Manual prospect entry with validation
- [ ] Prospect detail view shows full touchpoint timeline
- [ ] "Score these prospects" calls Claude Haiku and updates scores
- [ ] "Find more like these" suggests sources and optionally triggers Apify
- [ ] Campaign Setup Wizard generates complete launch brief from description

## Unit Tests
- Test: CSV parser handles Apify format → Expected: correct field mapping
- Test: CSV parser handles generic CSV → Expected: correct field mapping
- Test: CSV parser handles malformed CSV → Expected: error with line numbers
- Test: prospect validation rejects empty email → Expected: validation error
- Test: prospect validation accepts valid data → Expected: passes

## Integration Tests
- Test: create prospect via API → Expected: appears in database
- Test: import CSV via API → Expected: all rows created in database
- Test: score prospects via API → Expected: Claude Haiku called (mock), scores stored
- Test: create campaign with wizard → Expected: launch brief generated and stored

## E2E Tests
- Flow: upload CSV → see import progress → prospects appear in list → sort by name
- Flow: click "Add Prospect" → fill form → save → appears in list
- Flow: click prospect → see detail → see timeline of all touchpoints
- Flow: select all → click "Score" → see scoring progress → scores update
- Flow: create new campaign → enter description → wizard generates brief → review brief
- Viewport: all of above at desktop, tablet, mobile

## Security Tests
- Test: CSV with script injection in fields → Expected: sanitized, no XSS
- Test: prospect create with SQL in name field → Expected: escaped, stored safely

## Edge Cases
- Import CSV with 10,000 rows → paginated, not frozen
- Import CSV with missing columns → partial import with warnings
- Score prospects when Anthropic API is down → graceful error, retry option
- Empty prospect list → helpful empty state with CTA

## What "Done" Looks Like
User can import a CSV of prospects, see them in a clean sortable list, click into
any prospect to see their full history, score them with AI, and use the Campaign
Wizard to generate a complete launch playbook for any product/industry.
