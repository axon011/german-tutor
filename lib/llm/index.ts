import type { LLMProvider } from "./provider";
import { ClaudeCodeProvider } from "./claude-code";
import { GeminiProvider } from "./gemini";

/**
 * Provider selection: LLM_PROVIDER=claude-code (local dev) | gemini (Vercel).
 * One instance per process — providers are stateless.
 */
let provider: LLMProvider | undefined;

export function getProvider(): LLMProvider {
  if (provider) return provider;
  const name = process.env.LLM_PROVIDER ?? "claude-code";
  switch (name) {
    case "claude-code":
      provider = new ClaudeCodeProvider({ model: "haiku" });
      break;
    case "gemini":
      provider = new GeminiProvider();
      break;
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${name}`);
  }
  return provider;
}
