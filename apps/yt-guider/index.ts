import { createApp } from '@pupa/app';
import { getTranscript, getTranscriptPart } from './services/transcript';
import {
  InteractionResponseType,
  InteractionType,
  PageTweakEvent,
} from '@pupa/universal/types';

const app = await createApp({
  name: '油管英语教练',
  description: '帮助 YouTube 视频观看者更有效地观看视频，学习英语。',
  icon: 'https://avatar.vercel.sh/pupa.svg?text=PUPA',
  onMessage: async (interaction) => {
    if (interaction.type === InteractionType.PAGE_TWEAK_MESSAGE) {
      const { videoId, title, time } = interaction.data;
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
    } else if (interaction.type === InteractionType.PAGE_TWEAK_EVENT) {
      if (
        interaction.data.name === 'train' &&
        interaction.data.type === PageTweakEvent.REPEAT
      ) {
        interaction.settings.set({ training: true });
      }
    } else {
      if (!interaction.message?.content) return;
      const agent = interaction.createAgent(
        `请你帮我创建一个助手，当应用程序无法满足用户服务需求时，辅助开发者向用户解释其原因。\n\n这个应用程序是帮助 YouTube 视频观看者更有效地观看视频的。`,
      );
      agent.reply(interaction.message.content);
    }
  },
});

app.serve({
  fetch(host) {
    host.get('/transcript', (req, res) => {
      const videoId = req.query.v as string;
      getTranscript(videoId).then((transcript) => {
        res.json(transcript);
      });
    });
  },
});
