import assert from 'node:assert/strict';
import test from 'node:test';

import axios from 'axios';

import { sendResultsToTelegram, sendTelegramMessage } from './telegram.js';

const baseConfig = {
  TELEGRAM_BOT_TOKEN: 'token',
  TELEGRAM_CHAT_ID: '-42',
  TELEGRAM_DRY_RUN: false,
} as const;

void test('sendTelegramMessage posts HTML payload', async () => {
  const originalPost = axios.post;
  let capturedUrl = '';
  let payload: Record<string, unknown> | null = null;

  axios.post = (async (url, data) => {
    capturedUrl = String(url);
    payload = data as Record<string, unknown>;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendTelegramMessage('<b>Hello</b>', { ...baseConfig });

    assert.equal(capturedUrl, 'https://api.telegram.org/bottoken/sendMessage');
    assert.deepEqual(payload, {
      chat_id: '-42',
      text: '<b>Hello</b>',
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } finally {
    axios.post = originalPost;
  }
});

void test('sendTelegramMessage skips blank messages', async () => {
  const originalPost = axios.post;
  let called = false;

  axios.post = (async (..._args) => {
    called = true;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendTelegramMessage('   ', { ...baseConfig });
    assert.equal(called, false);
  } finally {
    axios.post = originalPost;
  }
});

void test('sendTelegramMessage logs dry run message', async () => {
  const originalInfo = console.info;
  const originalPost = axios.post;
  let loggedPrefix: string | null = null;
  let loggedMessage = '';

  console.info = (first: unknown, ...rest: unknown[]) => {
    loggedPrefix = String(first);
    loggedMessage = rest.map((value) => String(value)).join(' ');
  };
  axios.post = (async (..._args) => {
    throw new Error('Should not be called');
  }) as typeof axios.post;

  try {
    await sendTelegramMessage('<b>Hello</b>', {
      ...baseConfig,
      TELEGRAM_DRY_RUN: true,
    });

    assert.match(loggedPrefix ?? '', /Dry run enabled/);
    assert.equal(loggedMessage, '<b>Hello</b>');
  } finally {
    console.info = originalInfo;
    axios.post = originalPost;
  }
});

void test('sendResultsToTelegram skips empty results', async () => {
  await sendResultsToTelegram([]);
});

void test('sendResultsToTelegram posts formatted message', async () => {
  const originalPost = axios.post;
  const originalEnv = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    dryRun: process.env.TELEGRAM_DRY_RUN,
  };

  process.env.TELEGRAM_BOT_TOKEN = 'token';
  process.env.TELEGRAM_CHAT_ID = '-42';
  process.env.TELEGRAM_DRY_RUN = 'false';

  let capturedUrl = '';
  let payload: Record<string, unknown> | null = null;

  axios.post = (async (url, data) => {
    capturedUrl = String(url);
    payload = data as Record<string, unknown>;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    await sendResultsToTelegram([
      {
        date: new Date(Date.UTC(2025, 10, 13)),
        title: 'Sample outage',
        text: 'Some details here',
        html: '<p>Some details here</p>',
        addresses: [],
      },
    ]);

    assert.equal(capturedUrl, 'https://api.telegram.org/bottoken/sendMessage');
    assert.ok(payload);
    const message = payload as { chat_id: string; text: string };
    assert.equal(message.chat_id, '-42');
    assert.match(message.text, /Sample outage/);
  } finally {
    axios.post = originalPost;
    process.env.TELEGRAM_BOT_TOKEN = originalEnv.token;
    process.env.TELEGRAM_CHAT_ID = originalEnv.chatId;
    process.env.TELEGRAM_DRY_RUN = originalEnv.dryRun;
  }
});
