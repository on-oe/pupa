import { definePageTweak } from '@pupa/app';

export const summary = definePageTweak({
  name: 'summary',
  input: './summary.js',
});

export const train = definePageTweak({
  name: 'train',
  input: './train',
  once: true,
});
