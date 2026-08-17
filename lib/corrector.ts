import { z } from "zod";
import type { LLMProvider } from "./llm/provider";
import type { CefrLevel } from "./tutor-prompt";

/**
 * The Corrector agent. Runs in parallel with the Conversation agent and never
 * blocks it: the tutor's reply streams immediately, corrections annotate the
 * learner's message a second or two later.
 *
 * Contract with the UI: `span` must be an EXACT contiguous substring of the
 * learner's message, because the client highlights it by substring match. Any
 * error whose span doesn't literally occur is dropped here rather than
 * silently failing to render.
 *
 * Best-effort by design — a malformed model response yields no corrections,
 * never an exception. Grammar annotations are a bonus; the conversation is the
 * product.
 */

const ERROR_TYPES = [
  "grammar",
  "vocabulary",
  "spelling",
  "word-order",
] as const;

const correctionErrorSchema = z.object({
  span: z.string().min(1),
  type: z.enum(ERROR_TYPES),
  correction: z.string(),
  explanation: z.string(),
});

export const correctorResponseSchema = z.object({
  errors: z.array(correctionErrorSchema).max(10),
});

export type CorrectionError = z.infer<typeof correctionErrorSchema>;

const BASE_PROMPT = `You are a precise German language error analyst working for a language tutor. You are given ONE message written by a learner. List the errors it contains.

Rules:
- "span" MUST be an EXACT contiguous substring copied character-for-character from the learner's message. It is used to highlight the error in the UI. If you cannot quote it exactly, omit that error entirely.
- "correction" is the fixed span only — not the whole sentence.
- Use the SHORTEST span that contains the error (a word or short phrase, not the whole sentence). Spans of different errors must not overlap each other.
- "type" is one of: grammar, vocabulary, spelling, word-order.
- "explanation" is ONE short sentence.
- Do not invent errors. A correct message has an empty list, and an empty list is a perfectly good answer.
- List at most 10 errors, the most important ones first.

OUTPUT: STRICT JSON only, exactly {"errors":[{"span":"…","type":"…","correction":"…","explanation":"…"}]} with double quotes. No markdown fences, no prose, no commentary before or after.`;

const LEVEL_GUIDANCE: Record<CefrLevel, string> = {
  A1: `The learner is at A1. Write every "explanation" in English.
- Do NOT flag missing umlauts typed as ae/oe/ue (many learners have no German keyboard). Instead, give the properly spelled form inside "correction" and move on.
- Flag only errors that block understanding. Ignore style.`,
  A2: `The learner is at A2. Write every "explanation" in English.
- Do NOT flag missing umlauts typed as ae/oe/ue (many learners have no German keyboard). Instead, give the properly spelled form inside "correction" and move on.
- Focus on cases, verb forms and basic word order. Ignore style.`,
  B1: `The learner is at B1. Write every "explanation" in simple German.
- Focus on cases, verb position, tense and prepositions. Mention style only when it is clearly wrong.`,
  B2: `The learner is at B2. Write every "explanation" in simple German.
- Include idiomatic and register problems, not just hard grammar errors.`,
};

export function correctorSystemPrompt(level: CefrLevel): string {
  return `${BASE_PROMPT}\n\n${LEVEL_GUIDANCE[level]}`;
}

/**
 * Analyze one learner message. Returns [] on any failure — parse error, schema
 * mismatch, provider crash — so callers never have to handle correction errors.
 */
export async function runCorrector(
  provider: LLMProvider,
  level: CefrLevel,
  message: string,
): Promise<CorrectionError[]> {
  try {
    let raw = "";
    for await (const chunk of provider.streamChat(correctorSystemPrompt(level), [
      { role: "user", content: message },
    ])) {
      raw += chunk;
    }

    const parsed = correctorResponseSchema.safeParse(JSON.parse(stripFences(raw)));
    if (!parsed.success) return [];

    // The UI highlights by substring match, so a span the model paraphrased
    // instead of quoting would render as nothing at all. Drop those.
    return parsed.data.errors.filter((e) => message.includes(e.span));
  } catch (err) {
    console.error("corrector failed:", err);
    return [];
  }
}

/** Models occasionally wrap JSON in ```json fences despite being told not to. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenced ? fenced[1] : trimmed;
}
