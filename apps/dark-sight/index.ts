import { createApp } from '@pupa/app';

const app = createApp({
  name: '暗黑护眼师',
  description: '通过调整屏幕亮度和色温，保护你的眼睛。',
  icon: 'https://raw.githubusercontent.com/darkreader/darkreader.github.io/master/images/darkreader-mascot.svg',
  onPing: (interaction) => {
    interaction.end('请问您要如何调整页面亮度和色温？');
  },
});

app.serve();
