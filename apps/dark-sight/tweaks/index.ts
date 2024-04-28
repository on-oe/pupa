import { definePageTweak } from '@pupa/app';

export const init = definePageTweak({
  name: 'init',
  input: './start.js',
  runAt: 'document-start',
});

export const start = definePageTweak({
  name: 'start',
  input: './start.js',
});

export const end = definePageTweak({
  name: 'end',
  input: './end.js',
});
