import { defineSlashCommand } from '@pupa/app';

export default defineSlashCommand({
  name: 'train',
  description: '进行听力训练',
  execute: async (interaction) => {
    interaction.execPageFn('train');
  },
});
