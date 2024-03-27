import { definePageFuncCommand } from "@pupa/app";
import { OpenAI } from "openai";
import { YoutubeTranscript, type TranscriptResponse } from "youtube-transcript";
import { InteractionResponseType } from "../../../packages/universal/types/interaction";

const cacheMap = new Map<string, TranscriptResponse[]>();

export async function getTranscript(videoId: string) {
  if (cacheMap.has(videoId)) {
    return cacheMap.get(videoId);
  }

  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  cacheMap.set(videoId, transcript);

  return transcript;
}

export async function getTranscriptPart(
  videoId: string,
  offset: number,
  duration = 60,
) {
  const transcript = await getTranscript(videoId);
  if (!transcript) return "";
  const index = transcript.findIndex((item) => {
    return (item.offset + item.duration) / 1000 >= offset;
  });
  const items = [];
  for (let i = index; i < transcript.length; i++) {
    const item = transcript[i];
    if (item.offset / 1000 < offset + duration) {
      items.push(item.text);
    } else {
      break;
    }
  }

  return items.join(" ");
}

const client = new OpenAI();

async function summarize(content: string, title: string) {
  const res = await client.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.1,
    //   stream: true,
    messages: [
      {
        role: "system",
        content: `你擅长通过字幕脚本概括总结视频片段内容。\n\n这个视频的的标题是：${title}\n请你用你的话概括一下这段内容。`,
      },
      {
        role: "user",
        content,
      },
    ],
  });
  return res.choices[0].message.content;
}

export default definePageFuncCommand({
  name: "fn-summary",
  description: "概括视频片段内容",
  execute: async (interaction) => {
    if (!interaction.commandOptions) return;
    const time = interaction.commandOptions.find((o) => o.name === "time")
      ?.value as number;
    const videoId = interaction.commandOptions.find((o) => o.name === "videoId")
      ?.value as string;
    const title = interaction.commandOptions.find((o) => o.name === "title")
      ?.value as string;
    if (!time || !videoId || !title) {
      interaction.reply({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "参数错误" },
      });
      return;
    }
    // interaction.defer({ type: 5 });
    const content = await summarize(
      await getTranscriptPart(videoId, time),
      title,
    );
    if (!content) {
      interaction.reply({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "无法获取字幕" },
      });
      return;
    }
    interaction.reply({ type: 4, data: { content } });
  },
});
