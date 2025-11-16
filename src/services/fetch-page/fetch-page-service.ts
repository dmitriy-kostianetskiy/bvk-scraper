import axios from 'axios';

import type { AppConfig } from '../../config/schema.js';

export interface FetchPageService {
  fetch(): Promise<string>;
}

export function createFetchPageService({
  BVK_URL,
}: AppConfig): FetchPageService {
  return {
    async fetch() {
      const response = await axios.get<string>(BVK_URL);
      return response.data;
    },
  };
}
