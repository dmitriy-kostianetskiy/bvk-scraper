import { Actor } from 'apify';
import axios from 'axios';

import { parsePage } from './parse-page.js';
import { sendResultsToTelegram } from './telegram.js';

await Actor.init();

// Fetch the HTML content of the page.
const response = await axios.get(process.env.BVK_URL);

// Extract all headings from the page (tag name and text).
const results = parsePage(response.data);

await sendResultsToTelegram(results);

await Actor.pushData(results);
await Actor.exit();
