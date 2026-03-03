import { expect, test } from '@playwright/test'

test('CRM page loads and displays Contacts table', async ({ page }) => {
  await page.goto('/')
  // Assuming magic link login sets proper state for tests
  await page.goto('/crm')
  await expect(page.getByRole('heading', { name: 'Contacts CRM' })).toBeVisible()
  
  // Verify Search and Filter exist
  await expect(page.getByPlaceholder('Search contacts...')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible()
})
