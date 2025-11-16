import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

export type ParsePageResultItem = {
  date: Date | null;
  title: string;
  text: string;
  html: string;
  addresses: ParsedAddress[];
};

export type ParsedAddress = {
  municipality: string | null;
  label: string;
  url: string;
};

const QUESTION_SELECTOR = 'section[itemtype="https://schema.org/Question"]';
const ANSWER_SELECTOR = '[itemprop="acceptedAnswer"] [itemprop="text"]';

const MUNICIPALITIES = [
  'Чукарица',
  'Нови Београд',
  'Палилула',
  'Раковица',
  'Савски венац',
  'Стари град',
  'Вождовац',
  'Врачар',
  'Земун',
  'Звездара',
  'Барајево',
  'Гроцка',
  'Лазаревац',
  'Младеновац',
  'Обреновац',
  'Сопот',
  'Сурчин',
] as const;

const MUNICIPALITY_PATTERNS = MUNICIPALITIES.map((name) => ({
  name,
  regex: new RegExp(`^${escapeRegExp(name)}\\s*:\\s*`, 'i'),
}));

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
    const { title, text, addresses } = extractTitleTextAndAddresses($answer, $);
    const date = extractDate($section);

    if (!title && !text && !date && addresses.length === 0) {
      return;
    }

    results.push({
      date,
      title,
      text,
      html: rawHtml,
      addresses,
    });
  });

  return results;
}

function extractTitleTextAndAddresses(
  $answer: Cheerio<Element>,
  root: CheerioAPI,
): { title: string; text: string; addresses: ParsedAddress[] } {
  const answerClone = $answer.clone();
  const heading = answerClone
    .find('h1')
    .filter((_i, el) => root(el).text().trim().length > 0)
    .first();

  const title = heading.length ? heading.text().trim() : '';

  if (heading.length) {
    heading.remove();
  }

  const addresses = extractAddresses(answerClone, root);
  const text = normalizeWhitespace(answerClone.text());

  return { title, text, addresses };
}

function extractAddresses(
  $context: Cheerio<Element>,
  root: CheerioAPI,
): ParsedAddress[] {
  const addresses: ParsedAddress[] = [];

  $context.find('ul li').each((_i, li) => {
    const label = normalizeWhitespace(root(li).text());
    if (!label) {
      return;
    }

    const { municipality, remainder } = extractMunicipality(label);
    const query = remainder || label;
    const url = buildMapsUrl(query);

    addresses.push({ municipality, label, url });
  });

  return addresses;
}

function extractMunicipality(label: string): {
  municipality: string | null;
  remainder: string;
} {
  const trimmed = label.trim();

  for (const { name, regex } of MUNICIPALITY_PATTERNS) {
    const match = trimmed.match(regex);
    if (match) {
      const remainder = trimmed.slice(match[0].length).trim();
      return { municipality: name, remainder };
    }
  }

  return { municipality: null, remainder: trimmed };
}

function buildMapsUrl(label: string): string {
  const query = label.replace(/[:–]/g, ' ').replace(/\s+/g, ' ').trim();
  const encoded = encodeURIComponent(query).replace(/%20/g, '+');
  return `https://www.google.com/maps/place/${encoded}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
