import { definePageFuncCommand } from "@pupa/app";
import { InteractionResponseType } from "@pupa/universal/types";
import { getTranscriptPart, summarize } from "../services/transcript";

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
