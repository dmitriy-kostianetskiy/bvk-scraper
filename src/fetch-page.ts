import axios from 'axios';

import { loadAppConfig } from './config/env.js';

export async function fetchPage(url?: string): Promise<string> {
  const targetUrl = url ?? loadAppConfig().BVK_URL;

  const response = await axios.get<string>(targetUrl);
  return response.data;
}
