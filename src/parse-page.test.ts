import assert from 'node:assert/strict';
import test from 'node:test';

import { parsePage } from './parse-page.js';

const sectionOne = `
<section itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <div itemprop="name" data-title="13.11.2025.">13.11.2025.</div>
  <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <h1>До 22:00</h1>
      <ul>
        <li>Стари град: Булевар деспота Стефана 9</li>
        <li>Савски венац: Војводе Миленка 36</li>
        <li>Вождовац: Ђорђа Кратовца 50а</li>
      </ul>
    </div>
  </div>
</section>
`;

const sectionTwo = `
<section itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <div itemprop="name">14.11.2025.</div>
  <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <h1>До 10:00</h1>
      <p>Други блок садржаја.</p>
    </div>
  </div>
</section>
`;

const singleSectionHtml = `
<div itemtype="https://schema.org/FAQPage">
  ${sectionOne}
</div>
`;

const multiSectionHtml = `
<div itemtype="https://schema.org/FAQPage">
  ${sectionOne}
  ${sectionTwo}
</div>
`;

void test('parsePage extracts date, title, text, html, and addresses', () => {
  const result = parsePage(singleSectionHtml);

  assert.equal(result.length, 1);

  const [first] = result;

  assert.ok(first.date instanceof Date, 'expected a Date instance');
  assert.equal(first.date?.toISOString().slice(0, 10), '2025-11-13');
  assert.equal(first.title, 'До 22:00');
  assert.ok(
    !first.text.includes('До 22:00'),
    'expected text to exclude the title line',
  );

  const expectedLines = [
    'Стари град: Булевар деспота Стефана 9',
    'Савски венац: Војводе Миленка 36',
    'Вождовац: Ђорђа Кратовца 50а',
  ];

  for (const line of expectedLines) {
    assert.ok(first.text.includes(line), `expected text to include "${line}"`);
  }

  assert.ok(first.html.includes('<ul>'));
  assert.equal(first.addresses.length, 3);
  assert.deepEqual(first.addresses[0], {
    label: 'Стари град: Булевар деспота Стефана 9',
    url: 'https://www.google.com/maps/place/%D0%A1%D1%82%D0%B0%D1%80%D0%B8+%D0%B3%D1%80%D0%B0%D0%B4+%D0%91%D1%83%D0%BB%D0%B5%D0%B2%D0%B0%D1%80+%D0%B4%D0%B5%D1%81%D0%BF%D0%BE%D1%82%D0%B0+%D0%A1%D1%82%D0%B5%D1%84%D0%B0%D0%BD%D0%B0+9',
  });
});

void test('parsePage handles multiple sections', () => {
  const result = parsePage(multiSectionHtml);

  assert.equal(result.length, 2);

  const [first, second] = result;

  assert.ok(first.date instanceof Date);
  assert.ok(second.date instanceof Date);
  assert.equal(first.date?.toISOString().slice(0, 10), '2025-11-13');
  assert.equal(second.date?.toISOString().slice(0, 10), '2025-11-14');
  assert.equal(second.title, 'До 10:00');
  assert.ok(second.text.includes('Други блок садржаја.'));
  assert.equal(second.addresses.length, 0);
});
