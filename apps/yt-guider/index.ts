import { createApp } from "@pupa/app";

const app = createApp({
  name: "pupa",
  description: "pupa official app",
  icon: "https://avatar.vercel.sh/pupa.svg?text=PUPA",
});

app.serve();
