import type { AppConfig, TelegramConfig } from './schema.js';
import { AppEnvSchema, TelegramEnvSchema } from './schema.js';

export function loadAppConfig(
  rawEnv: NodeJS.ProcessEnv = process.env,
): AppConfig {
  return AppEnvSchema.parse({
    BVK_URL: rawEnv.BVK_URL,
  });
}

export function loadTelegramConfig(
  rawEnv: NodeJS.ProcessEnv = process.env,
): TelegramConfig {
  return TelegramEnvSchema.parse({
    TELEGRAM_BOT_TOKEN: rawEnv.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: rawEnv.TELEGRAM_CHAT_ID,
    TELEGRAM_DRY_RUN: rawEnv.TELEGRAM_DRY_RUN,
  });
}
