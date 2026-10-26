const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'screenshots');

async function captureAll() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  try {
    // Fetch events list to find available vs full events
    const eventsRes = await fetch('http://localhost:5000/api/events?limit=50');
    const eventsData = await eventsRes.json();
    const availableEvent = eventsData.data.find(e => e.remainingSeats > 5);
    const fullEvent = eventsData.data.find(e => e.isFull === true || e.remainingSeats === 0);

    // 1. Homepage
    console.log('Capturing 01-homepage.png...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png') });

    // 2. Events List
    console.log('Capturing 02-events-list.png...');
    await page.goto('http://localhost:5173/events', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-events-list.png') });

    // 3. Event Search & Filter
    console.log('Capturing 03-event-search-filter.png...');
    await page.goto('http://localhost:5173/events?category=Sports', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-event-search-filter.png') });

    // 4. Event Details
    console.log('Capturing 04-event-details.png...');
    await page.goto(`http://localhost:5173/events/${availableEvent.id}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-event-details.png') });

    // 5. Successful Registration
    console.log('Capturing 05-registration-success.png...');
    const randomEmail = `shivamsh.${Date.now()}@campus.edu`;
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.type('input[type="text"]', 'Shivamsh Anil Menon');
    await page.type('input[type="email"]', randomEmail);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-registration-success.png') });

    // 6. Validation Error (Duplicate Registration)
    console.log('Capturing 06-validation-error.png...');
    await page.goto(`http://localhost:5173/events/${availableEvent.id}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.type('input[type="text"]', 'Shivamsh Anil Menon');
    await page.type('input[type="email"]', randomEmail); // duplicate email!
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-validation-error.png') });

    // 7. Full Event Status
    if (fullEvent) {
      console.log('Capturing full event view...');
      await page.goto(`http://localhost:5173/events/${fullEvent.id}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-full-event-state.png') });
    }

    // 8. Clubs Listing
    console.log('Capturing 07-clubs.png...');
    await page.goto('http://localhost:5173/clubs', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-clubs.png') });

    // 9. Organizer Dashboard
    console.log('Capturing 08-organizer-dashboard.png...');
    await page.goto('http://localhost:5173/organizer', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-organizer-dashboard.png') });

    // 10. Database and Test Proof Page
    console.log('Capturing 09-api-health.png...');
    await page.goto('http://localhost:5000/api/health', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-api-health.png') });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

captureAll();
