import { beforeEach, describe, expect, it } from "vitest";
import type { ErrorRecord } from "../error-log";
import { LocalStore } from "./local";

const NOW = Date.UTC(2026, 0, 1);

function installFakeWindow() {
  const data = new Map<string, string>();
  const target = new EventTarget();
  const fake = {
    localStorage: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
  (globalThis as unknown as { window: typeof fake }).window = fake;
}

function rec(message: string, span: string, correction: string): ErrorRecord {
  return {
    ts: NOW,
    level: "B1",
    message,
    span,
    type: "grammar",
    correction,
    explanation: "",
  };
}

describe("LocalStore SRS", () => {
  beforeEach(installFakeWindow);

  it("derives one due card per distinct drillable mistake", async () => {
    const store = new LocalStore();
    await store.appendErrors([
      rec("Ich gehe in die Schule mit mein Bruder.", "mein", "meinem"),
      rec("Ich gehe in die Schule mit mein Bruder.", "mein", "meinem"),
      rec("Er hat kein Zeit.", "kein", "keine"),
      rec("Unchanged.", "x", "x"),
    ]);
    const due = await store.listDueCards(NOW);
    expect(due.map((c) => c.span).sort()).toEqual(["kein", "mein"]);
    expect(await store.listDueCards(NOW)).toHaveLength(2);
  });

  it("reviewing a card removes it from the due set and notifies", async () => {
    const store = new LocalStore();
    await store.appendErrors([rec("Er hat kein Zeit.", "kein", "keine")]);
    const [card] = await store.listDueCards(NOW);
    let fired = 0;
    const off = store.subscribe(() => fired++);
    await store.reviewCard(card.id, 5, NOW);
    off();
    expect(fired).toBe(1);
    expect(await store.listDueCards(NOW)).toHaveLength(0);
    expect(await store.listDueCards(NOW + 86_400_000)).toHaveLength(1);
  });
});
