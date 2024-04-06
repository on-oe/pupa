import { describe, it, expect } from "bun:test";
import { getTranscript, getTranscriptPart, summarize } from "./transcript";

describe("get transcriptions", () => {
  it("should get the transcriptions", async () => {
    const videoId = "35luW5GG0Z8";
    const transcriptions = await getTranscript(videoId);
    expect(transcriptions).toBeDefined();
  });
});

describe("summary", () => {
  const videoId = "h0lAIv6Vtow";
  const time = 0;
  const title = "Is the Vision Pro Worth it Now?";
  it("should get the summary", async () => {
    const part = await getTranscriptPart(videoId, time);
    const content = await summarize(part, title);
    expect(content).toBeDefined();
  });
});
