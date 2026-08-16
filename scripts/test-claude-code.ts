/**
 * Smoke test for ClaudeCodeProvider: two sequential turns through ONE provider
 * instance. Run with `npm run test:llm`.
 *
 * Turn 1 is cold — it pays the ~1.9s CLI bootstrap. Turn 2 reuses the live
 * child process, so its time-to-first-token should be dramatically lower. That
 * gap is the whole point of the persistent-session provider.
 */
import { ClaudeCodeProvider } from "../lib/llm/claude-code";
import type { ChatMessage } from "../lib/llm/provider";

const system =
  "Du bist ein deutscher Sprachtutor für einen B1-Lerner. Antworte auf " +
  "Deutsch in 2-4 Sätzen und stelle am Ende eine Rückfrage.";

const provider = new ClaudeCodeProvider({ model: "haiku" });

async function turn(label: string, messages: ChatMessage[]): Promise<string> {
  const start = Date.now();
  let firstTokenAt: number | null = null;
  let chunks = 0;
  let reply = "";

  process.stdout.write(`\n[${label}] `);
  for await (const chunk of provider.streamChat(system, messages)) {
    if (firstTokenAt === null) firstTokenAt = Date.now();
    chunks++;
    reply += chunk;
    process.stdout.write(chunk);
  }
  process.stdout.write("\n");

  if (!reply.trim()) throw new Error(`${label}: stream produced no text`);
  console.log(
    `[${label}] TTFT ${firstTokenAt! - start}ms, total ${
      Date.now() - start
    }ms, ${chunks} chunks`,
  );
  return reply;
}

async function main() {
  const history: ChatMessage[] = [
    { role: "user", content: "Hallo! Gestern habe ich ein Buch gelest." },
  ];
  const reply1 = await turn("turn 1 (cold)", history);

  history.push({ role: "assistant", content: reply1 });
  history.push({ role: "user", content: "Ja, das Buch war sehr interessant." });
  await turn("turn 2 (warm)", history);

  console.log("\nPASS — both turns produced text.");
  // The provider holds a live child process that keeps the event loop alive.
  process.exit(0);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
