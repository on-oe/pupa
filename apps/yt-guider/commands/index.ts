import { defineSlashCommand } from '@pupa/app';

export { default as summary } from './summary';
export { default as train } from './train';

export const stopTrain = defineSlashCommand({
  name: 'stop-train',
  description: '停止训练',
  execute: async (interaction) => {
    interaction.settings.set({ training: false });
  },
});
