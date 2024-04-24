import { defineSlashCommand } from '@pupa/app';

export default defineSlashCommand({
  name: '护眼',
  description: '通过调整屏幕亮度和色温，保护你的眼睛。',
  execute: async (interaction) => {
    interaction.execPageFn('start');
  },
});
