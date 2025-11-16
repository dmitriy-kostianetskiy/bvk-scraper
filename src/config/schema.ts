import { z } from 'zod';

export const AppEnvSchema = z.object({
  BVK_URL: z.string().trim().min(1, 'BVK_URL is required'),
});

export type AppConfig = z.infer<typeof AppEnvSchema>;

export const TelegramEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().trim().min(1),
  TELEGRAM_CHAT_ID: z.string().trim().min(1),
  TELEGRAM_DRY_RUN: z
    .preprocess(
      (value) => {
        if (value === undefined || value === null) {
          return undefined;
        }

        if (typeof value === 'boolean') {
          return value;
        }

        const normalized = String(value).trim().toLowerCase();

        if (normalized.length === 0) {
          return undefined;
        }

        if (normalized === 'true') {
          return true;
        }

        if (normalized === 'false') {
          return false;
        }

        return value;
      },
      z.boolean({ message: 'TELEGRAM_DRY_RUN must be "true" or "false".' }),
    )
    .optional()
    .default(false),
});

export type TelegramConfig = z.infer<typeof TelegramEnvSchema>;
