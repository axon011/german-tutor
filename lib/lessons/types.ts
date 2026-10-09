/**
 * The study sheet behind every Learn-tab lesson — what the learner reads and
 * drills BEFORE the tutor steers a conversation to the topic.
 *
 * Same language split as lib/curriculum.ts and lib/grammar.ts: goals, hints
 * and every `en` field are ENGLISH chrome; the German fields are learning
 * content. Inside German phrase text, the chunk worth memorising is marked
 * with «guillemets», exactly like grammar examples.
 *
 * The sheet follows one fixed order, the classic present → practise → produce
 * arc: goals (what you will be able to do) → words → phrases → the grammar
 * this lesson leans on → a model dialogue → a quick check → the conversation.
 */

export type Gender = "m" | "f" | "n";

export interface VocabItem {
  /**
   * German word. Nouns WITHOUT their article (the UI prints der/die/das from
   * `gender`); verbs in the infinitive; fixed expressions as written.
   */
  de: string;
  en: string;
  /** Nouns only. */
  gender?: Gender;
  /** Nouns only: the full plural form without article, e.g. "Brüder". Omit for nouns without a plural. */
  plural?: string;
}

export interface Phrase {
  /** German sentence; the reusable chunk is «marked». */
  de: string;
  en: string;
}

export interface DialogueLine {
  /** A German first name. Two speakers per dialogue. */
  speaker: string;
  de: string;
  en: string;
}

export interface CheckItem {
  /** German sentence with exactly one gap written as "___". */
  prompt: string;
  /** The word(s) that fill the gap. Graded case-sensitively (German nouns are capitalised). */
  answer: string;
  /** Other fillers that are also fully correct, if any. */
  accept?: string[];
  /** One English line shown after a wrong try, pointing at the rule — never the answer itself. */
  hint: string;
}

export interface LessonContent {
  /** Exactly 3 English can-do statements, each starting with a verb: "Say where you come from". */
  goals: string[];
  /** 10–12 core words for the topic, at the lesson's level. */
  vocab: VocabItem[];
  /** 5–6 ready-to-use sentences. */
  phrases: Phrase[];
  /** 1–2 ids from GRAMMAR_TOPICS (lib/grammar.ts) that this lesson's grammar focus relies on. */
  grammarIds: string[];
  /** 6–8 lines, two speakers alternating, using the lesson's words and grammar. */
  dialogue: DialogueLine[];
  /** Exactly 3 gap-fill items testing this lesson's words or grammar. */
  check: CheckItem[];
}
