/**
 * The grammar rulebook — a browsable A1 → B2 reference, ten topics per level.
 *
 * Split by language for the same reason as lib/curriculum.ts: `title`,
 * `summary`, `explanation` and every `en` translation are ENGLISH chrome (a
 * learner reads a rule to understand it, not to decode it), while the German
 * examples and `focus` are learning content. `focus` is never rendered — it is
 * an instruction TO THE TUTOR that app/api/chat/route.ts appends to the system
 * prompt when the learner presses "Practice in chat", exactly like a lesson.
 *
 * Inside `GrammarExample.de`, the words that actually carry the rule are marked
 * with «guillemets». The UI strips them and renders those words highlighted.
 * Guillemets are used because they never occur in the content itself.
 */

import type { CefrLevel } from "./tutor-prompt";

export interface GrammarExample {
  /** German sentence; «marked» words are rendered highlighted. */
  de: string;
  /** English translation, shown muted underneath. */
  en: string;
}

export interface GrammarTable {
  /** English caption above the table. */
  caption: string;
  headers: string[];
  rows: string[][];
}

/** The five families the rulebook is grouped into on the grid. */
export type GrammarCategory =
  | "verbs"
  | "cases"
  | "word-order"
  | "nouns"
  | "style";

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  "verbs",
  "cases",
  "word-order",
  "nouns",
  "style",
];

/**
 * Everything the UI needs to render a category: its English label and the
 * Tailwind classes for its spot colour. Kept here so a card, a filter chip, a
 * sheet header and a highlighted example word can never drift apart — and so
 * the class strings are literal, which is what Tailwind's scanner needs.
 *
 * The five families are print spot-colours, not a second palette: the card
 * itself stays a neutral surface and only the glyph, the dot and the marked
 * words carry the hue, so the grid still reads as ink on paper.
 */
export const CATEGORY_META: Record<
  GrammarCategory,
  {
    label: string;
    /** Grid-card ground + border — neutral in every category. */
    card: string;
    /** Glyph and other accent text on that ground. */
    accent: string;
    /** Solid dot on the filter chip. */
    dot: string;
    /** Label chip in the detail sheet. */
    chip: string;
    /** «marked» rule-carrying words inside an example. */
    mark: string;
  }
> = {
  verbs: {
    label: "Verbs",
    card: "bg-surface border-line",
    accent: "text-spot-brick",
    dot: "bg-spot-brick",
    chip: "border-2 border-spot-brick/50 text-spot-brick",
    mark: "bg-spot-brick/15 text-spot-brick",
  },
  cases: {
    label: "Cases & articles",
    card: "bg-surface border-line",
    accent: "text-spot-plum",
    dot: "bg-spot-plum",
    chip: "border-2 border-spot-plum/50 text-spot-plum",
    mark: "bg-spot-plum/15 text-spot-plum",
  },
  "word-order": {
    label: "Word order",
    card: "bg-surface border-line",
    accent: "text-spot-prussian",
    dot: "bg-spot-prussian",
    chip: "border-2 border-spot-prussian/50 text-spot-prussian",
    mark: "bg-spot-prussian/15 text-spot-prussian",
  },
  nouns: {
    label: "Nouns & pronouns",
    card: "bg-surface border-line",
    accent: "text-spot-olive",
    dot: "bg-spot-olive",
    chip: "border-2 border-spot-olive/50 text-spot-olive",
    mark: "bg-spot-olive/15 text-spot-olive",
  },
  style: {
    label: "Style & register",
    card: "bg-surface border-line",
    accent: "text-spot-rust",
    dot: "bg-spot-rust",
    chip: "border-2 border-spot-rust/50 text-spot-rust",
    mark: "bg-spot-rust/15 text-spot-rust",
  },
};

export interface GrammarTopic {
  /** Stable slug, always "gr-"-prefixed — the server routes on that prefix. */
  id: string;
  level: CefrLevel;
  /** Which of the five families this rule belongs to — tints its card. */
  category: GrammarCategory;
  /**
   * A very short typographic token that IS the rule — "den", "V2",
   * "hat … gemacht". Shown large on the grid card, so it has to stay under
   * ~14 characters. Content, not decoration: the learner should recognise the
   * rule from the glyph alone.
   */
  glyph: string;
  /** English chrome — the card title. */
  title: string;
  /** One English line, shown while the card is collapsed. */
  summary: string;
  /** 2–4 short English paragraphs. */
  explanation: string[];
  examples: GrammarExample[];
  table?: GrammarTable;
  /** German instruction to the tutor, injected into the system prompt. */
  focus?: string;
}

