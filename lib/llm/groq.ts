import type { ChatMessage, LLMProvider } from "./provider";

/**
 * Deployment provider: Groq free tier (no card required) over the
 * OpenAI-compatible chat-completions endpoint. Streams SSE deltas.
 *
 * The free tier's tokens-per-minute budget is shared by the chat and the
 * corrector, so a 429 is a normal event, not an outage. When Groq says the
 * window reopens within a few seconds we wait and retry once; a longer wait
 * would stall the reply, so that still throws.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
/** Longest `retry-after` worth waiting out, in seconds. */
const MAX_RETRY_AFTER_S = 10;
/** Slack on top of `retry-after`, so the retry doesn't land on the boundary. */
const RETRY_PAD_MS = 250;

export interface GroqOptions {
  /** Default "openai/gpt-oss-120b" — strong German, fast, free tier. */
  model?: string;
  /** Defaults to process.env.GROQ_API_KEY. */
  apiKey?: string;
  /** Sampling temperature. Omitted → Groq's default (1). */
  temperature?: number;
  /** gpt-oss reasoning budget. Omitted → Groq's default (medium). */
  reasoningEffort?: "low" | "medium" | "high";
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

    const { temperature, reasoningEffort } = this.opts;
    const body = JSON.stringify({
      model,
      stream: true,
      // Only sent when set, so unset options keep Groq's defaults.
      ...(temperature !== undefined ? { temperature } : {}),
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const res = await postWithRetry(apiKey, body);
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

/**
 * POST once; on a 429 whose `retry-after` (seconds) is short, wait it out and
 * POST exactly once more. Any other response — including a second 429 — is
 * returned as-is for the caller's error handling.
 */
async function postWithRetry(apiKey: string, body: string): Promise<Response> {
  const post = () =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body,
    });

  const res = await post();
  if (res.status !== 429) return res;
  const waitS = Number.parseFloat(res.headers.get("retry-after") ?? "");
  if (!Number.isFinite(waitS) || waitS < 0 || waitS > MAX_RETRY_AFTER_S) {
    return res;
  }
  // Drain the 429 body so the connection can be reused.
  await res.body?.cancel();
  await new Promise((r) => setTimeout(r, waitS * 1000 + RETRY_PAD_MS));
  return post();
}
