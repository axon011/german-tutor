/**
 * The LLM seam. Every model call in the app goes through this interface —
 * route handlers and agents never import a concrete provider directly.
 *
 * Implementations: claude-code.ts (local dev, spawns the `claude` CLI via
 * OAuth) and gemini.ts (deployment, Gemini free-tier HTTPS). Selected by
 * LLM_PROVIDER in .env.local.
 */

export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface LLMProvider {
  /**
   * Stream one completion. `messages` is the windowed conversation history
   * (providers are stateless — history travels in every call). Yields text
   * chunks as they arrive; the concatenation of all chunks is the reply.
   */
  streamChat(system: string, messages: ChatMessage[]): AsyncIterable<string>;
}
