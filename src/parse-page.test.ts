import assert from 'node:assert/strict';
import test from 'node:test';

import { parsePage } from './parse-page.js';

const input = `<div  class='togglecontainer av-mhxhabhi-5401490386254e6e8c1da514f5d47910 av-elegant-toggle  avia-builder-el-4  el_after_av_textblock  el_before_av_heading  kvr'  itemscope="itemscope" itemtype="https://schema.org/FAQPage" >
<section class='av_toggle_section av-mhxhaac9-5b99bf5a1687961e2065020a44cd3e9c'  itemscope="itemscope" itemprop="mainEntity" itemtype="https://schema.org/Question" ><div role="tablist" class="single_toggle" data-tags="{Све} "  ><p id='toggle-toggle-id-1' data-fake-id='#toggle-id-1' class='toggler  av-title-above '  itemprop="name"  role='tab' tabindex='0' aria-controls='toggle-id-1' data-slide-speed="200" data-title="13.11.2025." data-title-open="" data-aria_collapsed="Click to expand: 13.11.2025." data-aria_expanded="Click to collapse: 13.11.2025.">13.11.2025.<span class="toggle_icon"><span class="vert_icon"></span><span class="hor_icon"></span></span></p><div id='toggle-id-1' aria-labelledby='toggle-toggle-id-1' role='region' class='toggle_wrap  av-title-above'   itemscope="itemscope" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer" ><div class='toggle_content invers-color '  itemprop="text" ><h1></h1>
<blockquote>
<h1><strong>До 22:00</strong></h1>
</blockquote>
<ul>
<li><strong>Стари град:</strong> Булевар деспота Стефана 9</li>
<li><strong>Савски венац:</strong> Војводе Миленка 36</li>
<li><strong>Врачар:</strong> Његошева 13</li>
<li><strong>Палилула:</strong> Јастребачка 44, Братства и јединства 44 &#8211; Борча</li>
<li><strong>Звездара: </strong>Булевар краља Александра 199а</li>
<li><strong>Вождовац:</strong> Ђорђа Кратовца 50а, Булевар патријарха Германа 80 &#8211; Пиносава</li>
<li><strong>Чукарица:</strong> Липа 14, 1. маја 51 &#8211; Велика Моштаница, Карађорђева 95 &#8211; Умка</li>
<li><strong>Раковица:</strong> Голи брег 16а</li>
<li><strong>Нови Београд:</strong> Народних хероја 63, Јурија Гагарина бб</li>
<li><strong>Земун:</strong> Карађорђев трг 5</li>
<li><strong>Гроцка:</strong> 22. децембра 1 &#8211; Калуђерица</li>
<li><strong>Барајево:</strong> Мике Ћурчића 19 &#8211; Баћевац</li>
<li><strong>Сурчин:</strong> Иве Андрића 11 &#8211; Бечмен</li>
</ul>
</div></div></div></section>
</div>`;

void test('parsePage extracts date, title, and text content', () => {
  const result = parsePage(input);

  assert.equal(result.length, 1);

  const [first] = result;

  assert.ok(first.date instanceof Date, 'expected a Date instance');
  assert.equal(first.date?.toISOString().slice(0, 10), '2025-11-13');
  assert.equal(first.title, 'До 22:00');
  assert.ok(
    !first.text.includes('До 22:00'),
    'expected text to exclude the title line',
  );

  assert.ok(
    first.text.includes('Стари град: Булевар деспота Стефана 9'),
    'expected text to contain first location',
  );

  const expectedLines = [
    'Стари град: Булевар деспота Стефана 9',
    'Савски венац: Војводе Миленка 36',
    'Вождовац: Ђорђа Кратовца 50а, Булевар патријарха Германа 80 – Пиносава',
  ];

  for (const line of expectedLines) {
    assert.ok(first.text.includes(line), `expected text to include "${line}"`);
  }

  assert.ok(first.html.includes('<ul>'));
});

const multiInput = `${input}
<section class='av_toggle_section' itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <div role="tablist" class="single_toggle">
    <p itemprop="name">14.11.2025.</p>
    <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <div itemprop="text">
        <h1>До 10:00</h1>
        <p>Други блок садржаја.</p>
      </div>
    </div>
  </div>
</section>`;

void test('parsePage handles multiple sections', () => {
  const result = parsePage(
    `<div itemtype="https://schema.org/FAQPage">${multiInput}</div>`,
  );

  assert.equal(result.length, 2);

  const [first, second] = result;

  assert.ok(first.date instanceof Date);
  assert.ok(second.date instanceof Date);
  assert.equal(first.date?.toISOString().slice(0, 10), '2025-11-13');
  assert.equal(second.date?.toISOString().slice(0, 10), '2025-11-14');
  assert.equal(second.title, 'До 10:00');
  assert.ok(second.text.includes('Други блок садржаја.'));
});
