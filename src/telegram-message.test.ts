import assert from 'node:assert/strict';
import test from 'node:test';

import type { ParsePageResultItem } from './parse-page.js';
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
    {
      label: 'Савски венац: Војводе Миленка 36',
      url: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%B2%D1%81%D0%BA%D0%B8+%D0%B2%D0%B5%D0%BD%D0%B0%D1%86+%D0%92%D0%BE%D1%98%D0%B2%D0%BE%D0%B4%D0%B5+%D0%9C%D0%B8%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0+36',
    },
  ],
};

void test('formatResultsMessage returns HTML with link footer', () => {
  const message = formatResultsMessage([baseResult]);

  assert.match(message, /<b>Datum:<\/b> 13\.11\.2025/);
  assert.match(message, /<b>Naslov:<\/b> До 22:00/);
  assert.ok(!message.includes('<b>Detalji:</b>'));
  assert.match(
    message,
    /<b>Adrese:<\/b>\n• <a href="https:\/\/www\.google\.com\/maps\/place\/[^>]+">Стари град: Булевар деспота Стефана 9<\/a>/,
  );
  assert.match(
    message,
    /• <a href="https:\/\/www\.google\.com\/maps\/place\/[^>]+">Савски венац: Војводе Миленка 36<\/a>/,
  );
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
    addresses: [
      {
        label: 'Label with <tag>',
        url: 'https://maps.test/foo?bar="baz"',
      },
    ],
  };

  const message = formatResultsMessage([tricky]);

  assert.ok(!message.includes('<script>'));
  assert.match(message, /&lt;script&gt;/);
  assert.match(message, /Line with &lt;tag&gt; &amp; &quot;quotes&quot;/);
  assert.match(
    message,
    /<a href="https:\/\/maps\.test\/foo\?bar=&quot;baz&quot;">Label with &lt;tag&gt;<\/a>/,
  );
});

void test('formatResultsMessage keeps non-address details when present', () => {
  const mixed: ParsePageResultItem = {
    ...baseResult,
    text: 'Информације о радовима\nСтари град: Булевар деспота Стефана 9',
  };

  const message = formatResultsMessage([mixed]);

  assert.match(message, /<b>Detalji:<\/b>\nИнформације о радовима/);
  const [beforeAddresses] = message.split('<b>Adrese:</b>');
  assert.ok(!beforeAddresses.includes('Стари град: Булевар деспота Стефана 9'));
});

void test('formatResultsMessage handles empty dataset', () => {
  const message = formatResultsMessage([]);
  assert.equal(message, 'Nema prijavljenih kvarova.');
});
