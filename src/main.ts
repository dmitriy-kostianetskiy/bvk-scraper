import { Actor } from 'apify';
import axios from 'axios';

import { parsePage } from './parse-page.js';
import { sendResultsToTelegram } from './telegram.js';

await Actor.init();

type Input = {
  url: string;
};

const input = await Actor.getInput<Input>();

if (!input) {
  throw new Error('Input is missing!');
}

const { url } = input;

// Fetch the HTML content of the page.
const response = await axios.get(url);

// Extract all headings from the page (tag name and text).
const results = parsePage(response.data);

await sendResultsToTelegram(results);

await Actor.pushData(results);
await Actor.exit();
