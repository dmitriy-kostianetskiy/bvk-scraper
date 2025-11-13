import axios from 'axios';

import type { ParsePageResultItem } from './parse-page.js';

// eslint-disable-next-line prefer-destructuring
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// eslint-disable-next-line prefer-destructuring
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export function formatResultsMessage(results: ParsePageResultItem[]): string {
  if (results.length === 0) {
    return 'No outages reported.';
  }

  return results
    .map((item) => {
      const dateLabel = formatDate(item.date);
      const titleLabel = item.title ? `Title: ${item.title}` : 'Title: N/A';
      const body = item.text || 'No additional details.';

      return [dateLabel, titleLabel, body].join('\n');
    })
    .join('\n\n');
}

export async function sendResultsToTelegram(
  results: ParsePageResultItem[],
): Promise<void> {
  const message = formatResultsMessage(results);

  if (!message.trim()) {
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  });
}

function formatDate(date: Date | null): string {
  if (!date) {
    return 'Date: N/A';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `Date: ${day}.${month}.${year}`;
}
