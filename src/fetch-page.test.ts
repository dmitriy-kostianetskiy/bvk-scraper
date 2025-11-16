import assert from 'node:assert/strict';
import test from 'node:test';

import axios from 'axios';

import { fetchPage } from './fetch-page.js';

void test('fetchPage returns HTML content', async () => {
  const originalGet = axios.get;
  let requestedUrl = '';

  axios.get = (async (url) => {
    requestedUrl = String(url);
    return { data: '<html>content</html>' } as const;
  }) as typeof axios.get;

  try {
    const html = await fetchPage('https://example.com');

    assert.equal(requestedUrl, 'https://example.com');
    assert.equal(html, '<html>content</html>');
  } finally {
    axios.get = originalGet;
  }
});
