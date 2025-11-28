
// Self-contained geocoding test script
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

async function testGeocode(address, city, state, country) {
    console.log(`\n--- Testing geocode for: ${address}, ${city}, ${state}, ${country} ---`);

    let query = [address, city, state, country].filter(Boolean).join(', ');
    console.log(`Query 1: ${query}`);

    try {
        const url1 = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
            q: query,
            format: 'json',
            limit: '1',
            addressdetails: '1',
        });

        console.log(`Fetching: ${url1}`);
        const res1 = await fetch(url1, {
            headers: { 'User-Agent': 'RosterUp Test Script' }
        });

        if (res1.ok) {
            const data1 = await res1.json();
            console.log('Result 1:', data1.length > 0 ? 'FOUND' : 'NOT FOUND');
            if (data1.length > 0) {
                console.log('Coordinates:', data1[0].lat, data1[0].lon);
                console.log('Display Name:', data1[0].display_name);
                return;
            }
        } else {
            console.log('Error 1:', res1.status, res1.statusText);
        }

        // Fallback
        console.log('Trying fallback...');
        let query2 = [city, state, country].filter(Boolean).join(', ');
        console.log(`Query 2: ${query2}`);

        const url2 = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
            q: query2,
            format: 'json',
            limit: '1',
            addressdetails: '1',
        });

        console.log(`Fetching: ${url2}`);
        const res2 = await fetch(url2, {
            headers: { 'User-Agent': 'RosterUp Test Script' }
        });

        if (res2.ok) {
            const data2 = await res2.json();
            console.log('Result 2:', data2.length > 0 ? 'FOUND' : 'NOT FOUND');
            if (data2.length > 0) {
                console.log('Coordinates:', data2[0].lat, data2[0].lon);
                console.log('Display Name:', data2[0].display_name);
            }
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

// Run tests
(async () => {
    // User's specific address
    await testGeocode('315 Bridge Street', 'Westampton', 'NJ', 'USA');

    // Variation: Westampton Township (common in NJ)
    await testGeocode('315 Bridge Street', 'Westampton Township', 'NJ', 'USA');
})();
