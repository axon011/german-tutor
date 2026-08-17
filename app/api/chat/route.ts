import { getFocusEntry, type FocusEntry } from "@/lib/focus";
import { getProvider } from "@/lib/llm";
import type { ChatMessage } from "@/lib/llm/provider";
import { isCefrLevel, tutorSystemPrompt, type CefrLevel } from "@/lib/tutor-prompt";

// Node runtime is required: ClaudeCodeProvider spawns a child process.
export const runtime = "nodejs";
// Streaming responses must never be statically cached.
export const dynamic = "force-dynamic";

/** Last N messages sent to the model; older turns get a rolling summary in slice 2+. */
const HISTORY_WINDOW = 10;

/**
 * POST { messages: ChatMessage[], level?: "A1"|"A2"|"B1"|"B2", lessonId?: string }
 * → SSE stream. Events: `data: {"text": "..."}` per chunk, `data: [DONE]` at
 * the end, `data: {"error": "..."}` if the provider fails mid-stream.
 *
 * The client sends only an *id* — a curriculum lesson, or a grammar-rulebook
 * topic when it starts with "gr-". Either way the German instruction that
 * steers the tutor lives server-side (lib/curriculum.ts, lib/grammar.ts) and is
 * resolved through lib/focus.ts, so no prompt text ever crosses the wire from
 * the browser. The field is still called `lessonId` for the client's sake.
 */
export async function POST(req: Request) {
  let messages: ChatMessage[];
  let level: CefrLevel = "B1";
  let focusEntry: FocusEntry | undefined;
  try {
    const body = await req.json();
    messages = body.messages;
    if (body.level !== undefined) {
      if (!isCefrLevel(body.level)) throw new Error("invalid level");
      level = body.level;
    }
    if (body.lessonId !== undefined && body.lessonId !== null) {
      if (typeof body.lessonId !== "string") throw new Error("invalid lessonId");
      focusEntry = getFocusEntry(body.lessonId);
      // A grammar topic without a focus instruction cannot steer anything.
      if (!focusEntry?.focus) throw new Error("unknown lessonId");
    }
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      !messages.every(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.length > 0 &&
          m.content.length <= 4000,
      )
    ) {
      throw new Error("invalid messages");
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const provider = getProvider("conversation");
  const windowed = messages.slice(-HISTORY_WINDOW);
  const encoder = new TextEncoder();
  // The focus instruction goes after the level block so the cacheable static
  // half of the prompt stays at the front.
  const systemPrompt = focusEntry?.focus
    ? `${tutorSystemPrompt(level)}\n\n${focusEntry.focus}`
    : tutorSystemPrompt(level);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      try {
        for await (const chunk of provider.streamChat(systemPrompt, windowed)) {
          send(JSON.stringify({ text: chunk }));
        }
        send("[DONE]");
      } catch (err) {
        console.error("chat stream failed:", err);
        send(JSON.stringify({ error: "Der Tutor ist gerade nicht erreichbar." }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
