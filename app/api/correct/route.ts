import { getProvider } from "@/lib/llm";
import { runCorrector, type CorrectionError } from "@/lib/corrector";
import { isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";

// Node runtime is required: ClaudeCodeProvider spawns a child process.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Below this many words a message is not worth a model call ("Ja!", "danke",
 * "ok gut"). CLAUDE.md mandates a cheap gate in front of the Corrector; this
 * is it — free, local, and it covers the majority of skippable turns.
 */
const MIN_WORDS = 3;

/**
 * POST { message: string, level?: "A1"|"A2"|"B1"|"B2", context?: string }
 * → { errors: [...] }. Non-streaming: the client fires this alongside
 * /api/chat and annotates the learner's message whenever the answer arrives.
 *
 * `context` is the German part of the tutor's previous message, so the
 * Corrector can judge what the learner is answering. The client caps it at
 * ~400 chars; 1000 here is a guard, not a budget.
 */
export async function POST(req: Request) {
  let message: string;
  let level: CefrLevel = "B1";
  let context: string | undefined;
  try {
    const body = await req.json();
    message = body.message;
    if (body.level !== undefined) {
      if (!isCefrLevel(body.level)) throw new Error("invalid level");
      level = body.level;
    }
    if (
      typeof message !== "string" ||
      message.length === 0 ||
      message.length > 4000
    ) {
      throw new Error("invalid message");
    }
    if (body.context !== undefined) {
      if (typeof body.context !== "string" || body.context.length > 1000) {
        throw new Error("invalid context");
      }
      context = body.context;
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (message.trim().split(/\s+/).length < MIN_WORDS) {
    return Response.json({ errors: [] as CorrectionError[] });
  }

  const errors = await runCorrector(
    getProvider("corrector"),
    level,
    message,
    context,
  );
  return Response.json({ errors });
}
