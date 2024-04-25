import { defineSlashCommand } from '@pupa/app';
import { definePageRecycleCommand } from '../../../packages/app/command';
import { CommandOptionType, PageRecycleEvent } from '@pupa/universal/types';

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
    const settings = await interaction.settings.get();
    if (settings && !settings.auto) return;
    if (!settings) await interaction.settings.set({ auto: true });
    interaction.execPageFn('start');
  },
});

export const setting = defineSlashCommand({
  name: '设置',
  description: '设置护眼模式',
  options: [
    {
      name: 'auto',
      description: '自动开启护眼模式',
      type: CommandOptionType.BOOLEAN,
      required: true,
    },
  ],
  execute: async (interaction) => {
    const auto = Boolean(interaction.commandOptions?.find((option) => option.name === 'auto')?.value);
    await interaction.settings.set({ auto });
  }
})