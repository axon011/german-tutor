import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type { ChatMessage, LLMProvider } from "./provider";

/**
 * Local-dev provider: talks to the `claude` CLI (Claude Code OAuth) over ONE
 * long-lived child process instead of spawning per turn.
 *
 * Why persistent: the Node CLI bootstrap costs ~1.9s. Paying it once instead of
 * once per turn takes time-to-first-token from ~2.5s to well under 1s for every
 * turn after the first.
 *
 * Persistent-mode protocol (`--input-format stream-json`):
 * - The process stays alive and waits indefinitely for stdin. (In plain `-p`
 *   mode stdin must arrive within ~3s or the call dies — that is precisely why
 *   this mode is used.) Never close stdin between turns.
 * - One user turn = ONE line of JSON on stdin:
 *   {"type":"user","message":{"role":"user","content":[{"type":"text","text":…}]}}
 * - stdout is newline-delimited JSON: `stream_event` wrappers carrying
 *   content_block_delta text deltas (skip non-text deltas), an `assistant`
 *   event repeating the full text, and finally a `{"type":"result",…}` event
 *   that marks END OF TURN. Wait for `result` — nothing else tells you the
 *   turn finished.
 * - The CLI session keeps its own conversation history, so follow-up turns send
 *   only the new user message. The LLMProvider interface stays stateless: we
 *   remember what history the session has and fall back to replaying the whole
 *   window whenever it no longer matches (page reload, level change, restart).
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
 * - The prompt goes in via stdin, not argv — avoids Windows command-line
 *   length limits and quoting hazards.
 */

const TRANSIENT_WIN_EXIT = 0xc0000142; // Node reports it as 3221225794

/** Restart the CLI session after this many turns to bound its context growth. */
const MAX_SESSION_TURNS = 20;

export interface ClaudeCodeOptions {
  /** Path to the CLI. Default "claude" (resolved via PATH). */
  claudePath?: string;
  /** Model alias, e.g. "haiku" | "sonnet". Default: CLI default. */
  model?: string;
  /** Kill the child if a single turn exceeds this. Default 120s. */
  timeoutMs?: number;
}

export class ClaudeCodeProvider implements LLMProvider {
  private session: Session | null = null;
  private lock: Promise<void> = Promise.resolve();

  constructor(private readonly opts: ClaudeCodeOptions = {}) {}

  async *streamChat(
    system: string,
    messages: ChatMessage[],
  ): AsyncIterable<string> {
    const release = await this.acquire();
    try {
      for (let attempt = 0; ; attempt++) {
        const fresh = !this.canReuse(system, messages);
        let yieldedAny = false;
        try {
          for await (const chunk of this.runTurn(system, messages, fresh)) {
            yieldedAny = true;
            yield chunk;
          }
          return;
        } catch (err) {
          this.dropSession();
          const transient =
            err instanceof ClaudeCliExitError && err.code === TRANSIENT_WIN_EXIT;
          // Retrying after partial output would duplicate text downstream.
          if (transient && !yieldedAny && attempt === 0) continue;
          throw err;
        }
      }
    } finally {
      release();
    }
  }

  /** Kill the child, if any. Safe to call at any time; next turn respawns. */
  close(): void {
    this.dropSession();
  }

  /**
   * A live session can serve an incremental turn only if it was spawned with
   * the same system prompt and the incoming history (minus the final user
   * message) matches the TAIL of what the session holds — callers window
   * their history, so the session legitimately knows more than they resend.
   */
  private canReuse(system: string, messages: ChatMessage[]): boolean {
    const s = this.session;
    if (!s || !s.alive || s.system !== system) return false;
    if (s.turns >= MAX_SESSION_TURNS) return false;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return false;
    return isHistoryTail(messages.slice(0, -1), s.history);
  }

  private async *runTurn(
    system: string,
    messages: ChatMessage[],
    fresh: boolean,
  ): AsyncIterable<string> {
    if (fresh) {
      this.dropSession();
      this.session = new Session({
        claudePath: this.opts.claudePath ?? "claude",
        model: this.opts.model,
        system,
      });
    }
    const session = this.session!;

    // Fresh session gets the whole window; a reused one only the new message.
    const payload = fresh
      ? renderPrompt(messages)
      : renderPrompt(messages.slice(-1));

    let reply = "";
    let completed = false;
    try {
      for await (const chunk of session.turn(
        payload,
        this.opts.timeoutMs ?? 120_000,
      )) {
        reply += chunk;
        yield chunk;
      }
      completed = true;
    } finally {
      // An abandoned turn (consumer broke out early, timeout, crash) leaves the
      // CLI mid-stream, so the session can no longer be trusted for reuse.
      if (!completed) this.dropSession();
    }

    // Fresh: session context is exactly what was replayed. Reused: append to
    // the session's own (possibly longer) history so windowed callers keep
    // matching its tail on the next turn.
    session.history = fresh
      ? [...messages, { role: "assistant", content: reply }]
      : [
          ...session.history,
          messages[messages.length - 1],
          { role: "assistant", content: reply },
        ];
    session.turns++;
  }

  private dropSession(): void {
    this.session?.kill();
    this.session = null;
  }