/** Trailing sentence shared by every focus string, as in the curriculum. */
const OPENER =
  "Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.";

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // ================================================================== A1
  {
    id: "gr-a1-01-personal-pronouns",
    level: "A1",
    category: "nouns",
    glyph: "ich · du · Sie",
    title: "Personal pronouns: ich, du, er, sie, es",
    summary: "Who is doing the action — and why German has three words for “you”.",
    explanation: [
      "German pronouns line up with English ones, with one big exception: there are three words for “you”. Use du for one friend, child or family member, ihr for several of them, and Sie for anyone you would address by their surname.",
      "Sie in the polite sense is always written with a capital S, anywhere in the sentence. In writing, that capital letter is the only thing separating it from sie meaning “she” or “they”.",
      "The pronoun decides the ending of the verb, so choosing the pronoun correctly is already half of conjugating correctly.",
    ],
    examples: [
      { de: "«Ich» heiße Aravind. Und wie heißt «du»?", en: "My name is Aravind. And what is your name?" },
      { de: "«Sie» kommt aus Berlin, aber «sie» wohnen in Hamburg.", en: "She comes from Berlin, but they live in Hamburg." },
      { de: "Entschuldigung, wohnen «Sie» auch hier im Haus?", en: "Excuse me, do you (formal) live in this building too?" },
    ],
    table: {
      caption: "Personal pronouns in the nominative (the subject form)",
      headers: ["Person", "Singular", "Plural"],
      rows: [
        ["1st", "ich (I)", "wir (we)"],
        ["2nd, informal", "du (you)", "ihr (you all)"],
        ["3rd", "er / sie / es (he / she / it)", "sie (they)"],
        ["2nd, formal", "Sie (you)", "Sie (you)"],
      ],
    },
    focus:
      "Thema dieser Regel: Personalpronomen im Nominativ. Übe mit dem Lerner: ich, du, er, sie, es, wir, ihr, sie und das höfliche Sie. Grammatikfokus: das richtige Pronomen wählen und die passende Verbform dazu bilden; besonders der Unterschied zwischen du, ihr und Sie. Stelle Fragen, bei denen der Lerner das Pronomen wechseln muss, und wechsle selbst einmal ins förmliche Sie. " +
      OPENER,
  },
  {
    id: "gr-a1-02-sein-haben",
    level: "A1",
    category: "verbs",
    glyph: "bin · hab",
    title: "The two key verbs: sein and haben",
    summary: "“To be” and “to have” are irregular — and you need them in every second sentence.",
    explanation: [
      "sein (to be) and haben (to have) are the two verbs you will use most often, and both are irregular, so their forms have to be learned as a block rather than derived from a rule.",
      "German uses haben where English often uses “to be”: age and hunger belong to haben. Ich habe Hunger means “I am hungry”, and Ich bin Hunger is simply wrong.",
      "Later on these two verbs come back as helpers for the past tense (Perfekt), so the effort you spend on them now pays twice.",
    ],
    examples: [
      { de: "Ich «bin» müde, aber ich «habe» noch viel Arbeit.", en: "I am tired, but I still have a lot of work." },
      { de: "Wie alt «bist» du? — Ich «bin» dreißig. Und ich «habe» Hunger!", en: "How old are you? — I am thirty. And I am hungry!" },
      { de: "Wir «sind» aus Indien und «haben» eine kleine Wohnung in Berlin.", en: "We are from India and have a small flat in Berlin." },
    ],
    table: {
      caption: "sein and haben in the present tense",
      headers: ["Person", "sein (to be)", "haben (to have)"],
      rows: [
        ["ich", "bin", "habe"],
        ["du", "bist", "hast"],
        ["er / sie / es", "ist", "hat"],
        ["wir", "sind", "haben"],
        ["ihr", "seid", "habt"],
        ["sie / Sie", "sind", "haben"],
      ],
    },
    focus:
      "Thema dieser Regel: die Verben \"sein\" und \"haben\" im Präsens. Übe mit dem Lerner: alle Formen von sein und haben, Alter, Herkunft, Befinden, Besitz. Grammatikfokus: bin/bist/ist/sind/seid und habe/hast/hat/haben/habt; außerdem die festen Wendungen mit haben (Hunger haben, Durst haben, Zeit haben, Recht haben). Stelle Fragen, in denen beide Verben vorkommen, und korrigiere falsche Formen durch Recasting. " +
      OPENER,
  },
  {
    id: "gr-a1-03-present-tense",
    level: "A1",
    category: "verbs",
    glyph: "-e -st -t -en",
    title: "Present tense: how German verbs get their endings",
    summary: "Cut off -en, add the ending that matches the person.",
    explanation: [
      "A German infinitive ends in -en (machen, wohnen, lernen). Remove that -en and you have the stem; the ending you add to the stem depends on who is doing the action.",
      "Two small spelling adjustments cover most exceptions. If the stem ends in -t or -d (arbeiten, finden), an extra -e is slipped in so the word stays pronounceable: du arbeitest. If the stem already ends in an s-sound (heißen, tanzen), the du-form takes only -t: du heißt.",
      "A group of strong verbs also change their stem vowel in the du- and er-forms: fahren becomes du fährst, sprechen becomes du sprichst, sehen becomes du siehst. The endings themselves stay exactly the same.",
      "German has no continuous form. Ich lerne Deutsch covers both “I learn German” and “I am learning German”.",
    ],
    examples: [
      { de: "Ich «wohne» in Berlin und «arbeite» bei einer kleinen Firma.", en: "I live in Berlin and work at a small company." },
      { de: "«Sprichst» du Deutsch? — Ja, ich «spreche» ein bisschen.", en: "Do you speak German? — Yes, I speak a little." },
      { de: "Meine Schwester «fährt» jeden Tag mit dem Fahrrad zur Arbeit.", en: "My sister rides her bike to work every day." },
    ],
    table: {
      caption: "Present-tense endings on three typical verbs",
      headers: ["Person", "machen", "arbeiten", "heißen"],
      rows: [
        ["ich", "mache", "arbeite", "heiße"],
        ["du", "machst", "arbeitest", "heißt"],
        ["er / sie / es", "macht", "arbeitet", "heißt"],
        ["wir", "machen", "arbeiten", "heißen"],
        ["ihr", "macht", "arbeitet", "heißt"],
        ["sie / Sie", "machen", "arbeiten", "heißen"],
      ],
    },
    focus:
      "Thema dieser Regel: Präsens der Verben. Übe mit dem Lerner: regelmäßige Verben (machen, wohnen, lernen, spielen), Verben mit Bindevokal (arbeiten, finden, warten) und starke Verben mit Vokalwechsel (fahren, sprechen, sehen, lesen, essen). Grammatikfokus: die Personalendungen -e, -st, -t, -en, -t, -en und der Vokalwechsel in der du- und er-Form. Frage nach Alltagstätigkeiten, sodass viele verschiedene Personen vorkommen. " +
      OPENER,
  },
  {
    id: "gr-a1-04-articles",
    level: "A1",
    category: "cases",
    glyph: "der die das",
    title: "The three articles: der, die, das",
    summary: "Every German noun has a gender, and the article is part of the word.",
    explanation: [
      "Every German noun is masculine (der), feminine (die) or neuter (das). The gender is mostly not predictable from the meaning — der Tisch, die Lampe, das Fenster — so learn each noun together with its article, as one unit, from the first moment you meet it.",
      "A few endings are reliable. Nouns in -ung, -heit, -keit, -schaft and -tion are feminine; -chen and -lein are always neuter (das Mädchen, even though it means “girl”); -er nouns for people who do something are masculine.",
      "der/die/das mean “the”: a thing already known. ein/eine mean “a”: a thing introduced for the first time. In the plural the definite article is die for all genders, and there is no plural of ein — you just drop it: Ich habe Freunde.",
      "German nouns are always written with a capital letter, wherever they stand.",
    ],
    examples: [
      { de: "«Der» Tisch ist neu, «die» Lampe ist alt und «das» Fenster ist offen.", en: "The table is new, the lamp is old and the window is open." },
      { de: "Ich suche «eine» Wohnung. «Die» Wohnung soll hell sein.", en: "I am looking for a flat. The flat should be bright." },
      { de: "«Das» Mädchen liest «ein» Buch.", en: "The girl is reading a book." },
    ],
    table: {
      caption: "Definite and indefinite articles in the nominative",
      headers: ["", "masculine", "feminine", "neuter", "plural"],
      rows: [
        ["definite (the)", "der Mann", "die Frau", "das Kind", "die Kinder"],
        ["indefinite (a)", "ein Mann", "eine Frau", "ein Kind", "— (Kinder)"],
        ["negative (no)", "kein Mann", "keine Frau", "kein Kind", "keine Kinder"],
      ],
    },
    focus:
      "Thema dieser Regel: die Artikel der, die, das und ein, eine. Übe mit dem Lerner: das Genus von Alltagsnomen (Möbel, Essen, Kleidung, Dinge im Zimmer), bestimmter vs. unbestimmter Artikel. Grammatikfokus: der/die/das, ein/eine, der Plural mit \"die\", typische Endungen wie -ung und -chen. Nenne beim Recasting immer das Nomen mit Artikel und frage den Lerner gezielt nach Gegenständen um ihn herum. " +
      OPENER,
  },
  {
    id: "gr-a1-05-plurals",
    level: "A1",
    category: "nouns",
    glyph: "Buch → Bücher",
    title: "Plural forms of nouns",
    summary: "German has five plural endings — and the article is always die.",
    explanation: [
      "Where English simply adds -s, German picks one of five patterns: -e, -(e)n, -er, -s, or no ending at all. Many of them also add an umlaut to the stem vowel: der Stuhl → die Stühle.",
      "There is no fully reliable rule, but there are strong tendencies. Feminine nouns almost always take -(e)n (die Frau → die Frauen). Short masculine nouns tend to take -e, often with an umlaut. Nouns ending in -er or -en usually stay unchanged. Borrowed words take -s (das Auto → die Autos).",
      "Whatever the ending, the plural article is always die in the nominative. So learn nouns as a triple: das Buch – die Bücher.",
    ],
    examples: [
      { de: "Ich habe zwei «Bücher» und drei «Stühle» gekauft.", en: "I bought two books and three chairs." },
      { de: "Die «Frauen» und die «Kinder» warten draußen.", en: "The women and the children are waiting outside." },
      { de: "In der Straße stehen viele «Autos».", en: "There are a lot of cars in the street." },
    ],
    table: {
      caption: "The five plural patterns",
      headers: ["Pattern", "Singular", "Plural"],
      rows: [
        ["-e", "der Tisch", "die Tische"],
        ["-e + umlaut", "der Stuhl", "die Stühle"],
        ["-(e)n", "die Frau", "die Frauen"],
        ["-er + umlaut", "das Buch", "die Bücher"],
        ["-s", "das Auto", "die Autos"],
        ["no ending", "der Lehrer", "die Lehrer"],
      ],
    },
    focus:
      "Thema dieser Regel: Pluralformen der Nomen. Übe mit dem Lerner: Plural von Alltagsnomen mit Mengenangaben (zwei, drei, viele). Grammatikfokus: die Pluralendungen -e, -(e)n, -er, -s und Nullendung, Umlaut im Plural, Artikel \"die\" im Plural. Frage nach Dingen im Haushalt, im Büro und in der Stadt, sodass der Lerner viele Pluralformen bilden muss, und wiederhole falsche Formen korrekt. " +
      OPENER,
  },
  {
    id: "gr-a1-06-accusative",
    level: "A1",
    category: "cases",
    glyph: "den",
    title: "The accusative case",
    summary: "The thing the action happens to — and the only case that changes “der”.",
    explanation: [
      "German marks the role a noun plays in the sentence by changing its article. The subject (who acts) is in the nominative; the direct object (what the action is aimed at) is in the accusative.",
      "The good news for beginners: in the accusative only the masculine changes. der becomes den and ein becomes einen. Feminine, neuter and plural articles look exactly as they do in the nominative.",
      "Most verbs take an accusative object: kaufen, haben, sehen, brauchen, nehmen, essen. The prepositions durch, für, gegen, ohne and um always take the accusative too.",
      "Personal pronouns change as well: ich → mich, du → dich, er → ihn, wir → uns, ihr → euch. sie and es stay the same.",
    ],
    examples: [
      { de: "Ich kaufe «den» Tisch und «einen» Stuhl.", en: "I am buying the table and a chair." },
      { de: "Ich nehme «einen» Kaffee und «eine» Suppe, bitte.", en: "I will have a coffee and a soup, please." },
      { de: "Ich kenne «ihn» nicht, aber ich sehe «dich» oft im Park.", en: "I do not know him, but I often see you in the park." },
    ],
    table: {
      caption: "Nominative vs. accusative — only the masculine moves",
      headers: ["", "masculine", "feminine", "neuter", "plural"],
      rows: [
        ["Nominative (subject)", "der / ein", "die / eine", "das / ein", "die / —"],
        ["Accusative (object)", "den / einen", "die / eine", "das / ein", "die / —"],
      ],
    },
    focus:
      "Thema dieser Regel: der Akkusativ. Übe mit dem Lerner: Sätze mit direktem Objekt (kaufen, haben, brauchen, sehen, nehmen, essen), Einkaufen und Bestellen. Grammatikfokus: den/einen bei maskulinen Nomen, unveränderte Formen bei feminin, neutral und Plural, Akkusativpronomen (mich, dich, ihn, uns, euch) und die Präpositionen für, ohne, durch, gegen, um. Stelle viele Was-Fragen, damit der Lerner Akkusativobjekte bilden muss. " +
      OPENER,
  },
  {
    id: "gr-a1-07-verb-second",
    level: "A1",
    category: "word-order",
    glyph: "V2",
    title: "Word order: the verb goes second",
    summary: "Whatever starts the sentence, the conjugated verb is in position two.",
    explanation: [
      "In a German statement the conjugated verb occupies the second position. Position here means the second element, not the second word — an element can be several words long.",
      "This means you may start with anything you want to emphasise: the subject, a time expression, a place. But whatever you put first, the verb follows immediately, and the subject then slides in behind it.",
      "So Ich gehe heute ins Kino and Heute gehe ich ins Kino are both correct. Heute ich gehe ins Kino is not — that is the single most common beginner mistake in German.",
      "When a sentence has two verb parts (a modal, a separable prefix, a participle), the second part goes right to the end. German sentences are held together by a bracket: verb at position two, the rest at the very end.",
    ],
    examples: [
      { de: "Heute «gehe» ich ins Kino.", en: "Today I am going to the cinema." },
      { de: "Am Wochenende «besuche» ich meine Familie.", en: "At the weekend I visit my family." },
      { de: "Morgen «will» ich früh «aufstehen».", en: "Tomorrow I want to get up early." },
    ],
    focus:
      "Thema dieser Regel: die Verb-an-zweiter-Stelle-Regel. Übe mit dem Lerner: Aussagesätze, die mit einer Zeit- oder Ortsangabe beginnen (Heute …, Am Wochenende …, In Berlin …). Grammatikfokus: konjugiertes Verb an Position zwei, Subjekt direkt nach dem Verb bei Inversion, Satzklammer mit Modalverb oder trennbarem Verb. Bitte den Lerner immer wieder, denselben Satz mit einer anderen Angabe am Anfang zu formulieren. " +
      OPENER,
  },
  {
    id: "gr-a1-08-questions",
    level: "A1",
    category: "word-order",
    glyph: "Wo? Wie? Was?",
    title: "Asking questions: yes/no and W-questions",
    summary: "Move the verb to the front, or put a W-word in front of it.",
    explanation: [
      "For a yes/no question, simply move the conjugated verb to position one and put the subject right behind it: Du wohnst hier → Wohnst du hier? German needs no equivalent of “do” — that helper verb does not exist here.",
      "For an open question, start with a W-word and keep the verb in second position: Wo wohnst du? The common ones are wer (who), was (what), wo (where), wohin (where to), woher (where from), wann (when), wie (how), warum (why) and welch- (which).",
      "wie combines with adjectives to make many everyday questions: wie alt, wie lange, wie oft, wie viel, wie viele.",
      "To answer a negative question positively, German uses doch instead of ja: Hast du keinen Hunger? — Doch!",
    ],
    examples: [
      { de: "«Wohnst» du in Berlin?", en: "Do you live in Berlin?" },
      { de: "«Woher» kommst du und «wie lange» bist du schon hier?", en: "Where do you come from and how long have you been here?" },
      { de: "«Warum» lernst du Deutsch?", en: "Why are you learning German?" },
    ],
    focus:
      "Thema dieser Regel: Fragen bilden. Übe mit dem Lerner: Ja/Nein-Fragen durch Inversion und W-Fragen mit wer, was, wo, wohin, woher, wann, wie, warum, welch-. Grammatikfokus: Verb an Position eins bei Ja/Nein-Fragen, W-Wort plus Verb an Position zwei, Antwort mit \"doch\" auf verneinte Fragen. Lass den Lerner selbst Fragen an dich stellen und bitte ihn nach jeder deiner Antworten um eine Nachfrage. " +
      OPENER,
  },
  {
    id: "gr-a1-09-negation",
    level: "A1",
    category: "word-order",
    glyph: "nicht · kein",
    title: "Saying no: nicht vs. kein",
    summary: "kein negates nouns, nicht negates everything else.",
    explanation: [
      "Use kein when you are negating a noun that would otherwise carry ein or no article at all: Ich habe ein Auto → Ich habe kein Auto. kein takes exactly the same endings as ein, and unlike ein it also exists in the plural: keine Kinder.",
      "Use nicht in every other situation: to negate a verb, an adjective, an adverb, or a noun that carries a definite article or a possessive. Ich kenne den Mann nicht. Das ist nicht mein Buch.",
      "Position matters. nicht comes at the end of the sentence when it negates the whole statement, but immediately in front of the word it targets when it negates just that word: Ich fahre nicht nach Berlin (I am not going to Berlin).",
    ],
    examples: [
      { de: "Ich habe «kein» Auto und «keine» Zeit.", en: "I have no car and no time." },
      { de: "Das Buch ist «nicht» interessant.", en: "The book is not interesting." },
      { de: "Ich kenne den Mann «nicht».", en: "I do not know the man." },
    ],
    focus:
      "Thema dieser Regel: Verneinung mit \"nicht\" und \"kein\". Übe mit dem Lerner: verneinte Antworten auf Fragen zu Besitz, Vorlieben und Alltag. Grammatikfokus: kein vor Nomen mit unbestimmtem oder ohne Artikel (mit den Endungen von ein), nicht bei Verben, Adjektiven und Nomen mit bestimmtem Artikel, Stellung von nicht am Satzende oder direkt vor dem verneinten Wort. Stelle Fragen so, dass der Lerner oft verneinen muss. " +
      OPENER,
  },
  {
    id: "gr-a1-10-possessives",
    level: "A1",
    category: "nouns",
    glyph: "mein · meine",
    title: "Possessive articles: mein, dein, sein, ihr",
    summary: "“My”, “your”, “his” — they behave exactly like ein.",
    explanation: [
      "Every personal pronoun has a matching possessive: ich → mein, du → dein, er → sein, sie → ihr, es → sein, wir → unser, ihr → euer, sie → ihr, Sie → Ihr (capitalised, like the polite pronoun).",
      "Possessives take the same endings as ein and kein. That is the whole rule — if you know ein/eine/einen, you know mein/meine/meinen.",
      "The ending agrees with the noun that is owned, never with the owner. Meine Schwester is “my sister” whether the speaker is a man or a woman, because Schwester is feminine.",
      "Watch out for ihr: it means both “her” and “their”, and capitalised Ihr means the polite “your”. Only the context tells them apart.",
    ],
    examples: [
      { de: "«Mein» Bruder und «meine» Schwester wohnen in Köln.", en: "My brother and my sister live in Cologne." },
      { de: "Ich besuche «meinen» Vater am Sonntag.", en: "I am visiting my father on Sunday." },
      { de: "Ist das «Ihr» Mantel? — Nein, das ist «ihr» Mantel.", en: "Is that your (formal) coat? — No, that is her coat." },
    ],
    table: {
      caption: "mein in the nominative and accusative",
      headers: ["", "masculine", "feminine", "neuter", "plural"],
      rows: [
        ["Nominative", "mein Bruder", "meine Schwester", "mein Kind", "meine Eltern"],
        ["Accusative", "meinen Bruder", "meine Schwester", "mein Kind", "meine Eltern"],
      ],
    },
    focus:
      "Thema dieser Regel: Possessivartikel. Übe mit dem Lerner: Familie, Besitz und Alltagsgegenstände mit mein, dein, sein, ihr, unser, euer und dem höflichen Ihr. Grammatikfokus: Possessivartikel mit den Endungen von \"ein\", Kongruenz mit dem besessenen Nomen (nicht mit dem Besitzer), Akkusativform auf -en beim Maskulinum. Frage nach einzelnen Familienmitgliedern und Gegenständen des Lerners. " +
      OPENER,
  },

  // ================================================================== A2
  {
    id: "gr-a2-01-perfekt",
    level: "A2",
    category: "verbs",
    glyph: "hat … gemacht",
    title: "The Perfekt: talking about the past",
    summary: "haben or sein plus a participle at the end — the spoken past tense.",
    explanation: [
      "In spoken German the past is normally expressed with the Perfekt: a helper verb in position two plus a participle at the very end of the sentence. Ich habe einen Film gesehen.",
      "Most verbs use haben. sein is used by verbs of movement from A to B (gehen, fahren, fliegen, kommen), verbs of change of state (aufstehen, einschlafen, sterben), and the three odd ones out: sein, bleiben, werden.",
      "Weak verbs form the participle as ge- + stem + -t: machen → gemacht. Strong verbs use ge- + stem + -en and often change the vowel: sehen → gesehen, gehen → gegangen, trinken → getrunken. These have to be memorised.",
      "Two groups take no ge-: verbs with an inseparable prefix (besuchen → besucht, verstehen → verstanden) and verbs ending in -ieren (studieren → studiert). Separable verbs put the ge- in the middle: aufstehen → aufgestanden.",
    ],
    examples: [
      { de: "Gestern «habe» ich einen Film «gesehen».", en: "Yesterday I watched a film." },
      { de: "Am Wochenende «bin» ich nach München «gefahren».", en: "At the weekend I travelled to Munich." },
      { de: "Ich «habe» meine Großeltern «besucht» und lange mit ihnen «gesprochen».", en: "I visited my grandparents and talked with them for a long time." },
    ],
    focus:
      "Thema dieser Regel: das Perfekt. Übe mit dem Lerner: erzählen, was er gestern, am Wochenende oder im Urlaub gemacht hat. Grammatikfokus: Hilfsverb haben oder sein, Partizip II am Satzende, regelmäßige Formen (ge…t) und unregelmäßige Formen (gegangen, gefahren, gesehen, getrunken), kein ge- bei besuchen, verstehen, studieren. Hake nach Details nach, damit viele verschiedene Partizipien vorkommen. " +
      OPENER,
  },
  {
    id: "gr-a2-02-praeteritum-sein-haben",
    level: "A2",
    category: "verbs",
    glyph: "war · hatte",
    title: "Präteritum of sein, haben and the modals",
    summary: "Some verbs sound wrong in the Perfekt — say war and hatte instead.",
    explanation: [
      "German has a second past tense, the Präteritum. In everyday speech it is used mainly in writing and story-telling — with one important exception: a small group of very frequent verbs prefers the Präteritum even in conversation.",
      "That group is sein (war), haben (hatte), the modal verbs (konnte, musste, wollte, durfte, sollte) and es gibt (es gab). Ich war müde sounds natural; Ich bin müde gewesen sounds heavy and bookish.",
      "The forms are easy: the ich- and er-forms are identical and carry no ending, and the modals lose their umlaut in the past (können → konnte).",
      "So the practical rule at A2 is: use Perfekt for everything, except sein, haben, the modals and es gibt, where you use the Präteritum.",
    ],
    examples: [
      { de: "Gestern «war» ich krank und «hatte» keine Zeit.", en: "Yesterday I was ill and had no time." },
      { de: "Wir «konnten» nicht kommen, weil wir arbeiten «mussten».", en: "We could not come because we had to work." },
      { de: "In meinem Dorf «gab» es keinen Supermarkt.", en: "In my village there was no supermarket." },
    ],
    table: {
      caption: "Präteritum forms you need in conversation",
      headers: ["Person", "sein", "haben", "können", "müssen"],
      rows: [
        ["ich", "war", "hatte", "konnte", "musste"],
        ["du", "warst", "hattest", "konntest", "musstest"],
        ["er / sie / es", "war", "hatte", "konnte", "musste"],
        ["wir", "waren", "hatten", "konnten", "mussten"],
        ["ihr", "wart", "hattet", "konntet", "musstet"],
        ["sie / Sie", "waren", "hatten", "konnten", "mussten"],
      ],
    },
    focus:
      "Thema dieser Regel: das Präteritum von sein, haben, den Modalverben und \"es gibt\". Übe mit dem Lerner: über die Kindheit, die letzte Woche oder eine frühere Wohnung sprechen. Grammatikfokus: war, hatte, konnte, musste, wollte, durfte, sollte, es gab; identische Formen in der ich- und er-Form; kein Umlaut im Präteritum der Modalverben. Frage nach Zuständen und Verpflichtungen in der Vergangenheit, nicht nur nach Handlungen. " +
      OPENER,
  },
  {
    id: "gr-a2-03-dative",
    level: "A2",
    category: "cases",
    glyph: "dem · der",
    title: "The dative case",
    summary: "The person who receives something — and the case that changes everything.",
    explanation: [
      "The dative marks the indirect object: the person to or for whom something happens. Ich gebe dem Kind ein Buch — the book is the direct object (accusative), the child receives it (dative).",
      "Unlike the accusative, the dative changes all four forms: der → dem, die → der, das → dem, and the plural die → den, with an -n added to the noun itself (den Kindern).",
      "A group of verbs takes a dative object where English would use a plain object: helfen, danken, gehören, gefallen, antworten, passen, schmecken. Ich helfe dir, not Ich helfe dich.",
      "The pronouns change too: mir, dir, ihm, ihr, ihm, uns, euch, ihnen, Ihnen. And a fixed set of prepositions always takes the dative: aus, bei, mit, nach, seit, von, zu.",
    ],
    examples: [
      { de: "Ich gebe «dem» Kind ein Buch.", en: "I am giving the child a book." },
      { de: "Kannst du «mir» bitte helfen?", en: "Can you help me, please?" },
      { de: "Nach «der» Arbeit fahre ich mit «dem» Bus zu «meiner» Schwester.", en: "After work I take the bus to my sister's place." },
    ],
    table: {
      caption: "The dative article in all genders",
      headers: ["", "masculine", "feminine", "neuter", "plural"],
      rows: [
        ["Nominative", "der / ein", "die / eine", "das / ein", "die / —"],
        ["Accusative", "den / einen", "die / eine", "das / ein", "die / —"],
        ["Dative", "dem / einem", "der / einer", "dem / einem", "den + -n / —"],
      ],
    },
    focus:
      "Thema dieser Regel: der Dativ. Übe mit dem Lerner: schenken, geben, helfen, gefallen, gehören und Sätze mit den Präpositionen aus, bei, mit, nach, seit, von, zu. Grammatikfokus: dem/der/dem/den(+n), einem/einer/einem, Dativpronomen (mir, dir, ihm, ihr, uns, euch, ihnen), Dativverben. Stelle Wem-Fragen und lass den Lerner erzählen, wem er hilft und was ihm gefällt. " +
      OPENER,
  },
  {
    id: "gr-a2-04-prepositions",
    level: "A2",
    category: "cases",
    glyph: "wohin? wo?",
    title: "Prepositions: fixed cases and the two-way group",
    summary: "Some prepositions always take one case; nine of them depend on movement.",
    explanation: [
      "One group of prepositions always takes the accusative: durch, für, gegen, ohne, um. Another group always takes the dative: aus, bei, mit, nach, seit, von, zu. These two lists are short enough to learn by heart, and doing so removes most preposition errors.",
      "Nine prepositions belong to a third group, the Wechselpräpositionen: in, an, auf, über, unter, vor, hinter, neben, zwischen. They take the accusative when there is movement towards a goal (answering wohin?) and the dative when they describe a static location (answering wo?).",
      "The verb usually gives the case away. Movement verbs — gehen, fahren, legen, stellen, hängen (to hang something up) — go with the accusative. Static verbs — sein, bleiben, liegen, stehen, hängen (to be hanging) — go with the dative.",
      "Contractions are normal and expected in speech: in dem → im, in das → ins, an dem → am, zu der → zur, bei dem → beim.",
    ],
    examples: [
      { de: "Ich gehe «in die» Küche. — Ich bin «in der» Küche.", en: "I am going into the kitchen. — I am in the kitchen." },
      { de: "Stell die Flasche bitte «auf den» Tisch; die Gläser stehen schon «auf dem» Tisch.", en: "Please put the bottle on the table; the glasses are already on the table." },
      { de: "Ich fahre «mit dem» Bus «zur» Arbeit und komme «ohne» Auto gut zurecht.", en: "I take the bus to work and manage fine without a car." },
    ],
    table: {
      caption: "The two-way prepositions: wohin? (accusative) vs. wo? (dative)",
      headers: ["Preposition", "wohin? + accusative", "wo? + dative"],
      rows: [
        ["in", "Ich gehe in die Schule.", "Ich bin in der Schule."],
        ["auf", "Ich lege es auf den Tisch.", "Es liegt auf dem Tisch."],
        ["an", "Ich hänge das Bild an die Wand.", "Das Bild hängt an der Wand."],
        ["neben", "Ich stelle den Stuhl neben das Sofa.", "Der Stuhl steht neben dem Sofa."],
        ["vor", "Ich fahre vor das Haus.", "Ich warte vor dem Haus."],
      ],
    },
    focus:
      "Thema dieser Regel: Präpositionen mit festem Kasus und Wechselpräpositionen. Übe mit dem Lerner: die Wohnung beschreiben, Wege beschreiben, Dinge irgendwohin stellen oder legen. Grammatikfokus: durch, für, gegen, ohne, um mit Akkusativ; aus, bei, mit, nach, seit, von, zu mit Dativ; in, an, auf, über, unter, vor, hinter, neben, zwischen mit Akkusativ bei Bewegung (wohin?) und Dativ bei Position (wo?); Verschmelzungen wie im, ins, am, zur. Stelle abwechselnd Wo- und Wohin-Fragen. " +
      OPENER,
  },
  {
    id: "gr-a2-05-subordinate-clauses",
    level: "A2",
    category: "word-order",
    glyph: "…, weil",
    title: "Subordinate clauses with weil and dass",
    summary: "After a conjunction like weil or dass, the verb drops to the very end.",
    explanation: [
      "A subordinate clause is introduced by a conjunction — weil (because), dass (that), wenn (if/when), ob (whether), obwohl (although) — and its conjugated verb moves to the last position of the clause.",
      "Ich bleibe zu Hause, weil ich müde bin. The comma before the conjunction is obligatory in German, not optional as in English.",
      "If a sentence has two verb parts, the conjugated one is still last, so the order flips compared to a main clause: … weil ich arbeiten muss, not … weil ich muss arbeiten.",
      "Put the subordinate clause first and the main clause has to invert, because the whole clause counts as position one: Weil ich müde bin, bleibe ich zu Hause.",
      "Careful: denn also means “because”, but it is a coordinating conjunction and leaves the word order untouched: Ich bleibe zu Hause, denn ich bin müde.",
    ],
    examples: [
      { de: "Ich bleibe zu Hause, weil ich müde «bin».", en: "I am staying at home because I am tired." },
      { de: "Ich glaube, dass er morgen «kommt».", en: "I think that he is coming tomorrow." },
      { de: "Weil ich arbeiten «muss», kann ich nicht mitkommen.", en: "Because I have to work, I cannot come along." },
    ],
    focus:
      "Thema dieser Regel: Nebensätze mit \"weil\" und \"dass\". Übe mit dem Lerner: Entscheidungen begründen, Meinungen mit \"Ich glaube, dass …\" formulieren. Grammatikfokus: konjugiertes Verb am Ende des Nebensatzes, Komma vor der Konjunktion, Inversion im Hauptsatz, wenn der Nebensatz vorangeht, Unterschied zwischen weil (Nebensatz) und denn (Hauptsatz). Frage konsequent \"Warum?\" nach jeder Aussage des Lerners. " +
      OPENER,
  },
  {
    id: "gr-a2-06-comparative-superlative",
    level: "A2",
    category: "cases",
    glyph: "gut → besser",
    title: "Comparative and superlative",
    summary: "größer als, am größten — and the handful of irregular forms.",
    explanation: [
      "The comparative adds -er to the adjective, the superlative adds -sten and is preceded by am: schnell → schneller → am schnellsten. Unlike English, German never uses “more” for this: interessanter, not mehr interessant.",
      "Many short adjectives add an umlaut in both forms: alt → älter → am ältesten; groß → größer → am größten; jung, lang, warm, kalt, stark behave the same way.",
      "Comparison uses als, equality uses so … wie. Berlin ist größer als Hamburg. Hamburg ist so schön wie Berlin.",
      "Four forms are irregular and worth memorising outright: gut → besser → am besten; viel → mehr → am meisten; gern → lieber → am liebsten; hoch → höher → am höchsten.",
      "In front of a noun the superlative behaves like a normal adjective and takes an ending: der schnellste Zug.",
    ],
    examples: [
      { de: "Berlin ist «größer als» meine Heimatstadt.", en: "Berlin is bigger than my home town." },
      { de: "Ich trinke gern Tee, aber «lieber» Kaffee — «am liebsten» aber Wasser.", en: "I like drinking tea, but I prefer coffee — most of all, though, water." },
      { de: "Der Sommer hier ist «nicht so» warm «wie» in Indien.", en: "The summer here is not as warm as in India." },
    ],
    table: {
      caption: "Regular and irregular comparison",
      headers: ["Adjective", "Comparative", "Superlative"],
      rows: [
        ["schnell", "schneller", "am schnellsten"],
        ["groß", "größer", "am größten"],
        ["alt", "älter", "am ältesten"],
        ["gut", "besser", "am besten"],
        ["viel", "mehr", "am meisten"],
        ["gern", "lieber", "am liebsten"],
        ["hoch", "höher", "am höchsten"],
      ],
    },
    focus:
      "Thema dieser Regel: Komparativ und Superlativ. Übe mit dem Lerner: Städte, Verkehrsmittel, Jahreszeiten und Gewohnheiten vergleichen und eine Wahl begründen. Grammatikfokus: -er und am …-sten, Umlaut bei kurzen Adjektiven, Vergleich mit \"als\" und Gleichheit mit \"so … wie\", die unregelmäßigen Formen gut/besser/am besten, viel/mehr, gern/lieber, hoch/höher. Fordere immer wieder direkte Vergleiche statt einzelner Aussagen. " +
      OPENER,
  },
  {
    id: "gr-a2-07-modal-verbs",
    level: "A2",
    category: "verbs",
    glyph: "muss … gehen",
    title: "Modal verbs: können, müssen, wollen, dürfen, sollen, mögen",
    summary: "A modal in second position pushes the main verb, as an infinitive, to the end.",
    explanation: [
      "Modal verbs express ability, obligation, wish or permission. They are conjugated and stand in position two, while the verb that carries the meaning goes to the end of the sentence as a bare infinitive: Ich muss heute früh aufstehen.",
      "All six are irregular in the same way: the singular changes its vowel and the ich- and er-forms carry no ending at all — ich kann, er kann. The plural forms are regular.",
      "Meanings worth keeping apart: müssen is “must / have to”, but nicht müssen means “don't have to”, while nicht dürfen means “must not”. sollen is an instruction from someone else (“I'm supposed to”), and möchte is the polite “would like”, a softer form of wollen.",
      "When the meaning is obvious the main verb can be dropped: Ich muss nach Hause (I have to go home).",
    ],
    examples: [
      { de: "Ich «muss» heute früh «aufstehen».", en: "I have to get up early today." },
      { de: "«Darfst» du hier «parken»? — Nein, hier «darf» man nicht «parken».", en: "Are you allowed to park here? — No, you must not park here." },
      { de: "Ich «möchte» einen Kaffee «bestellen», aber ich «kann» kein Deutsch.", en: "I would like to order a coffee, but I do not speak German." },
    ],
    table: {
      caption: "The six modal verbs in the present tense",
      headers: ["Person", "können", "müssen", "wollen", "dürfen", "sollen", "mögen"],
      rows: [
        ["ich", "kann", "muss", "will", "darf", "soll", "mag"],
        ["du", "kannst", "musst", "willst", "darfst", "sollst", "magst"],
        ["er / sie / es", "kann", "muss", "will", "darf", "soll", "mag"],
        ["wir", "können", "müssen", "wollen", "dürfen", "sollen", "mögen"],
        ["ihr", "könnt", "müsst", "wollt", "dürft", "sollt", "mögt"],
        ["sie / Sie", "können", "müssen", "wollen", "dürfen", "sollen", "mögen"],
      ],
    },
    focus:
      "Thema dieser Regel: Modalverben. Übe mit dem Lerner: Pflichten, Fähigkeiten, Wünsche, Erlaubnis und Verbote im Alltag. Grammatikfokus: können, müssen, wollen, dürfen, sollen, mögen/möchten; endungslose ich- und er-Form; Infinitiv am Satzende; Unterschied zwischen \"nicht müssen\" und \"nicht dürfen\". Stelle Fragen zu Regeln am Arbeitsplatz und zu Plänen, damit mehrere Modalverben vorkommen. " +
      OPENER,
  },
  {
    id: "gr-a2-08-separable-verbs",
    level: "A2",
    category: "verbs",
    glyph: "steh … auf",
    title: "Separable verbs",
    summary: "aufstehen splits in two: the verb stays, the prefix flies to the end.",
    explanation: [
      "Many German verbs consist of a prefix plus a base verb: aufstehen, einkaufen, fernsehen, anrufen, mitkommen. In a main clause the prefix detaches and moves to the very end: Ich stehe um sieben Uhr auf.",
      "The prefix is stressed when you say the infinitive — ÁUFstehen — and that stress is the reliable test for whether a verb is separable.",
      "Inseparable prefixes never detach: be-, ge-, er-, ver-, zer-, ent-, emp-, miss-. Ich verstehe dich, never Ich stehe dich ver.",
      "In the Perfekt the ge- slides between prefix and stem (aufgestanden, eingekauft), and in a subordinate clause or after a modal the verb is written as one word again: … weil ich früh aufstehe / Ich muss früh aufstehen.",
    ],
    examples: [
      { de: "Ich «stehe» jeden Tag um sieben Uhr «auf».", en: "I get up at seven o'clock every day." },
      { de: "«Rufst» du mich heute Abend «an»?", en: "Will you call me this evening?" },
      { de: "Gestern habe ich im Supermarkt «eingekauft» und dann «ferngesehen».", en: "Yesterday I did the shopping at the supermarket and then watched TV." },
    ],
    focus:
      "Thema dieser Regel: trennbare Verben. Übe mit dem Lerner: Tagesablauf und Verabredungen mit aufstehen, einkaufen, fernsehen, anrufen, mitkommen, abholen, ankommen, aufräumen. Grammatikfokus: Präfix am Satzende im Hauptsatz, zusammengeschriebene Form im Nebensatz und nach Modalverben, Partizip II mit ge- in der Mitte, Abgrenzung zu untrennbaren Präfixen wie be-, ver-, ent-. Frag den Lerner Schritt für Schritt durch seinen Tag. " +
      OPENER,
  },
  {
    id: "gr-a2-09-imperative",
    level: "A2",
    category: "verbs",
    glyph: "Komm!",
    title: "The imperative: giving instructions",
    summary: "Three forms — du, ihr and Sie — and only the Sie-form keeps its pronoun.",
    explanation: [
      "The du-imperative is the verb stem with no pronoun and usually no ending: Komm! Geh! Warte! Verbs that change e → i in the present keep that change here: sprechen → Sprich!, but verbs with an umlaut lose it: fahren → Fahr!",
      "The ihr-imperative is identical to the normal ihr-form, just without the pronoun: Kommt! Wartet!",
      "The Sie-imperative keeps the pronoun and puts the verb first: Kommen Sie bitte herein! This is the form you need with strangers, officials and in shops.",
      "sein is irregular in all three: Sei ruhig! Seid ruhig! Seien Sie ruhig!",
      "bitte and mal soften an imperative considerably — Warte mal! sounds friendly where Warte! can sound sharp.",
    ],
    examples: [
      { de: "«Komm» bitte um acht Uhr!", en: "Please come at eight o'clock." },
      { de: "«Gehen Sie» geradeaus und «biegen Sie» dann links «ab».", en: "Go straight ahead and then turn left." },
      { de: "«Sprich» bitte langsamer — ich verstehe dich nicht.", en: "Please speak more slowly — I do not understand you." },
    ],
    focus:
      "Thema dieser Regel: der Imperativ. Übe mit dem Lerner: Wegbeschreibungen, Ratschläge, Bitten und Anweisungen. Grammatikfokus: du-Form ohne Pronomen und ohne Endung, ihr-Form wie im Präsens, Sie-Form mit nachgestelltem Pronomen, e-i-Wechsel (sprich, nimm, gib), kein Umlaut (fahr), unregelmäßiges \"sei/seid/seien Sie\", Abschwächung mit bitte und mal. Wechsle bewusst zwischen Du- und Sie-Situationen. " +
      OPENER,
  },
  {
    id: "gr-a2-10-reflexive-verbs",
    level: "A2",
    category: "verbs",
    glyph: "sich freuen",
    title: "Reflexive verbs",
    summary: "Verbs that need mich, dich, sich — often where English needs nothing at all.",
    explanation: [
      "A reflexive verb carries a pronoun that points back at the subject: sich freuen, sich interessieren, sich erinnern, sich waschen, sich beeilen. Ich freue mich.",
      "The reflexive pronouns are mich, dich, sich, uns, euch, sich. Only the third person has its own word, sich, and it covers both singular and plural.",
      "The pronoun switches to the dative when the sentence already has a direct object: Ich wasche mich (accusative) but Ich wasche mir die Hände (dative — the hands are the object). In the dative, mich becomes mir and dich becomes dir; everything else is unchanged.",
      "Many reflexive verbs come with a fixed preposition that has to be learned with them: sich freuen auf (look forward to), sich freuen über (be glad about), sich interessieren für, sich ärgern über, sich erinnern an.",
    ],
    examples: [
      { de: "Ich «freue mich auf» das Wochenende.", en: "I am looking forward to the weekend." },
      { de: "«Interessierst du dich für» Fußball?", en: "Are you interested in football?" },
      { de: "Ich wasche «mir» die Hände und beeile «mich».", en: "I wash my hands and hurry up." },
    ],
    focus:
      "Thema dieser Regel: Reflexivverben. Übe mit dem Lerner: Gefühle, Interessen, Morgenroutine und Erinnerungen mit sich freuen, sich interessieren, sich ärgern, sich erinnern, sich beeilen, sich waschen, sich anziehen. Grammatikfokus: Reflexivpronomen mich, dich, sich, uns, euch, sich; Dativform (mir, dir), wenn ein weiteres Objekt im Satz steht; feste Präpositionen wie \"sich freuen auf\" und \"sich interessieren für\". Frage nach echten Interessen und Plänen des Lerners. " +
      OPENER,
  },

  // ================================================================== B1
  {
    id: "gr-b1-01-relative-clauses",
    level: "B1",
    category: "word-order",
    glyph: "…, der …",
    title: "Relative clauses",
    summary: "der, die, das as “who / which” — the verb goes to the end.",
    explanation: [
      "A relative clause adds information about a noun. The relative pronoun looks almost exactly like the definite article — der, die, das, die — and, as in any subordinate clause, the conjugated verb moves to the end.",
      "Two things decide the form of the pronoun. Its gender and number come from the noun it refers to; its case comes from its own role inside the relative clause. Der Mann, den ich gestern getroffen habe — masculine because of Mann, accusative because he is the object of treffen.",
      "In the dative and genitive the pronoun differs from the article: dative plural is denen, and the genitive forms are dessen (m/n) and deren (f/pl).",
      "A preposition stands in front of the pronoun and fixes the case: die Firma, bei der ich arbeite. And unlike English, the relative pronoun can never be left out — Das Buch, das ich lese, always needs its das.",
    ],
    examples: [
      { de: "Der Mann, «der» dort steht, ist mein Chef.", en: "The man standing over there is my boss." },
      { de: "Das ist das Buch, «das» ich dir empfohlen habe.", en: "That is the book I recommended to you." },
      { de: "Die Firma, «bei der» ich arbeite, ist noch sehr jung.", en: "The company I work for is still very young." },
    ],
    focus:
      "Thema dieser Regel: Relativsätze. Übe mit dem Lerner: Personen, Orte und Dinge genauer beschreiben, statt kurze Hauptsätze aneinanderzureihen. Grammatikfokus: Relativpronomen der/die/das/die, Genus und Numerus vom Bezugswort, Kasus aus der Funktion im Relativsatz, Sonderformen denen, dessen, deren, Präposition vor dem Pronomen, Verb am Satzende. Bitte den Lerner regelmäßig, zwei seiner Sätze zu einem Satz mit Relativsatz zu verbinden. " +
      OPENER,
  },
  {
    id: "gr-b1-02-konjunktiv-ii-politeness",
    level: "B1",
    category: "verbs",
    glyph: "könnten Sie",
    title: "Konjunktiv II for politeness",
    summary: "würde, könnte, hätte, wäre — the difference between blunt and civil.",
    explanation: [
      "Konjunktiv II is the form German uses for requests, suggestions and careful opinions. Kannst du mir helfen? is a plain question; Könntest du mir helfen? is a polite request, and in most everyday situations the polite version is what a native speaker would choose.",
      "For most verbs the form is würde plus infinitive: Ich würde gern mitkommen. For a small set of very common verbs there is a real one-word form, and using it is what makes you sound fluent: sein → wäre, haben → hätte, können → könnte, müssen → müsste, werden → würde.",
      "The same forms carry wishes and hypotheses: Ich hätte gern einen Kaffee (ordering), Es wäre schön, wenn … (a careful suggestion), An deiner Stelle würde ich … (advice).",
      "gern is the little word that turns a Konjunktiv into a wish. Ich würde gern is the standard polite way to say what you want.",
    ],
    examples: [
      { de: "«Könnten Sie» mir bitte helfen?", en: "Could you help me, please?" },
      { de: "Ich «hätte gern» einen Kaffee und «wäre» froh über eine Empfehlung.", en: "I would like a coffee and would be glad of a recommendation." },
      { de: "An deiner Stelle «würde» ich noch einmal nachfragen.", en: "If I were you, I would ask again." },
    ],
    table: {
      caption: "The Konjunktiv II forms you actually use",
      headers: ["Person", "sein → wäre", "haben → hätte", "können → könnte", "werden → würde"],
      rows: [
        ["ich", "wäre", "hätte", "könnte", "würde"],
        ["du", "wärst", "hättest", "könntest", "würdest"],
        ["er / sie / es", "wäre", "hätte", "könnte", "würde"],
        ["wir", "wären", "hätten", "könnten", "würden"],
        ["ihr", "wärt", "hättet", "könntet", "würdet"],
        ["sie / Sie", "wären", "hätten", "könnten", "würden"],
      ],
    },
    focus:
      "Thema dieser Regel: höflicher Konjunktiv II. Übe mit dem Lerner: Bitten formulieren, im Restaurant und im Amt höflich sprechen, Vorschläge machen, Ratschläge geben. Grammatikfokus: würde + Infinitiv, die Einwortformen wäre, hätte, könnte, müsste, Wendungen wie \"Ich hätte gern …\", \"Könnten Sie …?\", \"An deiner Stelle würde ich …\". Spiel eine förmliche Situation und bitte den Lerner, direkte Sätze höflicher umzuformulieren. " +
      OPENER,
  },
  {
    id: "gr-b1-03-passive-present",
    level: "B1",
    category: "verbs",
    glyph: "wird gemacht",
    title: "The passive voice (present)",
    summary: "werden plus participle — when the action matters more than the actor.",
    explanation: [
      "The passive shifts attention from who does something to what is done. It is built with werden as the helper verb plus the past participle at the end: Das Haus wird gebaut.",
      "The object of the active sentence becomes the subject of the passive one. Der Mechaniker repariert das Auto → Das Auto wird repariert.",
      "If the agent is worth mentioning at all, it is added with von for people and durch for causes or means: Das Auto wird von dem Mechaniker repariert. Usually it is simply left out — that is the whole point of the passive.",
      "The passive combines with modal verbs, and then werden appears as an infinitive at the end: Das Formular muss heute unterschrieben werden. This construction is everywhere in official German.",
    ],
    examples: [
      { de: "Hier «wird» ein neues Krankenhaus «gebaut».", en: "A new hospital is being built here." },
      { de: "Das Formular «muss» bis Freitag «unterschrieben werden».", en: "The form must be signed by Friday." },
      { de: "In Deutschland «wird» der Müll sorgfältig «getrennt».", en: "In Germany the rubbish is separated carefully." },
    ],
    focus:
      "Thema dieser Regel: das Passiv im Präsens. Übe mit dem Lerner: Abläufe und Regeln beschreiben (im Betrieb, in der Behörde, in der Stadt), bei denen der Handelnde unwichtig ist. Grammatikfokus: werden + Partizip II, Umwandlung von Aktiv zu Passiv, Agens mit \"von\" und \"durch\", Passiv mit Modalverb (muss gemacht werden). Gib dem Lerner Aktivsätze zum Umformen und frage, wie bestimmte Dinge in seinem Land gemacht werden. " +
      OPENER,
  },
  {
    id: "gr-b1-04-genitive",
    level: "B1",
    category: "cases",
    glyph: "des Mannes",
    title: "The genitive case",
    summary: "Possession in writing: des Mannes, der Frau — spoken German prefers von.",
    explanation: [
      "The genitive expresses belonging: das Auto meines Bruders. The articles are des (masculine and neuter) and der (feminine and plural), and masculine and neuter nouns add -s or -es to the noun itself: des Mannes, des Autos.",
      "Unlike English, the genitive noun follows the thing it belongs to: die Farbe des Autos, literally “the colour of-the car”. Names are the exception and behave like English: Annas Auto, with no apostrophe.",
      "In everyday speech the genitive is widely replaced by von plus dative: das Auto von meinem Bruder. That is perfectly acceptable in conversation, but in writing, in the news and at work the genitive is expected.",
      "A group of prepositions requires the genitive: wegen, während, trotz, statt, innerhalb, außerhalb. Wegen des Wetters bleiben wir zu Hause.",
    ],
    examples: [
      { de: "Das ist das Auto «meines Bruders».", en: "That is my brother's car." },
      { de: "«Während der» Woche habe ich wenig Zeit.", en: "During the week I have little time." },
      { de: "«Trotz des» Regens sind wir spazieren gegangen.", en: "Despite the rain we went for a walk." },
    ],
    focus:
      "Thema dieser Regel: der Genitiv. Übe mit dem Lerner: Besitz und Zugehörigkeit ausdrücken, formulieren wie in einem Text oder Bericht. Grammatikfokus: des/der plus -s oder -es am maskulinen und neutralen Nomen, Nachstellung des Genitivs, Alternative mit \"von\" in der gesprochenen Sprache, Genitivpräpositionen wegen, während, trotz, statt, innerhalb. Bitte den Lerner, von-Konstruktionen in echte Genitive umzuwandeln. " +
      OPENER,
  },
  {
    id: "gr-b1-05-infinitive-with-zu",
    level: "B1",
    category: "word-order",
    glyph: "um … zu …",
    title: "Infinitive clauses with zu",
    summary: "Ich habe vor, früher aufzustehen — and when zu is forbidden.",
    explanation: [
      "Many verbs and expressions are continued by an infinitive with zu at the end of the clause: Ich habe vor, nach Berlin zu ziehen. Typical triggers are vorhaben, versuchen, vergessen, anfangen, aufhören, beschließen, and adjective phrases such as Es ist wichtig / schwierig / schön …",
      "With a separable verb, the zu is inserted between prefix and stem and everything is written as one word: aufstehen → aufzustehen, einkaufen → einzukaufen.",
      "Three constructions have their own meaning: um … zu (in order to), ohne … zu (without doing), and statt … zu (instead of doing). Ich lerne Deutsch, um in Deutschland zu arbeiten.",
      "zu is never used after modal verbs, after werden, or after the perception verbs sehen and hören: Ich muss gehen, Ich höre ihn kommen. Adding zu there is a common B1 mistake.",
    ],
    examples: [
      { de: "Ich habe vor, nächstes Jahr nach Berlin «zu ziehen».", en: "I plan to move to Berlin next year." },
      { de: "Ich versuche, jeden Morgen früher «aufzustehen».", en: "I am trying to get up earlier every morning." },
      { de: "Ich lerne Deutsch, «um» hier «zu arbeiten».", en: "I am learning German in order to work here." },
    ],
    focus:
      "Thema dieser Regel: Infinitivsätze mit \"zu\". Übe mit dem Lerner: Pläne, Absichten, Versuche und Gewohnheiten formulieren. Grammatikfokus: zu + Infinitiv nach vorhaben, versuchen, anfangen, aufhören, beschließen und nach \"Es ist wichtig/schwierig …\"; zu im Inneren trennbarer Verben (aufzustehen); die Konstruktionen um … zu, ohne … zu, statt … zu; kein zu nach Modalverben. Frage nach konkreten Vorhaben und ihren Zwecken. " +
      OPENER,
  },
  {
    id: "gr-b1-06-futur-i",
    level: "B1",
    category: "verbs",
    glyph: "wird … sein",
    title: "Futur I and how Germans really talk about the future",
    summary: "werden plus infinitive — but the present tense usually does the job.",
    explanation: [
      "Futur I is formed with werden in position two and the infinitive at the end: Ich werde nächstes Jahr umziehen.",
      "In practice German uses the present tense with a time expression for planned future events, and that is what a native speaker says: Nächstes Jahr ziehe ich um. Using werden everywhere sounds oddly formal.",
      "Futur I earns its keep in two other roles. It expresses a prediction or an intention with weight — Ich werde das schaffen — and, combined with wohl or sicher, a present-tense assumption: Er wird wohl im Stau stehen (“he is probably stuck in traffic”).",
      "Do not confuse the helper werden with the full verb werden meaning “to become”: Ich werde Lehrer means “I am going to be a teacher”, an entirely different thing.",
    ],
    examples: [
      { de: "Nächstes Jahr «ziehe» ich nach Hamburg «um».", en: "Next year I am moving to Hamburg." },
      { de: "Ich «werde» das auf jeden Fall «schaffen».", en: "I will definitely manage it." },
      { de: "Er «wird wohl» im Stau «stehen».", en: "He is probably stuck in traffic." },
    ],
    focus:
      "Thema dieser Regel: Futur I und Zukunftsausdruck. Übe mit dem Lerner: Pläne, Vorsätze, Prognosen und Vermutungen. Grammatikfokus: werden + Infinitiv am Satzende, Präsens mit Zeitangabe für feste Pläne, Futur I für Absicht und Versprechen, Futur I mit \"wohl\" für Vermutungen über die Gegenwart, Abgrenzung zum Vollverb werden (\"Ich werde Lehrer\"). Frage nach Plänen und lass den Lerner auch Vermutungen über andere äußern. " +
      OPENER,
  },
  {
    id: "gr-b1-07-tekamolo",
    level: "B1",
    category: "word-order",
    glyph: "TeKaMoLo",
    title: "Word order in the middle field: TeKaMoLo",
    summary: "Time, cause, manner, place — in that order, between verb and end.",
    explanation: [
      "When several adverbials pile up in one sentence, German orders them: TEmporal (when), KAusal (why), MOdal (how), LOkal (where). Ich fahre morgen wegen einer Konferenz mit dem Zug nach Berlin.",
      "It is a strong default, not an iron law. Any element can be pulled to the front for emphasis, and doing so is normal — Nach Berlin fahre ich morgen mit dem Zug puts the destination in focus.",
      "Objects follow their own rule and come before most adverbials: dative before accusative when both are nouns (Ich gebe dem Kind das Buch), but a pronoun always comes first (Ich gebe es dem Kind).",
      "Getting TeKaMoLo right is what makes a long sentence sound German rather than translated. It is worth practising with sentences that deliberately carry three or four pieces of information.",
    ],
    examples: [
      { de: "Ich fahre «morgen» «wegen einer Konferenz» «mit dem Zug» «nach Berlin».", en: "Tomorrow I am travelling to Berlin by train because of a conference." },
      { de: "Sie ist «gestern» «vor Freude» «laut» «durch die Wohnung» gelaufen.", en: "Yesterday she ran loudly through the flat out of joy." },
      { de: "Ich gebe «es» «dem Kind» später.", en: "I will give it to the child later." },
    ],
    focus:
      "Thema dieser Regel: Wortstellung im Mittelfeld (TeKaMoLo). Übe mit dem Lerner: längere Sätze mit mehreren Angaben zu Zeit, Grund, Art und Ort. Grammatikfokus: Reihenfolge temporal – kausal – modal – lokal, Objektstellung (Dativ vor Akkusativ bei Nomen, Pronomen zuerst), Betonung durch Voranstellen eines Elements. Gib dem Lerner Stichwörter und bitte ihn, daraus einen vollständigen Satz in der richtigen Reihenfolge zu bauen. " +
      OPENER,
  },
  {
    id: "gr-b1-08-adjective-endings",
    level: "B1",
    category: "cases",
    glyph: "ein guter Tag",
    title: "Adjective endings",
    summary: "An adjective in front of a noun always takes an ending — which one depends on the article.",
    explanation: [
      "After the verb, an adjective takes no ending at all: Der Wein ist gut. In front of a noun it always takes one: der gute Wein.",
      "Which ending depends on what stands before the adjective. After a definite article (der, die, das, dieser, jeder), the endings are the weak set: -e in the nominative singular and in the feminine and neuter accusative, and -en everywhere else. This is the pattern in the table below.",
      "After ein, kein and the possessives the pattern is mixed: wherever the article itself fails to show the gender, the adjective has to — ein guter Wein, ein gutes Brot. Otherwise it follows the weak set: einen guten Wein.",
      "With no article at all, the adjective carries the full article ending itself (the strong set): guter Wein, gutes Brot, mit gutem Wein. This is common with plurals and uncountables: Ich trinke gerne kalten Tee.",
    ],
    examples: [
      { de: "Ich suche eine «günstige» Wohnung mit einem «großen» Balkon.", en: "I am looking for an affordable flat with a big balcony." },
      { de: "Der «neue» Kollege hat einen «guten» Eindruck gemacht.", en: "The new colleague made a good impression." },
      { de: "Bei «schönem» Wetter trinke ich gerne «kalten» Tee.", en: "In nice weather I like drinking cold tea." },
    ],
    table: {
      caption: "Endings after the definite article (der gute Wein)",
      headers: ["", "masculine", "feminine", "neuter", "plural"],
      rows: [
        ["Nominative", "der gute Wein", "die gute Suppe", "das gute Brot", "die guten Ideen"],
        ["Accusative", "den guten Wein", "die gute Suppe", "das gute Brot", "die guten Ideen"],
        ["Dative", "dem guten Wein", "der guten Suppe", "dem guten Brot", "den guten Ideen"],
        ["Genitive", "des guten Weines", "der guten Suppe", "des guten Brotes", "der guten Ideen"],
      ],
    },
    focus:
      "Thema dieser Regel: Adjektivendungen. Übe mit dem Lerner: Wohnungen, Menschen, Städte und Gegenstände mit mehreren Adjektiven beschreiben. Grammatikfokus: keine Endung nach dem Verb, schwache Endungen nach dem bestimmten Artikel, gemischte Endungen nach ein/kein/mein, starke Endungen ohne Artikel. Bitte den Lerner immer wieder um genaue Beschreibungen mit Adjektiv plus Nomen und korrigiere falsche Endungen durch Recasting. " +
      OPENER,
  },
  {
    id: "gr-b1-09-temporal-conjunctions",
    level: "B1",
    category: "word-order",
    glyph: "als · wenn",
    title: "als, wenn, während and the other time words",
    summary: "als for one moment in the past, wenn for repeated or future events.",
    explanation: [
      "als introduces a single, completed event in the past: Als ich in Berlin ankam, regnete es. One time, one moment, past — that is als.",
      "wenn covers everything else: repeated events in the past (“whenever”), and everything in the present and future. Wenn ich Zeit habe, lese ich. Immer wenn ich nach Berlin fuhr, besuchte ich sie.",
      "Other temporal conjunctions fill in the rest: während (while, at the same time), bevor (before), nachdem (after), seit/seitdem (since), bis (until), sobald (as soon as). All of them send the verb to the end of their clause.",
      "nachdem carries a tense rule of its own: the nachdem-clause has to be one step further back in time than the main clause. Nachdem ich gegessen hatte, ging ich spazieren.",
    ],
    examples: [
      { de: "«Als» ich zwölf war, bin ich nach Deutschland gekommen.", en: "When I was twelve, I came to Germany." },
      { de: "«Wenn» ich Zeit habe, lese ich abends ein Buch.", en: "When I have time, I read a book in the evening." },
      { de: "«Nachdem» ich gegessen hatte, bin ich spazieren gegangen.", en: "After I had eaten, I went for a walk." },
    ],
    focus:
      "Thema dieser Regel: temporale Konjunktionen. Übe mit dem Lerner: Ereignisse zeitlich einordnen und Gewohnheiten von einmaligen Erlebnissen unterscheiden. Grammatikfokus: \"als\" für einmalige Ereignisse in der Vergangenheit, \"wenn\" für Wiederholung, Gegenwart und Zukunft, außerdem während, bevor, nachdem, seitdem, bis, sobald; Verb am Nebensatzende; Vorzeitigkeit mit Plusquamperfekt nach \"nachdem\". Frage nach Kindheitserinnerungen und nach heutigen Gewohnheiten im Wechsel. " +
      OPENER,
  },
  {
    id: "gr-b1-10-verbs-with-prepositions",
    level: "B1",
    category: "verbs",
    glyph: "warten auf",
    title: "Verbs with fixed prepositions",
    summary: "warten auf, denken an, sich freuen über — learn the verb and its preposition as one word.",
    explanation: [
      "Many German verbs are welded to a particular preposition, and the pairing is rarely the same as in English. warten auf (wait for), denken an (think about), sprechen über (talk about), sich interessieren für, abhängen von, teilnehmen an.",
      "The preposition also fixes the case, and it has to be learned along with it: warten auf takes the accusative, teilnehmen an takes the dative. There is no way to derive it — treat verb, preposition and case as one vocabulary item.",
      "To ask about a thing, the preposition fuses with wo(r)-: Worauf wartest du? Woran denkst du? To refer back to a thing, it fuses with da(r)-: Ich warte darauf.",
      "For people the preposition keeps its normal form: Auf wen wartest du? — Ich warte auf meinen Bruder. The wo-/da- forms are for things only.",
    ],
    examples: [
      { de: "Ich «warte auf» den Bus und «denke an» das Wochenende.", en: "I am waiting for the bus and thinking about the weekend." },
      { de: "«Worauf» freust du dich am meisten?", en: "What are you looking forward to most?" },
      { de: "Sie hat «an» der Konferenz «teilgenommen» und «darüber» einen Bericht geschrieben.", en: "She took part in the conference and wrote a report about it." },
    ],
    focus:
      "Thema dieser Regel: Verben mit festen Präpositionen. Übe mit dem Lerner: über Interessen, Erwartungen, Ärger und Pläne sprechen mit warten auf, denken an, sprechen über, sich interessieren für, sich ärgern über, abhängen von, teilnehmen an, sich kümmern um. Grammatikfokus: feste Präposition plus Kasus als Einheit lernen, Fragewörter mit wo(r)- und Verweise mit da(r)-, Präposition plus wen/wem bei Personen. Stelle gezielt Fragen mit Worauf, Woran und Worüber. " +
      OPENER,
  },

  // ================================================================== B2
  {
    id: "gr-b2-01-konjunktiv-ii-tenses",
    level: "B2",
    category: "verbs",
    glyph: "wäre gewesen",
    title: "Konjunktiv II across tenses: hypotheses and regrets",
    summary: "wäre and hätte + participle turn “what if” into “if only I had”.",
    explanation: [
      "Konjunktiv II has only two time frames, not six. The present form describes something unreal now or in the future: Wenn ich mehr Zeit hätte, würde ich reisen. The past form describes something that did not happen: Wenn ich mehr Zeit gehabt hätte, wäre ich gereist.",
      "The past is built with hätte or wäre plus the participle — the same helper the verb would take in the Perfekt. There is only one past Konjunktiv, so hätte gemacht covers everything English splits into “had done” and “would have done”.",
      "With a modal verb the past takes a double infinitive: Ich hätte früher kommen können. Note that the helper here is always hätte, and both infinitives sit at the end.",
      "The wenn can be dropped, and then the verb moves to the front — a favourite construction in writing: Hätte ich das gewusst, wäre ich nicht gekommen. Add beinahe or fast for near-misses: Ich wäre beinahe zu spät gekommen.",
    ],
    examples: [
      { de: "Wenn ich mehr Zeit «hätte», «würde» ich mehr reisen.", en: "If I had more time, I would travel more." },
      { de: "Wenn ich das früher «gewusst hätte», «wäre» ich nicht «gekommen».", en: "If I had known that earlier, I would not have come." },
      { de: "Ich «hätte» dir längst «helfen können».", en: "I could have helped you long ago." },
    ],
    table: {
      caption: "Konjunktiv II: unreal now vs. unreal then",
      headers: ["Type", "Present (unreal now)", "Past (unreal then)"],
      rows: [
        ["regular verb", "ich würde mehr lernen", "ich hätte mehr gelernt"],
        ["sein-verb", "ich wäre zu Hause", "ich wäre zu Hause geblieben"],
        ["with a modal", "ich könnte kommen", "ich hätte kommen können"],
        ["passive", "es würde repariert", "es wäre repariert worden"],
      ],
    },
    focus:
      "Thema dieser Regel: Konjunktiv II in Gegenwart und Vergangenheit. Übe mit dem Lerner: irreale Bedingungen, Wünsche, Bedauern über Vergangenes und Beinahe-Ereignisse. Grammatikfokus: würde/wäre/hätte plus Infinitiv in der Gegenwart, hätte/wäre plus Partizip II in der Vergangenheit, doppelter Infinitiv bei Modalverben (hätte kommen können), Bedingungssatz ohne \"wenn\" mit Verb an erster Stelle. Stelle Was-wäre-wenn-Fragen und frage auch nach Entscheidungen, die der Lerner heute anders treffen würde. " +
      OPENER,
  },
  {
    id: "gr-b2-02-passive-all-tenses",
    level: "B2",
    category: "verbs",
    glyph: "wurde gebaut",
    title: "Passive in all tenses, and the Zustandspassiv",
    summary: "wird gebaut, wurde gebaut, ist gebaut worden — and the difference from ist gebaut.",
    explanation: [
      "The passive uses werden as its helper in every tense, and only that helper changes: wird gebaut (present), wurde gebaut (past), ist gebaut worden (Perfekt), war gebaut worden (past perfect), wird gebaut werden (future).",
      "In the Perfekt, the participle of werden is worden, not geworden. geworden belongs to the full verb werden (“to become”); the passive always takes the shortened worden.",
      "The Vorgangspassiv (with werden) describes a process. The Zustandspassiv (with sein) describes the resulting state: Das Geschäft wird um acht Uhr geschlossen is the act of closing; Das Geschäft ist geschlossen is the state of being closed.",
      "German also has several passive substitutes that sound lighter than a full passive and are common in speech and writing: man plus active, sich lassen plus infinitive (Das lässt sich leicht erklären), and sein plus zu plus infinitive (Das ist leicht zu erklären).",
    ],
    examples: [
      { de: "Die Brücke «ist» im Jahr 1990 «gebaut worden».", en: "The bridge was built in 1990." },
      { de: "Das Geschäft «wird» um acht Uhr «geschlossen» — jetzt «ist» es «geschlossen».", en: "The shop is closed at eight o'clock — now it is closed." },
      { de: "Dieses Problem «lässt sich» leicht «lösen».", en: "This problem can easily be solved." },
    ],
    table: {
      caption: "The passive through the tenses",
      headers: ["Form", "Example"],
      rows: [
        ["Präsens", "Das Haus wird gebaut."],
        ["Präteritum", "Das Haus wurde gebaut."],
        ["Perfekt", "Das Haus ist gebaut worden."],
        ["Plusquamperfekt", "Das Haus war gebaut worden."],
        ["Futur I", "Das Haus wird gebaut werden."],
        ["with a modal", "Das Haus muss gebaut werden."],
        ["Zustandspassiv", "Das Haus ist gebaut."],
      ],
    },
    focus:
      "Thema dieser Regel: Passiv in allen Zeitformen und Zustandspassiv. Übe mit dem Lerner: Prozesse, Bauprojekte, Regeln und Abläufe in verschiedenen Zeitstufen beschreiben. Grammatikfokus: werden als Hilfsverb in allen Zeiten, Partizip \"worden\" im Perfekt, Unterschied zwischen Vorgangspassiv (wird geschlossen) und Zustandspassiv (ist geschlossen), Passiversatzformen mit man, sich lassen und sein + zu + Infinitiv. Bitte den Lerner, Aktivsätze in verschiedene Passivzeiten umzuformen. " +
      OPENER,
  },
  {
    id: "gr-b2-03-nominalisierung",
    level: "B2",
    category: "style",
    glyph: "das Lesen",
    title: "Nominalisierung and nominal style",
    summary: "Turn verbs into nouns — the sound of written and official German.",
    explanation: [
      "Formal German compresses whole clauses into noun phrases. Weil die Preise gestiegen sind becomes wegen des Anstiegs der Preise. This is what makes reports, contracts and news articles sound the way they do.",
      "The common patterns: infinitive as a neuter noun (das Lesen, das Rauchen), verb stem plus -ung (bearbeiten → die Bearbeitung), bare stem (beginnen → der Beginn), and adjective plus -heit/-keit (schön → die Schönheit).",
      "Each subordinating conjunction has a matching preposition, and that pairing is the mechanical part of the conversion: weil → wegen, obwohl → trotz, wenn → bei, nachdem → nach, bevor → vor, damit → zu/für.",
      "Nominal style is a register, not an improvement. Use it in written and formal contexts; in conversation, verbal style is clearer and sounds far more natural.",
    ],
    examples: [
      { de: "«Wegen des Anstiegs» der Mieten ziehen viele Menschen aufs Land.", en: "Because of the rise in rents, many people are moving to the countryside." },
      { de: "«Nach der Prüfung» der Unterlagen erhalten Sie einen Bescheid.", en: "After the documents have been checked, you will receive a decision." },
      { de: "«Trotz der schlechten Wetterlage» fand die Veranstaltung statt.", en: "Despite the poor weather, the event took place." },
    ],
    focus:
      "Thema dieser Regel: Nominalisierung und Nominalstil. Übe mit dem Lerner: Sätze mit Nebensatz in Nominalkonstruktionen umformen und umgekehrt. Grammatikfokus: Nominalisierung mit -ung, -heit, -keit und substantiviertem Infinitiv; die Paare weil/wegen, obwohl/trotz, wenn/bei, nachdem/nach, bevor/vor; Genitiv nach der Präposition; Register (Nominalstil schriftlich, Verbalstil mündlich). Gib dem Lerner konkrete Sätze zum Umformulieren in beide Richtungen. " +
      OPENER,
  },
  {
    id: "gr-b2-04-participle-attributes",
    level: "B2",
    category: "style",
    glyph: "der wartende",
    title: "Participle constructions (Partizipialattribute)",
    summary: "A whole relative clause squeezed in front of the noun.",
    explanation: [
      "German can place a participle, with all its own modifiers, directly in front of a noun, doing the work of a relative clause: der gestern veröffentlichte Bericht = der Bericht, der gestern veröffentlicht wurde.",
      "Participle I (infinitive + -d: lachend, steigend) is active and simultaneous: die steigenden Preise — the prices that are rising.",
      "Participle II (gebaut, veröffentlicht) is passive and completed: das renovierte Haus — the house that has been renovated. With sein-verbs it stays active: der angekommene Zug.",
      "The participle takes normal adjective endings, and any extra material sits between the article and the participle — which is what makes long examples hard to read: die im letzten Jahr von der Stadt beschlossenen Maßnahmen.",
      "This is a written-register construction. Recognise it everywhere in news and academic prose; produce it sparingly, and never in conversation.",
    ],
    examples: [
      { de: "Der «gestern veröffentlichte» Bericht sorgt für Diskussionen.", en: "The report published yesterday is causing discussion." },
      { de: "Die «stetig steigenden» Mieten sind ein großes Problem.", en: "The steadily rising rents are a big problem." },
      { de: "Die «von der Stadt beschlossenen» Maßnahmen treten im Januar in Kraft.", en: "The measures decided by the city come into force in January." },
    ],
    focus:
      "Thema dieser Regel: Partizipialattribute. Übe mit dem Lerner: Relativsätze in vorangestellte Partizipialkonstruktionen umformen und komplexe Zeitungssätze entschlüsseln. Grammatikfokus: Partizip I (aktiv, gleichzeitig) und Partizip II (passiv, abgeschlossen) als Attribut, Adjektivendungen am Partizip, Erweiterung zwischen Artikel und Partizip, Register (schriftlich). Gib dem Lerner Sätze mit Relativsatz und bitte um die verdichtete Form, danach umgekehrt. " +
      OPENER,
  },
  {
    id: "gr-b2-05-subjective-modals",
    level: "B2",
    category: "verbs",
    glyph: "soll · dürfte",
    title: "Modal verbs with a subjective meaning",
    summary: "Er muss krank sein doesn't mean he has to be ill — it means he must be ill.",
    explanation: [
      "Alongside their normal meanings, modal verbs have a second, subjective use: they express how certain the speaker is, or repeat what someone else claims.",
      "For degrees of certainty: müssen is near-certainty (Er muss krank sein — he must be ill, judging by the evidence), dürfte is a careful estimate (Das dürfte etwa zwei Stunden dauern), können and könnte mark a possibility, and kann nicht rules something out.",
      "For reported claims: sollen passes on what others say without vouching for it (Der Film soll sehr gut sein — the film is supposed to be very good), while wollen reports the subject's own unverified claim (Er will nichts gewusst haben — he claims he knew nothing).",
      "For a past reference, these keep the modal in the present and put the main verb in the perfect infinitive: Er muss den Zug verpasst haben. Only the context separates the subjective reading from the ordinary one.",
    ],
    examples: [
      { de: "Er «muss» den Zug verpasst «haben» — er ist immer pünktlich.", en: "He must have missed the train — he is always on time." },
      { de: "Der Film «soll» sehr gut sein, sagen jedenfalls alle.", en: "The film is supposed to be very good, at least that is what everyone says." },
      { de: "Das «dürfte» etwa zwei Stunden dauern.", en: "That will probably take about two hours." },
    ],
    focus:
      "Thema dieser Regel: subjektiver Gebrauch der Modalverben. Übe mit dem Lerner: Vermutungen mit unterschiedlicher Sicherheit äußern und fremde Behauptungen wiedergeben. Grammatikfokus: müssen für hohe Sicherheit, dürfte für vorsichtige Schätzung, könnte für Möglichkeit, kann nicht für Ausschluss, sollen für fremde Aussagen, wollen für unbelegte Selbstaussagen, Vergangenheitsbezug mit Infinitiv Perfekt (muss verpasst haben). Beschreibe Situationen und bitte den Lerner um eine Vermutung mit passendem Modalverb. " +
      OPENER,
  },
  {
    id: "gr-b2-06-n-deklination",
    level: "B2",
    category: "nouns",
    glyph: "den Menschen",
    title: "N-declension (die N-Deklination)",
    summary: "A group of masculine nouns adds -n or -en in every case except the nominative singular.",
    explanation: [
      "A closed group of masculine nouns takes an -n or -en ending in every case except the nominative singular. der Student, but den Studenten, dem Studenten, des Studenten.",
      "The group is recognisable. It contains masculine nouns ending in -e that denote people or animals (der Kunde, der Kollege, der Junge, der Löwe), and masculine nouns of foreign origin stressed on the last syllable (der Student, der Journalist, der Präsident, der Polizist, der Architekt).",
      "A few add -ns in the genitive: der Name → des Namens, and likewise Gedanke, Wille, Glaube. der Herr is irregular in its own way: den Herrn in the singular, die Herren in the plural.",
      "Omitting the ending is a classic B2 giveaway. Ich habe mit einem Kollegen gesprochen is correct; mit einem Kollege is not.",
    ],
    examples: [
      { de: "Ich habe mit einem «Kollegen» gesprochen.", en: "I spoke with a colleague." },
      { de: "Kennst du den «Studenten» aus dem Kurs?", en: "Do you know the student from the course?" },
      { de: "Wie war noch einmal der «Name» Ihres «Mandanten»?", en: "What was the name of your client again?" },
    ],
    table: {
      caption: "der Student through the cases",
      headers: ["Case", "Singular", "Plural"],
      rows: [
        ["Nominativ", "der Student", "die Studenten"],
        ["Akkusativ", "den Studenten", "die Studenten"],
        ["Dativ", "dem Studenten", "den Studenten"],
        ["Genitiv", "des Studenten", "der Studenten"],
      ],
    },
    focus:
      "Thema dieser Regel: die N-Deklination. Übe mit dem Lerner: über Kollegen, Kunden, Nachbarn, Studenten, Journalisten und Präsidenten sprechen. Grammatikfokus: -n oder -en in allen Kasus außer dem Nominativ Singular, betroffene Gruppen (maskuline Nomen auf -e für Personen und Tiere, Fremdwörter mit Endbetonung), Sonderformen des Namens, des Gedankens, den Herrn. Stelle Fragen, die Akkusativ- und Dativformen dieser Nomen erzwingen, und korrigiere fehlende Endungen durch Recasting. " +
      OPENER,
  },
  {
    id: "gr-b2-07-register",
    level: "B2",
    category: "style",
    glyph: "du · Sie",
    title: "Register: du, Sie and formal writing",
    summary: "Choosing the wrong level of formality is a bigger mistake than a wrong ending.",
    explanation: [
      "German splits sharply into registers. du is for friends, family, children, fellow students and most startup or IT workplaces; Sie is the default with strangers, older people, officials, customers and in most traditional companies. When in doubt, use Sie and let the other person offer the du.",
      "The switch is a small ritual with fixed phrases: Wollen wir uns duzen? or Ich bin der Thomas. Once offered, it does not go back.",
      "Written formality has its own machinery. A letter or email opens with Sehr geehrte Frau Müller and closes with Mit freundlichen Grüßen; a semi-formal one uses Liebe Frau Müller and Viele Grüße. Formal writing also prefers the nominal style, the passive and Konjunktiv II for requests.",
      "Register shows in vocabulary too: erhalten instead of kriegen, benötigen instead of brauchen, mitteilen instead of sagen. Mixing registers — a formal salutation followed by casual particles — reads worse than a grammar mistake.",
    ],
    examples: [
      { de: "«Sehr geehrte Damen und Herren», ich «wende mich an Sie», weil …", en: "Dear Sir or Madam, I am writing to you because …" },
      { de: "«Könnten Sie» mir bitte «mitteilen», ob der Termin noch möglich ist?", en: "Could you please let me know whether the appointment is still possible?" },
      { de: "«Wollen wir uns duzen»? — Gerne, ich bin der Thomas.", en: "Shall we use “du” with each other? — Gladly, I'm Thomas." },
    ],
    focus:
      "Thema dieser Regel: Register und Höflichkeitsebenen. Übe mit dem Lerner: zwischen Du- und Sie-Ton wechseln, formelle E-Mails formulieren, umgangssprachliche Sätze förmlich umschreiben. Grammatikfokus: Anrede mit du, ihr und Sie; Briefformeln (Sehr geehrte …, Mit freundlichen Grüßen, Liebe …, Viele Grüße); formeller Wortschatz (erhalten, benötigen, mitteilen); Konjunktiv II, Passiv und Nominalstil im formellen Text. Gib dem Lerner konkrete Sätze und bitte um die jeweils andere Registerstufe. " +
      OPENER,
  },
  {
    id: "gr-b2-08-funktionsverbgefuege",
    level: "B2",
    category: "style",
    glyph: "Kritik üben",
    title: "Verb-noun collocations (Funktionsverbgefüge)",
    summary: "in Anspruch nehmen, zur Verfügung stellen — fixed pairs you cannot translate word by word.",
    explanation: [
      "A Funktionsverbgefüge is a fixed pairing of a semantically light verb with a noun that carries the meaning: eine Entscheidung treffen (to make a decision), zur Verfügung stellen (to make available), in Anspruch nehmen (to make use of).",
      "The verb is not chosen freely. It is treffen for a decision, stellen for a question, leisten for help, üben for criticism, ziehen for a conclusion. Using the wrong verb — eine Entscheidung machen — is instantly recognisable as a learner error.",
      "Most of these belong to formal and written German and have a simpler verbal equivalent: eine Entscheidung treffen = entscheiden, Kritik üben = kritisieren. Choose according to register, not according to which sounds more impressive.",
      "The safest way to acquire them is as whole chunks, including any preposition and article: not in + Anspruch, but in Anspruch nehmen.",
    ],
    examples: [
      { de: "Wir müssen bald eine «Entscheidung treffen».", en: "We have to make a decision soon." },
      { de: "Die Firma «stellt» uns einen Laptop «zur Verfügung».", en: "The company provides us with a laptop." },
      { de: "Er hat scharfe «Kritik» an dem Vorschlag «geübt».", en: "He sharply criticised the proposal." },
    ],
    focus:
      "Thema dieser Regel: Funktionsverbgefüge. Übe mit dem Lerner: formelle Aussagen im Beruf, in Berichten und in Besprechungen. Grammatikfokus: feste Verb-Nomen-Verbindungen wie eine Entscheidung treffen, eine Frage stellen, Kritik üben, Hilfe leisten, zur Verfügung stellen, in Anspruch nehmen, in Betracht ziehen, Rücksicht nehmen; passendes Funktionsverb statt \"machen\"; einfaches Vollverb als Alternative im mündlichen Register. Bitte den Lerner, einfache Sätze in die formelle Variante zu übertragen. " +
      OPENER,
  },
  {
    id: "gr-b2-09-word-formation",
    level: "B2",
    category: "nouns",
    glyph: "-ung · -bar",
    title: "Word formation: prefixes and suffixes",
    summary: "Learn the building blocks and thousands of words become guessable.",
    explanation: [
      "German builds new words rather than borrowing them, so a known stem plus a known affix is usually enough to decode an unfamiliar word — and often enough to build one.",
      "Verb prefixes shift meaning systematically: ver- often signals something going wrong or away (sich verlaufen, verlernen), ent- signals removal (entfernen, entlassen), zer- destruction (zerbrechen), be- makes an intransitive verb transitive (antworten → beantworten), miss- negates (missverstehen).",
      "Noun suffixes carry gender with them, which solves two problems at once: -ung, -heit, -keit, -schaft, -ion are feminine; -chen and -lein neuter; -er and -ling masculine.",
      "Adjective suffixes are equally productive: -bar means “able to be” (essbar, machbar), -los means “without” (arbeitslos), -voll “full of”, -ig and -isch form adjectives from nouns. And un- negates almost any adjective: unmöglich, unfreundlich.",
    ],
    examples: [
      { de: "Ich habe mich in der Stadt «verlaufen».", en: "I got lost in the city." },
      { de: "Dieser Plan ist leider nicht «machbar».", en: "Unfortunately this plan is not feasible." },
      { de: "Die «Zusammenarbeit» mit der Abteilung war «unproblematisch».", en: "The cooperation with the department was unproblematic." },
    ],
    focus:
      "Thema dieser Regel: Wortbildung. Übe mit dem Lerner: unbekannte Wörter aus Stamm und Affix erschließen und selbst neue Wörter bilden. Grammatikfokus: Verbpräfixe ver-, ent-, zer-, be-, miss-; Nomensuffixe -ung, -heit, -keit, -schaft, -ling mit ihrem Genus; Adjektivsuffixe -bar, -los, -voll, -ig, -isch und die Verneinung mit un-. Nenne dem Lerner Stämme und bitte ihn um abgeleitete Wörter, und frage nach der Bedeutung zusammengesetzter Wörter. " +
      OPENER,
  },
  {
    id: "gr-b2-10-konnektoren",
    level: "B2",
    category: "word-order",
    glyph: "deshalb · zwar",
    title: "Connectors for argumentation",
    summary: "zwar … aber, dennoch, folglich — and the word order each one demands.",
    explanation: [
      "At B2 the difficulty is no longer the meaning of a connector but the word order it triggers. There are three groups, and mixing them up is the most visible remaining error.",
      "Position 0 — und, aber, oder, denn, sondern: nothing moves. Ich bleibe zu Hause, denn ich bin müde.",
      "Position 1 — deshalb, deswegen, trotzdem, dennoch, folglich, außerdem, jedoch: these occupy the first position, so the verb comes straight after and the subject follows it. Ich bin müde, deshalb bleibe ich zu Hause.",
      "Subordinating — weil, obwohl, während, indem, sodass, damit, falls: the verb goes to the end of their clause. Ich bleibe zu Hause, weil ich müde bin.",
      "For a balanced argument the useful pairs are zwar … aber (concession), einerseits … andererseits (two sides), nicht nur … sondern auch (addition), and je … desto (correlation): Je länger ich hier lebe, desto leichter fällt mir die Sprache.",
    ],
    examples: [
      { de: "Ich bin müde, «deshalb bleibe ich» zu Hause.", en: "I am tired, so I am staying at home." },
      { de: "«Zwar» ist die Wohnung teuer, «aber» die Lage ist ausgezeichnet.", en: "The flat is expensive, but the location is excellent." },
      { de: "«Je länger» ich hier lebe, «desto leichter» fällt mir die Sprache.", en: "The longer I live here, the easier the language becomes for me." },
    ],
    focus:
      "Thema dieser Regel: Konnektoren für die Argumentation. Übe mit dem Lerner: eine These aufstellen, abwägen, Gegenargumente einräumen und ein Fazit ziehen. Grammatikfokus: Konnektoren auf Position 0 (und, aber, denn, sondern), auf Position 1 mit Inversion (deshalb, trotzdem, dennoch, folglich, außerdem, jedoch) und einleitende Subjunktionen mit Verbendstellung (weil, obwohl, während, indem, sodass, damit); die Paare zwar … aber, einerseits … andererseits, nicht nur … sondern auch, je … desto. Nimm konsequent die Gegenposition ein und fordere jedes Mal eine begründete Antwort. " +
      OPENER,
  },
];

const BY_ID = new Map(GRAMMAR_TOPICS.map((t) => [t.id, t]));

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return BY_ID.get(id);
}

export function grammarForLevel(level: CefrLevel): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter((t) => t.level === level);
}

/** True for ids owned by the rulebook rather than the curriculum. */
export function isGrammarId(id: string): boolean {
  return id.startsWith("gr-");
}
