import { ARTICLE } from "../lessons";
import type { WordCard } from "./types";

/** What the learner must type for a card: nouns with their article. */
export function expectedAnswer(card: Pick<WordCard, "de" | "gender">): string {
  return card.gender ? `${ARTICLE[card.gender]} ${card.de}` : card.de;
}

function tidy(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?…]+$/u, "")
    .trim();
}

/**
 * Case-sensitive on purpose: "der bruder" is wrong German, and noun
 * capitalisation is exactly what a word card trains. A noun without its
 * article is wrong too — the article is the half of a noun learners forget.
 */
export function gradeWord(
  given: string,
  card: Pick<WordCard, "de" | "gender">,
): boolean {
  const answer = tidy(given);
  return answer.length > 0 && answer === tidy(expectedAnswer(card));
}
