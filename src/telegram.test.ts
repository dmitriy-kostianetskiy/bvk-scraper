import assert from 'node:assert/strict';
import test from 'node:test';

import axios from 'axios';

import type { ParsePageResultItem } from './parse-page.js';
import {
  getTelegramConfigFromEnv,
  sendResultsToTelegram,
  sendTelegramMessage,
} from './telegram.js';
import { formatResultsMessage } from './telegram-message.js';

const baseResult: ParsePageResultItem = {
  date: new Date(Date.UTC(2025, 10, 13)),
  title: 'До 22:00',
  text: 'Стари град: Булевар деспота Стефана 9\nСавски венац: Војводе Миленка 36',
  html: '<ul><li>Example</li></ul>',
  addresses: [
    {
      label: 'Стари град: Булевар деспота Стефана 9',
      url: 'https://www.google.com/maps/place/%D0%A1%D1%82%D0%B0%D1%80%D0%B8+%D0%B3%D1%80%D0%B0%D0%B4+%D0%91%D1%83%D0%BB%D0%B5%D0%B2%D0%B0%D1%80+%D0%B4%D0%B5%D1%81%D0%BF%D0%BE%D1%82%D0%B0+%D0%A1%D1%82%D0%B5%D1%84%D0%B0%D0%BD%D0%B0+9',
    },
  ],
};

void test('sendTelegramMessage posts HTML payload', async () => {
  const originalPost = axios.post;
  let capturedUrl = '';
  let capturedPayload: Record<string, unknown> | null = null;

  axios.post = (async (url, payload) => {
    capturedUrl = url;
    capturedPayload = payload as Record<string, unknown>;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendTelegramMessage(
      { token: 'abc', chatId: '-1001' },
      '<b>Hello</b>',
    );

    assert.equal(capturedUrl, 'https://api.telegram.org/botabc/sendMessage');
    assert.deepEqual(capturedPayload, {
      chat_id: '-1001',
      text: '<b>Hello</b>',
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } finally {
    axios.post = originalPost;
  }
});

void test('sendTelegramMessage ignores blank messages', async () => {
  const originalPost = axios.post;
  let called = false;

  axios.post = (async (..._args) => {
    called = true;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendTelegramMessage({ token: 'abc', chatId: '-1001' }, '   ');
    assert.equal(called, false);
  } finally {
    axios.post = originalPost;
  }
});

void test('getTelegramConfigFromEnv reads trimmed values', () => {
  const env = {
    TELEGRAM_BOT_TOKEN: ' token ',
    TELEGRAM_CHAT_ID: ' 123 ',
  } as NodeJS.ProcessEnv;

  const config = getTelegramConfigFromEnv(env);
  assert.deepEqual(config, { token: 'token', chatId: '123' });
});

void test('sendResultsToTelegram posts formatted message', async () => {
  const originalEnvToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalEnvChatId = process.env.TELEGRAM_CHAT_ID;
  const originalPost = axios.post;
  let payloadMessage = '';

  process.env.TELEGRAM_BOT_TOKEN = 'abc';
  process.env.TELEGRAM_CHAT_ID = '-42';

  axios.post = (async (_url, payload) => {
    payloadMessage = (payload as { text: string }).text;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendResultsToTelegram([baseResult]);
    const expected = formatResultsMessage([baseResult]);
    assert.equal(payloadMessage, expected);
  } finally {
    axios.post = originalPost;
    process.env.TELEGRAM_BOT_TOKEN = originalEnvToken;
    process.env.TELEGRAM_CHAT_ID = originalEnvChatId;
  }
});

void test('sendResultsToTelegram skips when no results', async () => {
  const originalEnvToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalEnvChatId = process.env.TELEGRAM_CHAT_ID;
  const originalPost = axios.post;

  process.env.TELEGRAM_BOT_TOKEN = 'abc';
  process.env.TELEGRAM_CHAT_ID = '-42';

  let called = false;
  axios.post = (async (..._args) => {
    called = true;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendResultsToTelegram([]);
    assert.equal(called, false);
  } finally {
    axios.post = originalPost;
    process.env.TELEGRAM_BOT_TOKEN = originalEnvToken;
    process.env.TELEGRAM_CHAT_ID = originalEnvChatId;
  }
});
