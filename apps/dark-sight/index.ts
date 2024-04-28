import { createApp } from '@pupa/app';

const app = await createApp({
  name: '暗黑护眼师',
  description: '通过调整屏幕亮度和色温，保护你的眼睛。',
  icon: 'https://raw.githubusercontent.com/darkreader/darkreader.github.io/master/images/darkreader-mascot.svg',
});

app.serve();
