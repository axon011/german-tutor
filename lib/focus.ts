/**
 * One lookup for everything that can steer a conversation.
 *
 * Two content modules can arm the tutor with a German `focus` instruction: the
 * guided curriculum (lib/curriculum.ts) and the grammar rulebook
 * (lib/grammar.ts). The client only ever sends an id, and both the API route
 * and the chat's focus bar need to resolve it without caring which module it
 * came from — so the resolution lives here, keyed on the "gr-" prefix that the
 * rulebook reserves for itself.
 */

import { getLesson } from "./curriculum";
import { getGrammarTopic, isGrammarId } from "./grammar";

export interface FocusEntry {
  id: string;
  kind: "lesson" | "grammar";
  /** English chrome — what the chat bar shows. */
  title: string;
  /** German instruction to the tutor. Grammar topics may lack one. */
  focus?: string;
  /** German opener offered as an input suggestion. Lessons only. */
  starter?: string;
}

export function getFocusEntry(id: string): FocusEntry | undefined {
  if (isGrammarId(id)) {
    const topic = getGrammarTopic(id);
    if (!topic) return undefined;
    return {
      id: topic.id,
      kind: "grammar",
      title: topic.title,
      focus: topic.focus,
    };
  }
  const lesson = getLesson(id);
  if (!lesson) return undefined;
  return {
    id: lesson.id,
    kind: "lesson",
    title: lesson.title,
    focus: lesson.focus,
    starter: lesson.starter,
  };
}

/** The English title behind an id, for chrome that only needs the label. */
export function getFocusTitle(id: string): string | undefined {
  return getFocusEntry(id)?.title;
}
