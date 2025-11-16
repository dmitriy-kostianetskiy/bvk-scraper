import assert from 'node:assert/strict';
import test from 'node:test';

import axios from 'axios';

import { createTelegramService } from './telegram-service.js';

const baseConfig = {
  TELEGRAM_BOT_TOKEN: 'token',
  TELEGRAM_CHAT_ID: '-42',
  TELEGRAM_DRY_RUN: false,
} as const;

void test('telegram service posts HTML payload', async () => {
  const originalPost = axios.post;
  let capturedUrl = '';
  let payload: Record<string, unknown> | null = null;

  axios.post = (async (url, data) => {
    capturedUrl = String(url);
    payload = data as Record<string, unknown>;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    const service = createTelegramService(baseConfig);
    await service.sendMessage('<b>Hello</b>');

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

void test('telegram service skips blank messages', async () => {
  const originalPost = axios.post;
  let called = false;

  axios.post = (async (..._args) => {
    called = true;
    return { data: {} } as const;
  }) as typeof axios.post;

  try {
    const service = createTelegramService(baseConfig);
    await service.sendMessage('   ');
    assert.equal(called, false);
  } finally {
    axios.post = originalPost;
  }
});

void test('telegram service logs dry run message', async () => {
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
    const service = createTelegramService({
      ...baseConfig,
      TELEGRAM_DRY_RUN: true,
    });

    await service.sendMessage('<b>Hello</b>');

    assert.match(loggedPrefix ?? '', /Dry run enabled/);
    assert.equal(loggedMessage, '<b>Hello</b>');
  } finally {
    console.info = originalInfo;
    axios.post = originalPost;
  }
});
