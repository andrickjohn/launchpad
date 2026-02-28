# Manual Test Checklist for Draft Campaigns Fix

## Test Environment
- **Local URL**: http://localhost:3000
- **Server Status**: ✅ Running on port 3000
- **Environment**: Cloud Supabase

## Pre-Test Verification
✅ Code changes made:
  - Added `revalidatePath('/prospects')` to campaigns API route
  - Replaced all `alert()` calls with toast notifications  
  - Added Toast components to CampaignWizard
  - Removed `router.refresh()` (not needed with revalidatePath)

## Test Steps

### 1. Authentication
- [ ] Open http://localhost:3000 in browser
- [ ] If not logged in, go to /login
- [ ] Enter email and request magic link
- [ ] Check email/Supabase and click magic link
- [ ] Verify redirect to prospects page after auth

### 2. Create Draft Campaign
- [ ] Navigate to http://localhost:3000/campaigns/new
- [ ] Fill in Step 1 (Campaign Info):
  - Campaign Name: "Test Draft Fix [timestamp]"
- [ ] Click "Next" to go to Step 2
- [ ] Fill in Step 2 (Product Details):
  - Product Description: "Test product"
  - Target Buyer: "Test buyers"
  - Price: "$100"
  - Geography: "USA"
- [ ] Click "Save Draft" button

### 3. Verify Fix - What Should Happen
- [ ] ✅ Green success toast appears saying "Draft saved successfully!"
- [ ] ❌ NO alert popup (old behavior removed)
- [ ] ✅ Automatic redirect to /prospects page
- [ ] ✅ Yellow "Draft Campaigns" section is visible
- [ ] ✅ Your draft campaign appears in the list
- [ ] ✅ "Edit Draft" button is present

### 4. Verify Old Issues Are Fixed
- [ ] ❌ NO browser alert() popup appears
- [ ] ✅ Draft appears immediately without manual refresh
- [ ] ✅ Professional toast notification instead of alert

## Expected Results

### Success Criteria (ALL must pass):
1. No alert popups appear at any point
2. Green success toast shows after clicking "Save Draft"
3. Page redirects to /prospects automatically
4. Draft Campaigns section (yellow box) is visible
5. The saved draft appears in the yellow section
6. "Edit Draft" button is present for the draft

### Failure Indicators (NONE should happen):
1. Browser alert popup appears
2. No toast notification
3. Draft section doesn't appear
4. "No prospects yet" message still showing
5. Need to manually refresh to see draft

## Screenshot Evidence Required
1. Campaign wizard with filled details (before Save Draft)
2. Success toast after clicking Save Draft
3. Prospects page showing yellow Draft Campaigns section
4. Close-up of draft campaign in the list

## After Test
- [ ] Delete test draft campaigns from database if needed
- [ ] Verify no console errors in browser dev tools
- [ ] Check network tab for successful API calls
- [ ] Confirm no TypeScript errors in terminal
