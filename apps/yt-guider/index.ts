import { createApp } from "@pupa/app";

const app = createApp({
  name: "pupa",
  description: "pupa official app",
  icon: "https://pupa.js.org/icon.png",
});

app.serve();
