import { defineSlashCommand } from '@pupa/app';
import { CommandOptionType } from '@pupa/universal/types';
import { start, end } from '../tweaks';

export const open = defineSlashCommand({
  name: '护眼',
  description: '通过调整屏幕亮度和色温，保护你的眼睛。',
  execute: async (interaction) => {
    interaction.execPageTweak(start);
  },
});

export const close = defineSlashCommand({
  name: '关闭护眼',
  description: '关闭护眼模式',
  execute: async (interaction) => {
    interaction.execPageTweak(end);
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
    const auto = Boolean(
      interaction.commandOptions?.find((option) => option.name === 'auto')
        ?.value,
    );
    await interaction.settings.set({ auto });
  },
});
