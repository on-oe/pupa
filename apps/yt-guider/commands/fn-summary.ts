import { definePageFuncCommand } from "@pupa/app";
import { OpenAI } from "openai";
import { InteractionResponseType } from "@pupa/universal/types";
import { YoutubeTranscript, type TranscriptResponse } from "youtube-transcript";

const cacheMap = new Map<string, TranscriptResponse[]>();

export async function getTranscript(videoId: string) {
  if (cacheMap.has(videoId)) {
    return cacheMap.get(videoId);
  }

  let transcript = await YoutubeTranscript.fetchTranscript(videoId);
  transcript = transcript.map((item) => {
    return {
      text: item.text,
      offset: item.offset / 1000,
      duration: item.duration / 1000,
    };
  });
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
    return item.offset + item.duration >= offset;
  });
  const items = [];
  for (let i = index; i < transcript.length; i++) {
    const item = transcript[i];
    if (item.offset < offset + duration) {
      items.push(item.text);
    } else {
      break;
    }
  }

  return items.join(" ");
}

const client = new OpenAI();

export async function summarize(content: string, title: string) {
  const res = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
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
  name: "summary",
  description: "概括视频片段内容",
  execute: async (interaction) => {
    if (!interaction.commandOptions) return;
    const type = interaction.commandOptions.find(
      (o) => o.name === "type",
    )?.value;
    if (type === "error") {
      interaction.end("failed to execute summary, please try again.");
      return;
    }
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
    const transcript = await getTranscriptPart(videoId, time);
    const content = await summarize(transcript, title);
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
