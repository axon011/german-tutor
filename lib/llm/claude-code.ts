import { spawn } from "node:child_process";
import type { ChatMessage, LLMProvider } from "./provider";

/**
 * Local-dev provider: spawns the `claude` CLI (Claude Code OAuth) per turn.
 * Stateless — the windowed history is rendered into the prompt each call.
 *
 * Hard-won CLI traps (from resume-tailor — do not remove):
 * - `--strict-mcp-config --mcp-config '{"mcpServers":{}}'` is mandatory.
 *   Without it `claude -p` inherits the interactive MCP env (claude-mem hook
 *   et al.) and hangs or adds ~8s+ init.
 * - `--settings '{"disableAllHooks":true}'` is equally mandatory: user-level
 *   hooks (claude-mem observers) otherwise run inside every -p call and cost
 *   ~10s before the API request even starts (measured 2026-08-16).
 * - `MAX_THINKING_TOKENS=0` in the env drops the thinking block Haiku emits
 *   before the text block — several seconds of silence before token one.
 * - Windows exit code 0xC0000142 (3221225794) is a transient spawn failure:
 *   retry once, but only if nothing was streamed yet.
 * - The user prompt goes in via stdin, not argv — avoids Windows command-line
 *   length limits and quoting hazards.
 */

const TRANSIENT_WIN_EXIT = 0xc0000142; // Node reports it as 3221225794

export interface ClaudeCodeOptions {
  /** Path to the CLI. Default "claude" (resolved via PATH). */
  claudePath?: string;
  /** Model alias, e.g. "haiku" | "sonnet". Default: CLI default. */
  model?: string;
  /** Kill the process if the whole turn exceeds this. Default 120s. */
  timeoutMs?: number;
}

export class ClaudeCodeProvider implements LLMProvider {
  constructor(private readonly opts: ClaudeCodeOptions = {}) {}

  async *streamChat(
    system: string,
    messages: ChatMessage[],
  ): AsyncIterable<string> {
    for (let attempt = 0; ; attempt++) {
      const run = this.runOnce(system, messages);
      let yieldedAny = false;
      try {
        for await (const chunk of run) {
          yieldedAny = true;
          yield chunk;
        }
        return;
      } catch (err) {
        const transient =
          err instanceof ClaudeCliExitError && err.code === TRANSIENT_WIN_EXIT;
        // Retrying after partial output would duplicate text downstream.
        if (transient && !yieldedAny && attempt === 0) continue;
        throw err;
      }
    }
  }

  private async *runOnce(
    system: string,
    messages: ChatMessage[],
  ): AsyncIterable<string> {
    const args = [
      "-p",
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      "--append-system-prompt",
      system,
      "--strict-mcp-config",
      "--mcp-config",
      '{"mcpServers":{}}',
      "--settings",
      '{"disableAllHooks":true}',
    ];
    if (this.opts.model) args.push("--model", this.opts.model);

    const child = spawn(this.opts.claudePath ?? "claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      // claude.exe is a native executable — no shell, no cmd.exe quoting.
      shell: false,
      env: { ...process.env, MAX_THINKING_TOKENS: "0" },
    });

    const timeoutMs = this.opts.timeoutMs ?? 120_000;
    const killTimer = setTimeout(() => child.kill(), timeoutMs);
    let stderrTail = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (d: string) => {
      stderrTail = (stderrTail + d).slice(-2000);
    });

    child.stdin.write(renderPrompt(messages));
    child.stdin.end();

    // The reply arrives token-by-token as `stream_event` text deltas. The
    // final `assistant` event repeats the full text, so it is only used as a
    // fallback when no deltas were seen (older CLI versions).
    let sawDelta = false;
    let buffered = "";
    try {
      child.stdout.setEncoding("utf8");
      for await (const data of child.stdout) {
        buffered += data;
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";
        for (const line of lines) {
          const text = extractText(line, sawDelta);
          if (text === null) continue;
          if (text.fromDelta) sawDelta = true;
          if (text.value) yield text.value;
        }
      }
      const exitCode = await new Promise<number | null>((resolve) =>
        child.on("close", resolve),
      );
      if (exitCode !== 0) {
        throw new ClaudeCliExitError(exitCode, stderrTail);
      }
    } finally {
      clearTimeout(killTimer);
      if (child.exitCode === null) child.kill();
    }
  }
}

export class ClaudeCliExitError extends Error {
  constructor(
    public readonly code: number | null,
    stderrTail: string,
  ) {
    super(
      `claude CLI exited with code ${code}${
        code === TRANSIENT_WIN_EXIT ? " (transient Windows spawn failure)" : ""
      }${stderrTail ? `\nstderr: ${stderrTail}` : ""}`,
    );
    this.name = "ClaudeCliExitError";
  }
}

function renderPrompt(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "Schüler" : "Tutor"}: ${m.content}`)
    .join("\n\n");
}

function extractText(
  line: string,
  sawDelta: boolean,
): { value: string; fromDelta: boolean } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let ev: Record<string, unknown>;
  try {
    ev = JSON.parse(trimmed);
  } catch {
    return null; // --verbose can interleave non-JSON noise; skip it
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const e = ev as any;
  if (e.type === "stream_event") {
    const delta = e.event?.delta;
    if (e.event?.type === "content_block_delta" && delta?.type === "text_delta") {
      return { value: delta.text ?? "", fromDelta: true };
    }
    return null;
  }
  if (e.type === "assistant" && !sawDelta) {
    const text = (e.message?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
    return { value: text, fromDelta: false };
  }
  if (e.type === "result" && e.is_error) {
    throw new Error(`claude CLI returned an error result: ${e.result ?? ""}`);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return null;
}
