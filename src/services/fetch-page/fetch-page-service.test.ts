import assert from 'node:assert/strict';
import test from 'node:test';

import axios from 'axios';

import { createFetchPageService } from './fetch-page-service.js';

void test('fetchPageService.fetch returns HTML content', async () => {
  const originalGet = axios.get;
  let requestedUrl = '';

  axios.get = (async (url) => {
    requestedUrl = String(url);
    return { data: '<html>content</html>' } as const;
  }) as typeof axios.get;

  try {
    const service = createFetchPageService({ BVK_URL: 'https://example.com' });
    const html = await service.fetch();

    assert.equal(requestedUrl, 'https://example.com');
    assert.equal(html, '<html>content</html>');
  } finally {
    axios.get = originalGet;
  }
});
