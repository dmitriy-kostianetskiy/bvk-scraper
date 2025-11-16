import axios from 'axios';

import { loadTelegramConfig } from './config/env.js';
import type { TelegramConfig } from './config/schema.js';
import type { ParsePageResultItem } from './parse-page.js';
import { formatResultsMessage } from './telegram-message.js';

export async function sendResultsToTelegram(
  results: ParsePageResultItem[],
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  const message = formatResultsMessage(results);

  if (!message.trim()) {
    return;
  }

  await sendTelegramMessage(message);
}

export async function sendTelegramMessage(
  message: string,
  config: TelegramConfig = loadTelegramConfig(),
): Promise<void> {
  if (!message.trim()) {
    console.info('[telegram] message is empty, skipping send');
    return;
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_DRY_RUN } = config;

  if (TELEGRAM_DRY_RUN) {
    console.info('[telegram] Dry run enabled, message would be:', message);
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}
