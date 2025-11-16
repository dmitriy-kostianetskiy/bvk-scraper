import axios from 'axios';

import type { TelegramConfig } from '../../config/schema.js';

export interface TelegramService {
  sendMessage(message: string): Promise<void>;
}

export function createTelegramService({
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  TELEGRAM_DRY_RUN,
}: TelegramConfig): TelegramService {
  return {
    async sendMessage(message) {
      if (!message.trim()) {
        console.info('[telegram] message is empty, skipping send');
        return;
      }

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
    },
  };
}
