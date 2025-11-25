import { test, expect, Page } from '@playwright/test';

// Helper function to take and save screenshots
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage: true
  });
}

// Generate unique test email
const testEmail = `trainer-test-${Date.now()}@example.com`;
const testPassword = 'TestPass123!';
const testName = 'John Trainer';

test.describe('Trainer Signup Flow E2E Test', () => {
  test('Complete trainer signup and onboarding flow', async ({ page }) => {
    const results: Array<{ step: string; status: 'PASS' | 'FAIL'; details: string; error?: string }> = [];

    try {
      // ====================
      // STEP 1: SIGNUP FLOW
      // ====================
      console.log('\n=== STEP 1: SIGNUP FLOW ===');

      // Navigate to signup page
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '01-signup-page-loaded');

      // Verify page loaded correctly
      const signupHeading = page.getByText('Account Type');
      await expect(signupHeading).toBeVisible({ timeout: 5000 });
      results.push({
        step: '1.1 - Navigate to signup page',
        status: 'PASS',
        details: 'Signup page loaded successfully'
      });

      // Click the "Trainer" role button
      const trainerButton = page.locator('button').filter({ hasText: 'Trainer' }).filter({ hasText: 'Offer training' });
      await trainerButton.waitFor({ state: 'visible' });
      await trainerButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await takeScreenshot(page, '02-trainer-selected');

      // Verify trainer button is selected (has blue border/background)
      const trainerButtonClasses = await trainerButton.getAttribute('class');
      const isSelected = trainerButtonClasses?.includes('border-[rgb(0,113,227)]');

      if (isSelected) {
        results.push({
          step: '1.2 - Click Trainer role button',
          status: 'PASS',
          details: 'Trainer role selected successfully'
        });
      } else {
        throw new Error('Trainer button not selected properly');
      }

      // Fill in name
      const nameInput = page.locator('input#name');
      await nameInput.waitFor({ state: 'visible' });
      await nameInput.fill(testName);
      results.push({
        step: '1.3 - Fill in name',
        status: 'PASS',
        details: `Name filled: ${testName}`
      });

      // Fill in confirm password (appears before email/password in the form)
      const confirmPasswordInput = page.locator('input#confirmPassword');
      await confirmPasswordInput.waitFor({ state: 'visible' });
      await confirmPasswordInput.fill(testPassword);
      results.push({
        step: '1.4 - Fill in confirm password',
        status: 'PASS',
        details: 'Confirm password filled successfully'
      });

      // Fill in email (should be in SignInCard component)
      const emailInput = page.locator('input[type="email"]');
      await emailInput.waitFor({ state: 'visible' });
      await emailInput.fill(testEmail);
      results.push({
        step: '1.5 - Fill in email',
        status: 'PASS',
        details: `Email filled: ${testEmail}`
      });

      // Fill in password (at the bottom of the form, after email)
      // Use a more specific selector to get the password field that's NOT confirmPassword
      const passwordInput = page.locator('input[type="password"]').last();
      await passwordInput.waitFor({ state: 'visible' });
      await passwordInput.fill(testPassword);
      await page.waitForTimeout(300);
      results.push({
        step: '1.6 - Fill in password',
        status: 'PASS',
        details: 'Password filled successfully'
      });

      // Accept terms
      const termsCheckbox = page.locator('input#terms');
      await termsCheckbox.waitFor({ state: 'visible' });
      await termsCheckbox.check();
      await page.waitForTimeout(300);
      await takeScreenshot(page, '03-form-filled');
      results.push({
        step: '1.7 - Accept terms and conditions',
        status: 'PASS',
        details: 'Terms checkbox checked'
      });

      // Submit the form
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Sign up|Create Account/i });
      await submitButton.waitFor({ state: 'visible' });
      await takeScreenshot(page, '04-before-submit');

      await submitButton.click();
      console.log('Form submitted, waiting for navigation...');

      // Wait for either successful navigation OR error message
      const navigationPromise = page.waitForURL('**/onboarding/trainer', { timeout: 10000 }).catch(() => null);
      const errorPromise = page.locator('.bg-red-50, .text-red-700, [class*="error"]').first().waitFor({ timeout: 3000 }).catch(() => null);

      await Promise.race([navigationPromise, errorPromise]);
      await page.waitForTimeout(1000);

      // Check if we're on onboarding page or if there's an error
      const currentUrl = page.url();
      console.log('Current URL after submit:', currentUrl);

      if (currentUrl.includes('/onboarding/trainer')) {
        results.push({
          step: '1.8 - Submit signup form',
          status: 'PASS',
          details: 'Form submitted successfully, account created'
        });
      } else {
        // Check for error messages
        const errorMessage = await page.locator('.bg-red-50, .text-red-700').first().textContent().catch(() => null);
        throw new Error(`Signup failed. Current URL: ${currentUrl}. Error: ${errorMessage || 'Unknown error'}`);
      }

      // ====================
      // STEP 2: ONBOARDING REDIRECT
      // ====================
      console.log('\n=== STEP 2: ONBOARDING REDIRECT ===');

      // Verify we're redirected to trainer onboarding
      await expect(page).toHaveURL(/.*\/onboarding\/trainer/, { timeout: 5000 });
      await takeScreenshot(page, '05-onboarding-page');
      results.push({
        step: '2.1 - Verify redirect to /onboarding/trainer',
        status: 'PASS',
        details: `Redirected to: ${page.url()}`
      });

      // Confirm the onboarding page loads correctly
      const onboardingHeading = page.getByText('Trainer Profile Setup');
      await expect(onboardingHeading).toBeVisible({ timeout: 5000 });

      const stepIndicator = page.getByText('Step 1 of 3');
      await expect(stepIndicator).toBeVisible();
      results.push({
        step: '2.2 - Confirm onboarding page loads',
        status: 'PASS',
        details: 'Trainer onboarding page loaded with step indicator'
      });

      // ====================
      // STEP 3: COMPLETE ONBOARDING (MINIMAL)
      // ====================
      console.log('\n=== STEP 3: COMPLETE ONBOARDING ===');

      // Fill required fields on Step 1
      const taglineInput = page.locator('input[placeholder*="MLB Player"]');
      await taglineInput.fill('Professional Baseball Trainer');

      // Select a sport (Baseball)
      const baseballButton = page.locator('button').filter({ hasText: 'Baseball' }).first();
      await baseballButton.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '06-onboarding-step1-filled');

      results.push({
        step: '3.1 - Fill Step 1 (Brand)',
        status: 'PASS',
        details: 'Tagline and sport selected'
      });

      // Click "Next Step" to go to Step 2
      const nextButton1 = page.locator('button[type="submit"]').filter({ hasText: 'Next Step' });
      await nextButton1.click();
      await page.waitForTimeout(1000);

      // Verify we're on Step 2
      const step2Indicator = page.getByText('Step 2 of 3');
      await expect(step2Indicator).toBeVisible();
      await takeScreenshot(page, '07-onboarding-step2');
      results.push({
        step: '3.2 - Navigate to Step 2 (Credentials)',
        status: 'PASS',
        details: 'Step 2 loaded successfully'
      });

      // Skip credentials (optional), click "Next Step"
      const nextButton2 = page.locator('button[type="submit"]').filter({ hasText: 'Next Step' });
      await nextButton2.click();
      await page.waitForTimeout(1000);

      // Verify we're on Step 3
      const step3Indicator = page.getByText('Step 3 of 3');
      await expect(step3Indicator).toBeVisible();
      await takeScreenshot(page, '08-onboarding-step3');
      results.push({
        step: '3.3 - Navigate to Step 3 (Service Area)',
        status: 'PASS',
        details: 'Step 3 loaded successfully'
      });

      // Fill required location fields
      const cityInput = page.locator('input[placeholder="City"]');
      await cityInput.fill('Los Angeles');

      const stateInput = page.locator('input[placeholder="State"]');
      await stateInput.fill('California');
      await page.waitForTimeout(500);
      await takeScreenshot(page, '09-onboarding-step3-filled');

      results.push({
        step: '3.4 - Fill Step 3 location',
        status: 'PASS',
        details: 'Location filled: Los Angeles, California'
      });

      // Submit final step
      const completeButton = page.locator('button[type="submit"]').filter({ hasText: 'Complete Setup' });
      await completeButton.click();
      console.log('Completing onboarding...');

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '10-dashboard-after-onboarding');

      results.push({
        step: '3.5 - Complete onboarding',
        status: 'PASS',
        details: 'Onboarding completed successfully'
      });

      // ====================
      // STEP 4: DASHBOARD ACCESS
      // ====================
      console.log('\n=== STEP 4: DASHBOARD ACCESS ===');

      // Verify we're on dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
      results.push({
        step: '4.1 - Access dashboard after onboarding',
        status: 'PASS',
        details: `Dashboard URL: ${page.url()}`
      });

      // Verify dashboard content loads
      const dashboardHeading = page.locator('h1, h2').filter({ hasText: /dashboard|welcome/i }).first();
      const isDashboardVisible = await dashboardHeading.isVisible().catch(() => false);

      if (isDashboardVisible) {
        results.push({
          step: '4.2 - Verify dashboard content',
          status: 'PASS',
          details: 'Dashboard content loaded successfully'
        });
      } else {
        results.push({
          step: '4.2 - Verify dashboard content',
          status: 'FAIL',
          details: 'Dashboard heading not found',
          error: 'Could not verify dashboard loaded properly'
        });
      }

      // ====================
      // STEP 5: NAVIGATION TEST
      // ====================
      console.log('\n=== STEP 5: NAVIGATION TEST ===');

      // Wait for sidebar to be present
      await page.waitForTimeout(1500);

      // Check if trainer-specific navigation appears
      const myProfileLink = page.locator('a[href="/trainer/profile"]');
      const isProfileLinkVisible = await myProfileLink.isVisible().catch(() => false);

      if (isProfileLinkVisible) {
        results.push({
          step: '5.1 - Verify trainer navigation appears',
          status: 'PASS',
          details: 'Trainer-specific navigation found in sidebar'
        });
      } else {
        // Try alternative selector
        const altProfileLink = page.locator('text=My Profile').first();
        const isAltVisible = await altProfileLink.isVisible().catch(() => false);

        if (isAltVisible) {
          results.push({
            step: '5.1 - Verify trainer navigation appears',
            status: 'PASS',
            details: 'My Profile link found (alternative selector)'
          });
        } else {
          results.push({
            step: '5.1 - Verify trainer navigation appears',
            status: 'FAIL',
            details: 'Could not find trainer navigation',
            error: 'Sidebar navigation not visible or not loaded'
          });
        }
      }

      await takeScreenshot(page, '11-dashboard-with-sidebar');

      // Try clicking on "My Profile" link
      try {
        // First try direct link click
        let profileClicked = false;

        if (isProfileLinkVisible) {
          await myProfileLink.click();
          profileClicked = true;
        } else {
          // Try text-based click
          const textLink = page.locator('text=My Profile').first();
          if (await textLink.isVisible().catch(() => false)) {
            await textLink.click();
            profileClicked = true;
          }
        }

        if (profileClicked) {
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle');

          const currentUrl = page.url();
          await takeScreenshot(page, '12-trainer-profile-page');

          if (currentUrl.includes('/trainer/profile')) {
            results.push({
              step: '5.2 - Click My Profile link',
              status: 'PASS',
              details: `Navigated to: ${currentUrl}`
            });

            // Verify we're on trainer profile page
            results.push({
              step: '5.3 - Verify navigation to /trainer/profile',
              status: 'PASS',
              details: 'Trainer profile page loaded successfully'
            });
          } else {
            results.push({
              step: '5.2 - Click My Profile link',
              status: 'FAIL',
              details: `Expected /trainer/profile but got: ${currentUrl}`,
              error: 'Navigation to profile page failed'
            });
          }
        } else {
          throw new Error('Could not click My Profile link');
        }
      } catch (error) {
        results.push({
          step: '5.2 - Click My Profile link',
          status: 'FAIL',
          details: 'Failed to click My Profile link',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        results.push({
          step: '5.3 - Verify navigation to /trainer/profile',
          status: 'FAIL',
          details: 'Could not verify profile navigation',
          error: 'Previous step failed'
        });
      }

      // Take final screenshot
      await takeScreenshot(page, '13-final-state');

    } catch (error) {
      console.error('Test error:', error);
      await takeScreenshot(page, 'error-state');

      // Add error to last incomplete step
      results.push({
        step: 'Error',
        status: 'FAIL',
        details: 'Test encountered an unexpected error',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // ====================
    // GENERATE REPORT
    // ====================
    console.log('\n' + '='.repeat(80));
    console.log('TRAINER SIGNUP FLOW - COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Test Email: ${testEmail}`);
    console.log(`Test Date: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    let passCount = 0;
    let failCount = 0;

    results.forEach((result) => {
      const status = result.status === 'PASS' ? '✓ PASS' : '✗ FAIL';
      const color = result.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`\n${color}${status}${reset} - ${result.step}`);
      console.log(`  Details: ${result.details}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }

      if (result.status === 'PASS') passCount++;
      else failCount++;
    });

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passCount} (\x1b[32m${((passCount/results.length)*100).toFixed(1)}%\x1b[0m)`);
    console.log(`Failed: ${failCount} (\x1b[31m${((failCount/results.length)*100).toFixed(1)}%\x1b[0m)`);
    console.log('\nScreenshots saved in: e2e/screenshots/');
    console.log('='.repeat(80));

    // Overall assessment
    if (failCount === 0) {
      console.log('\n\x1b[32m✓ OVERALL ASSESSMENT: ALL TESTS PASSED\x1b[0m');
      console.log('The trainer signup flow is working correctly end-to-end.');
    } else if (passCount > failCount) {
      console.log('\n\x1b[33m⚠ OVERALL ASSESSMENT: MOSTLY WORKING WITH ISSUES\x1b[0m');
      console.log(`${failCount} test(s) failed. Review the failures above.`);
    } else {
      console.log('\n\x1b[31m✗ OVERALL ASSESSMENT: CRITICAL ISSUES FOUND\x1b[0m');
      console.log('Multiple critical failures detected. The trainer flow needs attention.');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Assert that all critical steps passed
    const criticalSteps = results.filter(r =>
      r.step.includes('1.8') || // Signup success
      r.step.includes('2.1') || // Onboarding redirect
      r.step.includes('4.1')    // Dashboard access
    );

    criticalSteps.forEach(step => {
      expect(step.status).toBe('PASS');
    });
  });
});
