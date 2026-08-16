import type { ChatMessage, LLMProvider } from "./provider";

/**
 * Deployment provider: Gemini free tier over plain HTTPS (no SDK dependency).
 * Used on Vercel, where the claude CLI cannot run. Streams via the
 * `streamGenerateContent?alt=sse` endpoint.
 */

export interface GeminiOptions {
  /** Default "gemini-2.0-flash" — fast and inside the free tier. */
  model?: string;
  /** Defaults to process.env.GEMINI_API_KEY. */
  apiKey?: string;
}

export class GeminiProvider implements LLMProvider {
  constructor(private readonly opts: GeminiOptions = {}) {}

  async *streamChat(
    system: string,
    messages: ChatMessage[],
  ): AsyncIterable<string> {
    const apiKey = this.opts.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const model = this.opts.model ?? "gemini-2.0-flash";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      },
    );
    if (!res.ok || !res.body) {
      throw new Error(
        `Gemini API error ${res.status}: ${(await res.text()).slice(0, 500)}`,
      );
    }

    // SSE stream: each event is a `data: {json}` line with a partial candidate.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffered = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        let ev: unknown;
        try {
          ev = JSON.parse(payload);
        } catch {
          continue;
        }
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const parts = (ev as any).candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (typeof part.text === "string" && part.text) yield part.text;
        }
      }
    }
  }
}
