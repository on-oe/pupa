import type { User } from '@pupa/universal/types';
import { fetcher } from './fetcher';

async function getCUID() {
  const result = await chrome.storage.local.get('cuid');
  if (result.cuid) {
    return result.cuid;
  }
  const cuid = generateId();
  await chrome.storage.local.set({ cuid });
  return cuid;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

class Admin {
  info?: User;

  get isLogin() {
    return !!this.info;
  }

  get isAnonymous() {
    return this.info?.anonymous;
  }

  async login() {
    const cuid = await getCUID();
    chrome.cookies.set({
      url: import.meta.env.VITE_API_URL,
      name: 'cuid',
      value: cuid,
    });
    this.info = await fetcher.getUser();
  }
}

export const admin = new Admin();
