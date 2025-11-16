import { loadAppConfig, loadTelegramConfig } from '../config/env.js';
import { createFetchPageService } from './fetch-page/fetch-page-service.js';
import { createParsePageService } from './parse-page/parse-page-service.js';
import { createTelegramService } from './telegram/telegram-service.js';

const appConfig = loadAppConfig();
const telegramConfig = loadTelegramConfig();

export const fetchPageService = createFetchPageService(appConfig);
export const parsePageService = createParsePageService();
export const telegramService = createTelegramService(telegramConfig);
