import { defineSlashCommand } from '@pupa/app';
import { train } from '../tweaks';

export default defineSlashCommand({
  name: 'train',
  description: '进行听力训练',
  execute: async (interaction) => {
    interaction.execPageTweak(train);
  },
});
