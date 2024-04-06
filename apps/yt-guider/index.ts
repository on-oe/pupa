import { createApp } from "@pupa/app";

const app = createApp({
  name: "yt-guider",
  description: "help you to watch youtube videos more efficiently.",
  icon: "https://avatar.vercel.sh/pupa.svg?text=PUPA",
  onMessage: (interaction) => {
    if (!interaction.message?.content) return;
    const agent = interaction.createAgent(
      `请你帮我创建一个助手，当应用程序无法满足用户服务需求时，辅助开发者向用户解释其原因。\n\n这个应用程序是帮助 YouTube 视频观看者更有效地观看视频的。`,
    );
    agent.reply(interaction.message.content);
  },
});

app.serve();
