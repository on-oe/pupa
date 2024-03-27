import { defineSlashCommand } from "@pupa/app";

export default defineSlashCommand({
  name: "summary",
  description: "概括视频片段内容",
  execute: async (interaction) => {
    interaction.execPageFn("fn-summary");
  },
});
