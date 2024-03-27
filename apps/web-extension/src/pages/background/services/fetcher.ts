import type { BaseFetcher } from "../fetcher/base-fetcher";
import { ClientFetcher } from "../fetcher/client-fetcher";

function getFetcher(): BaseFetcher {
  return new ClientFetcher();
}

export const fetcher = getFetcher();
