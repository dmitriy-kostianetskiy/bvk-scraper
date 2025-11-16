import { Actor } from 'apify';

import { fetchPage } from './fetch-page.js';
import { parsePage } from './parse-page.js';
import { sendResultsToTelegram } from './telegram.js';

await Actor.init();
// Fetch the HTML content of the page.
const html = await fetchPage();

// Extract all headings from the page (tag name and text).
const results = parsePage(html);

await sendResultsToTelegram(results);

await Actor.pushData(results);
await Actor.exit();
