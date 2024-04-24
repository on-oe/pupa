import { defineSlashCommand } from '@pupa/app';

export default defineSlashCommand({
  name: '关闭护眼',
  description: '关闭护眼模式',
  execute: async (interaction) => {
    interaction.execPageFn('end');
  },
});
