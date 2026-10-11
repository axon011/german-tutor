import type { LessonContent } from "./types";
import { A1_CONTENT } from "./a1";
import { A1_PART2_CONTENT } from "./a1-part2";
import { A1_PART3_CONTENT } from "./a1-part3";
import { A2_CONTENT } from "./a2";
import { B1_CONTENT } from "./b1";
import { B2_CONTENT } from "./b2";

export type * from "./types";

/** Every lesson's study sheet, keyed by lesson id. One file per level. */
export const LESSON_CONTENT: Record<string, LessonContent> = {
  ...A1_CONTENT,
  ...A1_PART2_CONTENT,
  ...A1_PART3_CONTENT,
  ...A2_CONTENT,
  ...B1_CONTENT,
  ...B2_CONTENT,
};

export function getLessonContent(id: string): LessonContent | undefined {
  return LESSON_CONTENT[id];
}

/** The definite article a noun's gender takes in the nominative singular. */
export const ARTICLE = { m: "der", f: "die", n: "das" } as const;
