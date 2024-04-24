import { definePageFuncCommand } from '@pupa/app';
import { InteractionResponseType } from '@pupa/universal/types';
import { getTranscriptPart } from '../services/transcript';

export default definePageFuncCommand({
  name: 'summary',
  description: '概括视频片段内容',
  execute: async (interaction) => {
    if (!interaction.commandOptions) return;
    const type = interaction.commandOptions.find(
      (o) => o.name === 'type',
    )?.value;
    if (type === 'error') {
      interaction.end('failed to execute summary, please try again.');
      return;
    }
    const time = interaction.commandOptions.find((o) => o.name === 'time')
      ?.value as number;
    const videoId = interaction.commandOptions.find((o) => o.name === 'videoId')
      ?.value as string;
    const title = interaction.commandOptions.find((o) => o.name === 'title')
      ?.value as string;
    if (!time || !videoId || !title) {
      interaction.reply({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '参数错误' },
      });
      return;
    }
    const transcript = await getTranscriptPart(videoId, time);
    const agent = interaction.createAgent(
      '帮我创建一个用中文辅助概括视频片段内容的助手',
    );
    agent.reply(transcript);
  },
});
