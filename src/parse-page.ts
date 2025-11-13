import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

export type ParsePageResultItem = {
  date: Date | null;
  title: string;
  text: string;
  html: string;
};

const QUESTION_SELECTOR = 'section[itemtype="https://schema.org/Question"]';
const ANSWER_SELECTOR = '[itemprop="acceptedAnswer"] [itemprop="text"]';

export function parsePage(html: string): ParsePageResultItem[] {
  const $ = load(html);
  const results: ParsePageResultItem[] = [];

  $(QUESTION_SELECTOR).each((_i, element) => {
    const $section = $(element);
    const $answer = $section.find(ANSWER_SELECTOR).first();

    if (!$answer.length) {
      return;
    }

    const rawHtml = ($answer.html() ?? '').trim();
    const { title, text } = extractTitleAndText($answer, $);
    const date = extractDate($section);

    if (!title && !text && !date) {
      return;
    }

    results.push({
      date,
      title,
      text,
      html: rawHtml,
    });
  });

  return results;
}

function extractTitleAndText(
  $answer: Cheerio<Element>,
  root: CheerioAPI,
): { title: string; text: string } {
  const answerClone = $answer.clone();
  const heading = answerClone
    .find('h1')
    .filter((_i, el) => root(el).text().trim().length > 0)
    .first();

  const title = heading.length ? heading.text().trim() : '';

  if (heading.length) {
    heading.remove();
  }

  const text = normalizeWhitespace(answerClone.text());

  return { title, text };
}

function extractDate($section: Cheerio<Element>): Date | null {
  const rawText = $section.find('[itemprop="name"]').first().text().trim();
  const dataTitle = $section
    .find('[itemprop="name"]')
    .first()
    .attr('data-title');
  const source = rawText || dataTitle || '';

  const match = source.match(/(\d{1,2}\.\d{1,2}\.\d{4})/);
  if (!match) {
    return null;
  }

  const normalized = match[1].replace(/\.+$/, '');
  const parts = normalized.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map((segment) =>
    Number.parseInt(segment, 10),
  );
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n');
}
