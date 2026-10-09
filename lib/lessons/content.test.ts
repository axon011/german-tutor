import { describe, expect, it } from "vitest";
import { CEFR_LEVELS } from "../tutor-prompt";
import { lessonsForLevel } from "../curriculum";
import { GRAMMAR_TOPICS } from "../grammar";
import { getLessonContent } from "./index";

/**
 * Structural contract for the study sheets. The German itself is reviewed by
 * a person (and by running the Corrector over it); this test makes sure every
 * lesson has a complete, well-formed sheet the UI can render without guards.
 */

const GRAMMAR_IDS = new Set(GRAMMAR_TOPICS.map((t) => t.id));

for (const level of CEFR_LEVELS) {
  describe(`${level} study sheets`, () => {
    for (const lesson of lessonsForLevel(level)) {
      it(`${lesson.id} has a complete sheet`, () => {
        const c = getLessonContent(lesson.id);
        expect(c, "missing sheet").toBeDefined();
        if (!c) return;

        expect(c.goals).toHaveLength(3);
        for (const g of c.goals) expect(g.length).toBeGreaterThan(5);

        expect(c.vocab.length).toBeGreaterThanOrEqual(10);
        expect(c.vocab.length).toBeLessThanOrEqual(12);
        for (const v of c.vocab) {
          expect(v.de.trim()).toBe(v.de);
          expect(v.en.length).toBeGreaterThan(0);
          // Nouns carry their article through `gender`, never inside `de`.
          expect(v.de).not.toMatch(/^(der|die|das) /);
          if (v.plural !== undefined) expect(v.gender).toBeDefined();
        }

        expect(c.phrases.length).toBeGreaterThanOrEqual(5);
        expect(c.phrases.length).toBeLessThanOrEqual(6);
        for (const p of c.phrases) {
          expect(p.de).toMatch(/«[^»]+»/);
          expect(p.en.length).toBeGreaterThan(0);
        }

        expect(c.grammarIds.length).toBeGreaterThanOrEqual(1);
        expect(c.grammarIds.length).toBeLessThanOrEqual(2);
        for (const id of c.grammarIds) expect(GRAMMAR_IDS.has(id), id).toBe(true);

        expect(c.dialogue.length).toBeGreaterThanOrEqual(6);
        expect(c.dialogue.length).toBeLessThanOrEqual(8);
        expect(new Set(c.dialogue.map((d) => d.speaker)).size).toBe(2);
        c.dialogue.forEach((d, i) => {
          if (i > 0) expect(d.speaker).not.toBe(c.dialogue[i - 1].speaker);
          expect(d.de).not.toMatch(/[«»]/);
        });

        expect(c.check).toHaveLength(3);
        for (const q of c.check) {
          expect(q.prompt.split("___")).toHaveLength(2);
          expect(q.answer.trim().length).toBeGreaterThan(0);
          expect(q.hint.length).toBeGreaterThan(0);
          // The hint nudges; it must not give the answer away.
          expect(q.hint.toLowerCase()).not.toContain(q.answer.toLowerCase());
        }
      });
    }
  });
}
