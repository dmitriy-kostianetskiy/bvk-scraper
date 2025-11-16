import type { ParsePageResultItem } from './parse-page.js';
import { parsePage } from './parse-page.js';

export interface ParsePageService {
  parse(html: string): ParsePageResultItem[];
}

export function createParsePageService(): ParsePageService {
  return {
    parse(html: string) {
      return parsePage(html);
    },
  };
}
