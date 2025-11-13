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
    const cleanedDetails = stripAddressOnlyLines(
      item.text ?? '',
      item.addresses ?? [],
    );
    const detailsLabel = buildDetailsSection(
      cleanedDetails,
      item.addresses ?? [],
    );
    const addressesLabel = formatAddresses(item.addresses ?? []);

    return [dateLabel, titleLabel, detailsLabel, addressesLabel]
      .filter((value) => value.length > 0)
      .join('\n');
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

function formatAddresses(addresses: ParsePageResultItem['addresses']): string {
  if (addresses.length === 0) {
    return '';
  }

  const lines = addresses.map(({ label, url }) => {
    const safeLabel = escapeHtml(label);
    const safeUrl = escapeHtml(url);
    return `• <a href="${safeUrl}">${safeLabel}</a>`;
  });

  return `<b>Adrese:</b>\n${lines.join('\n')}`;
}

function buildDetailsSection(
  details: string,
  addresses: ParsePageResultItem['addresses'],
): string {
  if (details) {
    return `<b>Detalji:</b>\n${escapeHtml(details)}`;
  }

  if (addresses.length === 0) {
    return `<b>Detalji:</b>\n${escapeHtml('Nema dodatnih detalja.')}`;
  }

  return '';
}

function stripAddressOnlyLines(
  text: string,
  addresses: ParsePageResultItem['addresses'],
): string {
  if (!text) {
    return '';
  }

  const labelSet = new Set(
    addresses.map((address) => normalizeLine(address.label)),
  );
  const addressMarkers = new Set(['adrese:', 'адресе:', 'adresa:', 'адреса:']);

  const filtered = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => {
      const normalized = normalizeLine(line);
      if (labelSet.has(normalized)) {
        return false;
      }

      if (addressMarkers.has(normalized.toLowerCase())) {
        return false;
      }

      return true;
    });

  return filtered.join('\n');
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}
