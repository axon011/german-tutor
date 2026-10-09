import { afterEach, describe, expect, it, vi } from "vitest";
import { runCorrector } from "./corrector";
import type { LLMProvider } from "./llm/provider";

const fake = (raw: string): LLMProvider => ({
  async *streamChat() {
    yield raw;
  },
});

const item = (span: string, correction: string, type = "grammar") => ({
  span,
  type,
  correction,
  explanation: "x",
});

afterEach(() => vi.restoreAllMocks());

describe("runCorrector", () => {
  it("drops no-op errors but keeps real ones", async () => {
    const raw = JSON.stringify({
      errors: [item("Freundin", "Freundin"), item("ich", "Ich")],
    });
    const out = await runCorrector(fake(raw), "A1", "ich und meine Freundin");
    expect(out.map((e) => e.span)).toEqual(["ich"]);
  });

  it("drops an item with an invalid type, keeps its neighbour", async () => {
    const raw = JSON.stringify({
      errors: [item("ich", "Ich", "capitalization"), item("habe", "heiße")],
    });
    const out = await runCorrector(fake(raw), "A1", "ich habe Aravind");
    expect(out.map((e) => e.span)).toEqual(["habe"]);
  });

  it("drops a span that is not in the message", async () => {
    const raw = JSON.stringify({ errors: [item("Tschüss", "Ciao")] });
    expect(await runCorrector(fake(raw), "A1", "Hallo")).toEqual([]);
  });

  it("parses ```json fenced output", async () => {
    const raw =
      "```json\n" + JSON.stringify({ errors: [item("ich", "Ich")] }) + "\n```";
    const out = await runCorrector(fake(raw), "A1", "ich bin hier");
    expect(out).toHaveLength(1);
  });

  it("returns [] for garbage", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await runCorrector(fake("not json at all"), "A1", "Hallo")).toEqual(
      [],
    );
  });
});
