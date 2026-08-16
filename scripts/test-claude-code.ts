/**
 * Smoke test for ClaudeCodeProvider: one real streamed completion through the
 * claude CLI. Run with `npm run test:llm`. Prints chunks as they arrive plus
 * time-to-first-token — the metric slice 1 optimizes for.
 */
import { ClaudeCodeProvider } from "../lib/llm/claude-code";

const system =
  "Du bist ein deutscher Sprachtutor für einen B1-Lerner. Antworte auf " +
  "Deutsch in 2-4 Sätzen und stelle am Ende eine Rückfrage.";

async function main() {
  const provider = new ClaudeCodeProvider({ model: "haiku" });
  const start = Date.now();
  let firstTokenAt: number | null = null;
  let chunks = 0;
  let reply = "";

  process.stdout.write("streaming: ");
  for await (const chunk of provider.streamChat(system, [
    { role: "user", content: "Hallo! Gestern habe ich ein Buch gelest." },
  ])) {
    if (firstTokenAt === null) firstTokenAt = Date.now();
    chunks++;
    reply += chunk;
    process.stdout.write(chunk);
  }
  process.stdout.write("\n\n");

  if (!reply.trim()) throw new Error("stream produced no text");
  console.log(`time to first token: ${firstTokenAt! - start}ms`);
  console.log(`total: ${Date.now() - start}ms, ${chunks} chunks`);
  console.log(chunks > 1 ? "PASS (true streaming)" : "PASS (single chunk — no partial deltas?)");
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
