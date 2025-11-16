import assert from 'node:assert/strict';
import test from 'node:test';

import { createParsePageService } from './parse-page-service.js';

const sampleHtml = `
<section itemtype="https://schema.org/Question">
  <div itemprop="acceptedAnswer">
    <div itemprop="text">
      <h1>Title</h1>
      <p>Some details</p>
    </div>
  </div>
</section>
`;

void test('parsePageService.parse returns parsed results', () => {
  const service = createParsePageService();

  const results = service.parse(sampleHtml);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.title, 'Title');
  assert.equal(results[0]?.text, 'Some details');
});
