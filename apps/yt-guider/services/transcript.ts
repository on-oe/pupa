import { OpenAI } from "openai";
import { exec } from "node:child_process";

interface TranscriptResponse {
  text: string;
  offset: number;
  duration: number;
}

async function fetchTranscript(videoId: string) {
  return new Promise<TranscriptResponse[]>((resolve, reject) => {
    exec(`youtube_transcript_api ${videoId} --format json`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      const data = JSON.parse(stdout)[0] as {
        text: string;
        start: number;
        duration: number;
      }[];
      const transcript = data.map((item) => ({
        text: item.text,
        offset: item.start,
        duration: item.duration,
      }));
      resolve(transcript);
    });
  });
}

const cacheMap = new Map<string, TranscriptResponse[]>();

export async function getTranscript(videoId: string) {
  if (cacheMap.has(videoId)) {
    return cacheMap.get(videoId);
  }

  let transcript = await fetchTranscript(videoId);
  transcript = transcript.map((item) => {
    return {
      text: item.text,
      offset: item.offset,
      duration: item.duration,
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
