import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testImageUpload() {
  console.log('🧪 Testing image upload after RLS policy fix...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // Login with existing player account
    console.log('🔐 Logging in...');
    await page.fill('input[type="email"]', 'testplayer@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    console.log('✅ Logged in successfully');

    // Navigate to profile
    console.log('📍 Navigating to profile...');
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Enable edit mode
    console.log('✏️  Enabling edit mode...');
    const editButton = page.locator('button:has-text("Edit Profile"), button:has-text("Edit")').first();
    await editButton.click();
    await page.waitForTimeout(1000);

    // Click on Photos tab
    console.log('📸 Opening Photos tab...');
    const photosTab = page.locator('button:has-text("Photos")');
    await photosTab.click();
    await page.waitForTimeout(1000);

    // Take screenshot before upload
    await page.screenshot({ path: 'before-upload.png' });
    console.log('📸 Screenshot saved: before-upload.png');

    // Find file input and upload
    console.log('📤 Uploading test image...');
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, 'test-upload.jpg');

    await fileInput.setInputFiles(testImagePath);

    // Wait for upload to complete (look for progress bar to disappear)
    console.log('⏳ Waiting for upload to complete...');
    await page.waitForTimeout(5000);

    // Check console for errors
    const logs = [];
    page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));

    // Take screenshot after upload
    await page.screenshot({ path: 'after-upload.png' });
    console.log('📸 Screenshot saved: after-upload.png');

    // Check if image appears in gallery
    const images = await page.locator('img[src*="player-media"]').count();

    if (images > 0) {
      console.log(`\n✅ SUCCESS! Found ${images} image(s) in gallery`);
      console.log('🎉 Image upload is working correctly!');

      // Get the image URL to verify
      const imgSrc = await page.locator('img[src*="player-media"]').first().getAttribute('src');
      console.log(`📷 Image URL: ${imgSrc}`);
    } else {
      console.log('\n⚠️  No images found in gallery yet');
      console.log('Checking for error messages...');

      const errorDiv = await page.locator('[class*="red"], [class*="error"]').first();
      if (await errorDiv.count() > 0) {
        const errorText = await errorDiv.textContent();
        console.log('❌ Error found:', errorText);
      }

      // Check console logs
      const errors = logs.filter(log => log.type === 'error');
      if (errors.length > 0) {
        console.log('\n❌ Console errors:');
        errors.forEach(err => console.log('  -', err.text));
      }
    }

    console.log('\n⏸️  Browser will stay open for 10 seconds so you can inspect...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
  }
}

testImageUpload();
