import assert from 'node:assert/strict';
import test from 'node:test';

import type { ParsePageResultItem } from './parse-page.js';
import { formatResultsMessage } from './telegram-message.js';

const baseResult: ParsePageResultItem = {
  date: new Date(Date.UTC(2025, 10, 13)),
  title: 'До 22:00',
  text: 'Стари град: Булевар деспота Стефана 9\nСавски венац: Војводе Миленка 36',
  html: '<ul><li>Example</li></ul>',
};

void test('formatResultsMessage returns HTML with link footer', () => {
  const message = formatResultsMessage([baseResult]);

  assert.match(message, /<b>Datum:<\/b> 13\.11\.2025/);
  assert.match(message, /<b>Naslov:<\/b> До 22:00/);
  assert.match(message, /Стари град: Булевар деспота Стефана 9<br>/);
  assert.match(
    message,
    /Više detalja ovde: <a href="https:\/\/www\.bvk\.rs\/kvarovi-na-mrezi">ovde<\/a>/,
  );
});

void test('formatResultsMessage escapes HTML special characters', () => {
  const tricky: ParsePageResultItem = {
    ...baseResult,
    title: '<script>',
    text: 'Line with <tag> & "quotes"',
  };

  const message = formatResultsMessage([tricky]);

  assert.ok(!message.includes('<script>'));
  assert.match(message, /&lt;script&gt;/);
  assert.match(message, /Line with &lt;tag&gt; &amp; &quot;quotes&quot;/);
});

void test('formatResultsMessage handles empty dataset', () => {
  const message = formatResultsMessage([]);
  assert.equal(message, 'Nema prijavljenih kvarova.');
});
