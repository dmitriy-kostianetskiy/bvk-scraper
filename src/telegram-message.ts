import type { ParsePageResultItem } from './parse-page.js';

const DETAILS_URL = 'https://www.bvk.rs/kvarovi-na-mrezi';

export function formatResultsMessage(results: ParsePageResultItem[]): string {
  if (results.length === 0) {
    return 'Nema prijavljenih kvarova.';
  }

  const sections = results.map((item) => {
    const dateLabel = `<b>Datum:</b> ${escapeHtml(formatDate(item.date))}`;
    const titleValue = item.title ? escapeHtml(item.title) : 'Nepoznato';
    const titleLabel = `<b>Naslov:</b> ${titleValue}`;
    const detailsValue = escapeHtml(item.text || 'Nema dodatnih detalja.');
    const detailsLabel = `<b>Detalji:</b>\n${detailsValue}`;

    return [dateLabel, titleLabel, detailsLabel].join('\n');
  });

  const body = sections.join('\n\n');
  const footer = `Više detalja ovde: <a href="${DETAILS_URL}">ovde</a>`;

  return `${body}\n\n${footer}`;
}

function formatDate(date: Date | null): string {
  if (!date) {
    return 'N/A';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
