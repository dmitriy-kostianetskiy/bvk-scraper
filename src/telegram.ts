import axios from 'axios';

import type { ParsePageResultItem } from './parse-page.js';
import { formatResultsMessage } from './telegram-message.js';

export type TelegramConfig = {
  token: string;
  chatId: string | number;
};

export async function sendTelegramMessage(
  config: TelegramConfig,
  message: string,
): Promise<void> {
  if (!message.trim()) {
    return;
  }

  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;

  await axios.post(url, {
    chat_id: config.chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

export async function sendResultsToTelegram(
  results: ParsePageResultItem[],
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  const config = getTelegramConfigFromEnv();

  if (!config) {
    return;
  }

  const message = formatResultsMessage(results);

  if (!message.trim()) {
    return;
  }

  await sendTelegramMessage(config, message);
}

export function getTelegramConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TelegramConfig | null {
  const token = getEnvVariable(env, 'TELEGRAM_BOT_TOKEN');
  const chatId = getEnvVariable(env, 'TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return null;
  }

  return {
    token,
    chatId,
  };
}

function getEnvVariable(
  env: NodeJS.ProcessEnv,
  key: string,
): string | undefined {
  const raw = env[key];
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
