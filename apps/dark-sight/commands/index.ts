import { defineSlashCommand } from '@pupa/app';
import { definePageRecycleCommand } from '../../../packages/app/command';
import { PageRecycleEvent } from '@pupa/universal/types';

export const open = defineSlashCommand({
  name: '护眼',
  description: '通过调整屏幕亮度和色温，保护你的眼睛。',
  execute: async (interaction) => {
    interaction.execPageFn('start');
  },
});

export const close = defineSlashCommand({
  name: '关闭护眼',
  description: '关闭护眼模式',
  execute: async (interaction) => {
    interaction.execPageFn('end');
  },
});

export const auto = definePageRecycleCommand(PageRecycleEvent.OPEN, {
  description: '',
  execute: async (interaction) => {
    interaction.execPageFn('start');
  },
});
