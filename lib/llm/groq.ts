import type { ChatMessage, LLMProvider } from "./provider";

/**
 * Deployment provider: Groq free tier (no card required) over the
 * OpenAI-compatible chat-completions endpoint. Streams SSE deltas.
 */

export interface GroqOptions {
  /** Default "openai/gpt-oss-120b" — strong German, fast, free tier. */
  model?: string;
  /** Defaults to process.env.GROQ_API_KEY. */
  apiKey?: string;
}

export class GroqProvider implements LLMProvider {
  constructor(private readonly opts: GroqOptions = {}) {}

  async *streamChat(
    system: string,
    messages: ChatMessage[],
  ): AsyncIterable<string> {
    const apiKey = this.opts.apiKey ?? process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    const model = this.opts.model ?? "openai/gpt-oss-120b";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!res.ok || !res.body) {
      throw new Error(
        `Groq API error ${res.status}: ${(await res.text()).slice(0, 500)}`,
      );
    }

    // OpenAI-style SSE: `data: {json}` lines, terminated by `data: [DONE]`.
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
        if (!payload || payload === "[DONE]") continue;
        let ev: unknown;
        try {
          ev = JSON.parse(payload);
        } catch {
          continue;
        }
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const text = (ev as any).choices?.[0]?.delta?.content;
        if (typeof text === "string" && text) yield text;
      }
    }
  }
}
