import type { ParsePageResultItem } from './services/parse-page/parse-page.js';
import { telegramService } from './services/services.js';
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

  await telegramService.sendMessage(message);
}
