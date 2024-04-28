import { defineSlashCommand } from '@pupa/app';
import { summary } from '../tweaks';

export default defineSlashCommand({
  name: 'summary',
  description: '概括视频片段内容',
  execute: async (interaction) => {
    try {
      interaction.execPageTweak(summary);
    } catch (error) {
      console.log(error);
    }
  },
});
