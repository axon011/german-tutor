import type { LLMProvider } from "./provider";
import { ClaudeCodeProvider } from "./claude-code";
import { GeminiProvider } from "./gemini";
import { GroqProvider, type GroqOptions } from "./groq";

/**
 * Provider selection: LLM_PROVIDER=claude-code (local dev) | groq (Vercel
 * deployment) | gemini (fallback, kept working behind the same interface).
 *
 * One instance PER ROLE, not per process. ClaudeCodeProvider keeps a single
 * live CLI session bound to the system prompt it was spawned with, serialized
 * by an internal mutex — so sharing one instance between the Conversation and
 * Corrector agents would make each call kill and respawn the other's session,
 * destroying both the warm-session latency win and the parallelism.
 *
 * Model choice per role is deliberate: the conversation runs on haiku (fast,
 * time-to-first-token is the metric), the corrector on sonnet (a wrong grammar
 * explanation is worse than none). On Groq both roles share one model, so
 * the split is in the sampling instead: low reasoning effort for the
 * conversation (faster first token, fewer tokens against the shared per-minute
 * budget), low temperature for the corrector (the same message should get the
 * same verdict every time).
 */
export type ProviderRole = "conversation" | "corrector";

const CLAUDE_CODE_MODEL: Record<ProviderRole, string> = {
  conversation: "haiku",
  corrector: "sonnet",
};

const GROQ_OPTIONS: Record<ProviderRole, GroqOptions> = {
  conversation: { reasoningEffort: "low" },
  corrector: { temperature: 0.2 },
};

const providers = new Map<ProviderRole, LLMProvider>();

export function getProvider(role: ProviderRole): LLMProvider {
  const cached = providers.get(role);
  if (cached) return cached;

  const name = process.env.LLM_PROVIDER ?? "claude-code";
  let provider: LLMProvider;
  switch (name) {
    case "claude-code":
      provider = new ClaudeCodeProvider({ model: CLAUDE_CODE_MODEL[role] });
      break;
    case "gemini":
      // Gemini is stateless HTTPS; the roles differ only in system prompt.
      provider = new GeminiProvider();
      break;
    case "groq":
      // Groq free tier (no card). Stateless HTTPS like Gemini.
      provider = new GroqProvider(GROQ_OPTIONS[role]);
      break;
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${name}`);
  }
  providers.set(role, provider);
  return provider;
}
