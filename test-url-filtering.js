// Test URL filtering logic (same as in WebsiteImporter.tsx)

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function parseManualUrls(text) {
  return text
    .split('\n')
    .map(url => url.trim())
    .filter(url => {
      if (!url || !validateUrl(url)) {
        console.log(`❌ Invalid/empty: ${url || '(empty line)'}`);
        return false;
      }

      // Filter out common file extensions that aren't pages
      const fileExtensions = /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp4|mp3|css|js|json|xml|ico)$/i;
      if (fileExtensions.test(url)) {
        console.warn(`⚠️  Skipping non-page file: ${url}`);
        return false;
      }

      console.log(`✅ Valid page URL: ${url}`);
      return true;
    });
}

// Test with the user's actual URL list (including the image file)
const testInput = `https://newjerseygators.com/
https://newjerseygators.com/2024-nj-gators-fall-youth-football-travel-teams/
https://newjerseygators.com/teams/2024-10u-gray-gators/
https://newjerseygators.com/teams/2024-10u-messick-gators/
https://newjerseygators.com/wp-content/uploads/2022/01/John-Biasi-Memorial-Scholarship-Fund-.jpg
https://newjerseygators.com/john-biasi-memorial-scholarship-fund/
https://newjerseygators.com/njgcollegecommitments/
https://newjerseygators.com/contact/
https://newjerseygators.com/forms/
https://newjerseygators.com/league-history/`;

console.log('🧪 Testing URL Filtering\n');
console.log('========================================');
console.log('INPUT URLs:\n');

const parsed = parseManualUrls(testInput);

console.log('\n========================================');
console.log(`\n📊 RESULTS:`);
console.log(`  Total input URLs: ${testInput.split('\n').filter(l => l.trim()).length}`);
console.log(`  Valid page URLs: ${parsed.length}`);
console.log(`  Filtered out: ${testInput.split('\n').filter(l => l.trim()).length - parsed.length}`);
console.log('\n✅ Final URL list:');
parsed.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
