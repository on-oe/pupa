import { describe, it, expect } from "bun:test";
import { createApp } from "./app";
import { defineSlashCommand } from ".";

describe("Test findCommander", () => {
  const app = createApp({
    name: "test",
    description: "test",
    icon: "test",
    commanders: [
      defineSlashCommand({
        name: "translate",
        description: "help you translate text.",
        execute: () => Promise.resolve(),
      }),
      defineSlashCommand({
        name: "tts",
        description: "text to speech",
        execute: () => Promise.resolve(),
      }),
    ],
  });

  it("should find the translate commander", async () => {
    const userInput = "please translate this text";
    const commander = await app.findCommander(userInput);
    expect(commander?.name).toBe("translate");
  });

  it("should find the tts commander", async () => {
    const userInput = "帮我把这段文字转成语音: hello world.";
    const commander = await app.findCommander(userInput);
    expect(commander?.name).toBe("tts");
  });

  it("should not find any commander", async () => {
    const userInput = "i want to know the weather";
    const commander = await app.findCommander(userInput);
    expect(commander).toBeNull();
  });
});