  private async acquire(): Promise<() => void> {
    let release!: () => void;
    const next = new Promise<void>((resolve) => (release = resolve));
    const prev = this.lock;
    this.lock = prev.then(() => next);
    await prev;
    return release;
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

/* ------------------------------------------------------------------ */
/* Session: one live `claude` child process, many turns.               */
/* ------------------------------------------------------------------ */

const liveChildren = new Set<ChildProcessWithoutNullStreams>();
let exitHookInstalled = false;

function installExitHook(): void {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  // Without this, a dev-server restart orphans the CLI child.
  process.on("exit", () => {
    for (const child of liveChildren) child.kill();
  });
}

interface SessionInit {
  claudePath: string;
  model?: string;
  system: string;
}

class Session {
  readonly system: string;
  /** History the CLI session is believed to hold, incl. its own replies. */
  history: ChatMessage[] = [];
  turns = 0;

  private readonly child: ChildProcessWithoutNullStreams;
  private stdoutBuffer = "";
  private stderrTail = "";
  private exited: { code: number | null } | null = null;
  private current: TurnQueue | null = null;
  /** Text deltas are per-turn state: the `assistant` fallback is per-turn too. */
  private sawDelta = false;

  constructor(init: SessionInit) {
    this.system = init.system;
    installExitHook();

    const args = [
      "-p",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      "--append-system-prompt",
      init.system,
      "--strict-mcp-config",
      "--mcp-config",
      '{"mcpServers":{}}',
      "--settings",
      '{"disableAllHooks":true}',
    ];
    if (init.model) args.push("--model", init.model);

    this.child = spawn(init.claudePath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      // claude.exe is a native executable — no shell, no cmd.exe quoting.
      shell: false,
      env: { ...process.env, MAX_THINKING_TOKENS: "0" },
    });
    liveChildren.add(this.child);

    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (d: string) => {
      this.stderrTail = (this.stderrTail + d).slice(-2000);
    });

    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (d: string) => this.onStdout(d));

    // A spawn failure (ENOENT, 0xC0000142) surfaces here or via "close".
    this.child.on("error", (err) => this.onExit(null, err));
    this.child.on("close", (code) => this.onExit(code));
  }

  get alive(): boolean {
    return this.exited === null;
  }

  /** Send one user turn and stream its text until the `result` event. */
  turn(text: string, timeoutMs: number): AsyncIterable<string> {
    if (this.current) throw new Error("session already has a turn in flight");
    if (!this.alive) {
      throw new ClaudeCliExitError(this.exited!.code, this.stderrTail);
    }

    const queue = new TurnQueue();
    this.current = queue;
    this.sawDelta = false;

    // Per-turn only: no timer survives between turns.
    const timer = setTimeout(() => {
      this.kill();
      queue.fail(new Error(`claude CLI turn timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    queue.onSettled = () => {
      clearTimeout(timer);
      if (this.current === queue) this.current = null;
    };

    this.child.stdin.write(
      JSON.stringify({
        type: "user",
        message: { role: "user", content: [{ type: "text", text }] },
      }) + "\n",
    );

    return queue;
  }

  kill(): void {
    liveChildren.delete(this.child);
    if (this.child.exitCode === null && this.child.signalCode === null) {
      this.child.kill();
    }
  }

  private onStdout(data: string): void {
    this.stdoutBuffer += data;
    const lines = this.stdoutBuffer.split("\n");
    this.stdoutBuffer = lines.pop() ?? "";
    for (const line of lines) this.onLine(line);
  }

  private onLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed || !this.current) return;
    let ev: Record<string, unknown>;
    try {
      ev = JSON.parse(trimmed);
    } catch {
      return; // --verbose can interleave non-JSON noise; skip it
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const e = ev as any;
    if (e.type === "stream_event") {
      const delta = e.event?.delta;
      if (
        e.event?.type === "content_block_delta" &&
        delta?.type === "text_delta"
      ) {
        this.sawDelta = true;
        if (delta.text) this.current.push(delta.text);
      }
      return; // thinking / signature deltas are not reply text
    }
    if (e.type === "assistant" && !this.sawDelta) {
      // Fallback for CLI builds that emit no partial deltas.
      const text = (e.message?.content ?? [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
      if (text) this.current.push(text);
      return;
    }
    if (e.type === "result") {
      if (e.is_error) {
        this.current.fail(
          new Error(`claude CLI returned an error result: ${e.result ?? ""}`),
        );
      } else {
        this.current.end(); // END OF TURN — stdin stays open
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  private onExit(code: number | null, err?: Error): void {
    if (this.exited) return;
    this.exited = { code };
    liveChildren.delete(this.child);
    if (this.current) {
      this.current.fail(
        err && code === null
          ? err
          : new ClaudeCliExitError(code, this.stderrTail),
      );
    }
  }
}

/** Push-driven async iterable of text chunks for a single turn. */
class TurnQueue implements AsyncIterable<string> {
  onSettled: (() => void) | null = null;

  private items: string[] = [];
  private done = false;
  private error: Error | null = null;
  private wake: (() => void) | null = null;

  push(chunk: string): void {
    if (this.done) return;
    this.items.push(chunk);
    this.wake?.();
  }

  end(): void {
    if (this.done) return;
    this.done = true;
    this.settle();
  }

  fail(err: Error): void {
    if (this.done) return;
    this.done = true;
    this.error = err;
    this.settle();
  }

  private settle(): void {
    this.wake?.();
    this.onSettled?.();
    this.onSettled = null;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<string> {
    for (;;) {
      while (this.items.length) yield this.items.shift()!;
      if (this.error) throw this.error;
      if (this.done) return;
      await new Promise<void>((resolve) => (this.wake = resolve));
      this.wake = null;
    }
  }
}

/* ------------------------------------------------------------------ */

function renderPrompt(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "Schüler" : "Tutor"}: ${m.content}`)
    .join("\n\n");
}

/** True if `window` equals the last `window.length` entries of `history`. */
function isHistoryTail(window: ChatMessage[], history: ChatMessage[]): boolean {
  if (window.length > history.length) return false;
  const offset = history.length - window.length;
  return window.every(
    (m, i) =>
      m.role === history[offset + i].role &&
      m.content === history[offset + i].content,
  );
}
