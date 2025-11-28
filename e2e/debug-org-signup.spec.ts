import { test, expect } from '@playwright/test';

test('debug organization signup flow', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error(`PAGE ERROR: ${error.message}`);
  });

  // Listen for failed requests
  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Listen for responses
  page.on('response', async response => {
    if (response.status() >= 400) {
      console.error(`ERROR RESPONSE: ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.error(`Response body: ${body}`);
      } catch (e) {
        // Ignore
      }
    }
  });

  // Navigate to signup page
  console.log('Navigating to signup page...');
  await page.goto('http://localhost:5173/signup');
  await page.waitForLoadState('networkidle');

  // Take a screenshot
  await page.screenshot({ path: 'signup-page.png', fullPage: true });
  console.log('Screenshot saved: signup-page.png');

  // Select Organization
  console.log('Selecting organization user type...');
  await page.click('text=Organization');
  await page.waitForTimeout(500);

  // Fill in the form
  const timestamp = Date.now();
  const email = `testorg${timestamp}@test.com`;
  console.log(`Using email: ${email}`);

  console.log('Filling form...');
  await page.fill('input[type="text"]', 'Test Organization');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'testpass123');

  // Find confirm password field
  const passwordFields = await page.locator('input[type="password"]').all();
  if (passwordFields.length > 1) {
    await passwordFields[1].fill('testpass123');
  }

  // Accept terms
  await page.click('input[type="checkbox"]');

  // Take screenshot before submit
  await page.screenshot({ path: 'before-submit.png', fullPage: true });
  console.log('Screenshot saved: before-submit.png');

  // Submit the form
  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  // Wait for either error or navigation
  console.log('Waiting for response...');
  await page.waitForTimeout(5000);

  // Take screenshot after submit
  await page.screenshot({ path: 'after-submit.png', fullPage: true });
  console.log('Screenshot saved: after-submit.png');

  // Check URL
  console.log(`Current URL: ${page.url()}`);

  // Check for error message
  const errorMessage = await page.locator('text=/Failed to create account|error/i').first().textContent().catch(() => null);
  if (errorMessage) {
    console.error(`Error message found: ${errorMessage}`);
  }

  // Get all visible text
  const bodyText = await page.locator('body').textContent();
  console.log('Page content:', bodyText?.substring(0, 500));
});
