import { ApiFetcher } from '../fetcher/api-fetcher';
import type { BaseFetcher } from '../fetcher/base-fetcher';

function getFetcher(): BaseFetcher {
  return new ApiFetcher();
}

export const fetcher = getFetcher();
