import { Actor } from 'apify';

import { fetchPageService, parsePageService } from './services/services.js';
import { sendResultsToTelegram } from './telegram.js';

await Actor.init();
// Fetch the HTML content of the page.
const html = await fetchPageService.fetch();

// Extract all headings from the page (tag name and text).
const results = parsePageService.parse(html);

await sendResultsToTelegram(results);

await Actor.pushData(results);
await Actor.exit();
