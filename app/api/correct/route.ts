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
 * POST { message: string, level?: "A1"|"A2"|"B1"|"B2" } → { errors: [...] }.
 * Non-streaming: the client fires this alongside /api/chat and annotates the
 * learner's message whenever the answer arrives.
 */
export async function POST(req: Request) {
  let message: string;
  let level: CefrLevel = "B1";
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
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (message.trim().split(/\s+/).length < MIN_WORDS) {
    return Response.json({ errors: [] as CorrectionError[] });
  }

  const errors = await runCorrector(getProvider("corrector"), level, message);
  return Response.json({ errors });
}
