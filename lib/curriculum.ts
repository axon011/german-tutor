/**
 * The guided CEFR curriculum — 8 lessons per level, A1 → B2, following the
 * standard Goethe/CEFR topic canon.
 *
 * Shared by client and server, and split by language on purpose (the project's
 * UI-language rule): `title` and `description` are ENGLISH chrome so a learner
 * can navigate the app without decoding it, while `focus` and `starter` are
 * GERMAN learning content. `focus` is never rendered — it is an instruction TO
 * THE TUTOR that app/api/chat/route.ts appends to the system prompt when a
 * lesson is active. The client only ever sends a lesson `id`, so the prompt
 * text stays server-side and cannot be tampered with from the browser.
 */

import type { CefrLevel } from "./tutor-prompt";

export interface Lesson {
  /** Stable slug, e.g. "a1-01-introduce-yourself". Persisted in localStorage. */
  id: string;
  level: CefrLevel;
  /** English chrome — the row title in the Learn tab. */
  title: string;
  /** One English sentence: what the learner will practise. */
  description: string;
  /** German instruction to the tutor, injected into the system prompt. */
  focus: string;
  /** Optional German opener offered to the learner as an input suggestion. */
  starter?: string;
}

export const LESSONS: Lesson[] = [
  // ---------------------------------------------------------------- A1
  {
    id: "a1-01-introduce-yourself",
    level: "A1",
    title: "Introduce yourself",
    description:
      "Say your name, where you come from, where you live and what you do.",
    focus:
      "Thema dieser Lektion: sich vorstellen. Übe mit dem Lerner: Name, Herkunft, Wohnort, Beruf. Grammatikfokus: Präsens von \"sein\" und \"heißen\", W-Fragen (Wie? Woher? Wo? Was?). Stelle immer nur eine Frage auf einmal und wiederhole die Antwort des Lerners in einem vollständigen Satz. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Hallo! Ich heiße …",
  },
  {
    id: "a1-02-family",
    level: "A1",
    title: "Family",
    description: "Talk about your parents, siblings and the people close to you.",
    focus:
      "Thema dieser Lektion: Familie. Übe mit dem Lerner: Eltern, Geschwister, Kinder, Alter, wo die Familie wohnt. Grammatikfokus: Possessivartikel (mein/meine, dein/deine), Präsens von \"haben\", Zahlen beim Alter. Frage nach einzelnen Familienmitgliedern und lass den Lerner kurze Sätze bilden. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Meine Familie ist klein.",
  },
  {
    id: "a1-03-numbers-time-dates",
    level: "A1",
    title: "Numbers, time & dates",
    description: "Handle numbers, clock times, weekdays and dates in German.",
    focus:
      "Thema dieser Lektion: Zahlen, Uhrzeit und Datum. Übe mit dem Lerner: Zahlen bis 100, die Uhrzeit (\"Es ist halb acht\"), Wochentage, Monate, Geburtstag. Grammatikfokus: Präpositionen \"um\", \"am\", \"im\", Fragen mit \"Wann?\" und \"Wie spät?\". Frage nach konkreten Zeiten aus dem Alltag des Lerners und korrigiere die Zeitangaben durch Recasting. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Es ist jetzt zehn Uhr.",
  },
  {
    id: "a1-04-food-and-drinks",
    level: "A1",
    title: "Food & drinks (ordering)",
    description: "Order in a café or restaurant and say what you like to eat.",
    focus:
      "Thema dieser Lektion: Essen und Trinken, im Café oder Restaurant bestellen. Übe mit dem Lerner: Speisen, Getränke, bestellen, bezahlen, Vorlieben ausdrücken. Grammatikfokus: Modalverb \"möchten\", Akkusativ nach \"ich möchte\" und \"ich nehme\", bestimmte und unbestimmte Artikel. Spiel gerne eine kleine Rolle als Kellner oder Kellnerin. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich möchte einen Kaffee, bitte.",
  },
  {
    id: "a1-05-daily-routine",
    level: "A1",
    title: "Daily routine",
    description: "Describe an ordinary day from waking up to going to bed.",
    focus:
      "Thema dieser Lektion: Tagesablauf. Übe mit dem Lerner: aufstehen, frühstücken, arbeiten oder lernen, Feierabend, schlafen gehen. Grammatikfokus: Präsens, trennbare Verben (aufstehen, einkaufen, fernsehen), Zeitangaben am Satzanfang und die Verb-an-zweiter-Stelle-Regel. Frage Schritt für Schritt durch den Tag. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich stehe um sieben Uhr auf.",
  },
  {
    id: "a1-06-shopping",
    level: "A1",
    title: "Shopping",
    description: "Buy things, ask for prices and say what you need.",
    focus:
      "Thema dieser Lektion: Einkaufen. Übe mit dem Lerner: Supermarkt, Lebensmittel, Kleidung, Preise, Mengen (ein Kilo, eine Flasche). Grammatikfokus: Akkusativ (einen/eine/ein), Verb \"brauchen\" und \"kaufen\", Fragen mit \"Was kostet …?\" und \"Wie viel …?\". Spiel gerne kurz die Verkäuferin oder den Verkäufer. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Was kostet das Brot?",
  },
  {
    id: "a1-07-directions-and-places",
    level: "A1",
    title: "Directions & places in town",
    description: "Ask the way and describe where things are in a town.",
    focus:
      "Thema dieser Lektion: Wegbeschreibung und Orte in der Stadt. Übe mit dem Lerner: Bahnhof, Apotheke, Supermarkt, Post, nach dem Weg fragen und ihn beschreiben. Grammatikfokus: Präpositionen mit Dativ (zum, zur, neben, gegenüber), Imperativ (\"Gehen Sie geradeaus\", \"Biegen Sie links ab\"), Frage \"Wo ist …?\" und \"Wie komme ich zu …?\". Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Entschuldigung, wo ist der Bahnhof?",
  },
  {
    id: "a1-08-hobbies",
    level: "A1",
    title: "Hobbies & free time",
    description: "Say what you like doing and how often you do it.",
    focus:
      "Thema dieser Lektion: Hobbys und Freizeit. Übe mit dem Lerner: Sport, Musik, Lesen, Freunde treffen, Häufigkeit (oft, manchmal, nie). Grammatikfokus: Verben mit \"gern\" und \"nicht gern\", Modalverb \"können\", Häufigkeitsangaben im Satz. Frage nach dem Wochenende und nach konkreten Aktivitäten. Beginne selbst mit einer einfachen Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich spiele gern Fußball.",
  },

  // ---------------------------------------------------------------- A2
  {
    id: "a2-01-last-weekend",
    level: "A2",
    title: "My last weekend",
    description: "Tell what you did last weekend using the Perfekt tense.",
    focus:
      "Thema dieser Lektion: das letzte Wochenende erzählen. Übe mit dem Lerner: was er gemacht hat, wen er getroffen hat, wo er war. Grammatikfokus: Perfekt mit \"haben\" und \"sein\", Partizip II (auch unregelmäßig: gegangen, gefahren, gesehen), Wortstellung mit dem Partizip am Satzende. Hake nach Details nach, damit mehrere Perfektformen vorkommen. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Am Wochenende habe ich Freunde getroffen.",
  },
  {
    id: "a2-02-travel-and-holidays",
    level: "A2",
    title: "Travel & holidays",
    description: "Talk about trips, transport and booking a place to stay.",
    focus:
      "Thema dieser Lektion: Reisen und Urlaub. Übe mit dem Lerner: Reiseziele, Verkehrsmittel, Hotel und Buchung, Urlaubserlebnisse. Grammatikfokus: Perfekt für Erlebtes, Präpositionen der Richtung (nach, in die, zum) und des Ortes (in, an, auf), Zeitangaben. Frage nach einer konkreten Reise des Lerners. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Letztes Jahr bin ich nach Italien gefahren.",
  },
  {
    id: "a2-03-health-and-body",
    level: "A2",
    title: "Health & body (at the doctor)",
    description: "Describe symptoms and get through an appointment at the doctor.",
    focus:
      "Thema dieser Lektion: Gesundheit, Körper und beim Arzt. Übe mit dem Lerner: Körperteile, Beschwerden (\"Mir tut der Kopf weh\"), Termin vereinbaren, Ratschläge verstehen. Grammatikfokus: Dativ bei \"weh tun\" und \"Mir geht es …\", Modalverben \"sollen\" und \"müssen\" für Ratschläge, Imperativ. Spiel gerne die Rolle der Ärztin oder des Arztes. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich habe seit gestern Halsschmerzen.",
  },
  {
    id: "a2-04-weather-and-seasons",
    level: "A2",
    title: "Weather & seasons",
    description: "Talk about the weather, the seasons and what you do in each.",
    focus:
      "Thema dieser Lektion: Wetter und Jahreszeiten. Übe mit dem Lerner: Wetterwörter, Jahreszeiten, Kleidung passend zum Wetter, Pläne je nach Wetter. Grammatikfokus: unpersönliches \"es\" (es regnet, es ist kalt), Nebensätze mit \"wenn\", Vergleiche zwischen den Jahreszeiten. Frage, welche Jahreszeit der Lerner mag und warum. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Heute ist es kalt und es regnet.",
  },
  {
    id: "a2-05-work-and-professions",
    level: "A2",
    title: "Work & professions",
    description: "Describe your job, your working day and your colleagues.",
    focus:
      "Thema dieser Lektion: Arbeit und Berufe. Übe mit dem Lerner: Beruf, Arbeitsplatz, Aufgaben, Arbeitszeiten, Kollegen. Grammatikfokus: Nebensätze mit \"weil\" und \"dass\" (Verb am Ende), Modalverben \"müssen\" und \"dürfen\", Berufsbezeichnungen mit und ohne Artikel. Frage nach dem Alltag im Beruf des Lerners und nach den Gründen für seine Berufswahl. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich arbeite als … und mein Tag beginnt um …",
  },
  {
    id: "a2-06-living-and-rooms",
    level: "A2",
    title: "Living & rooms",
    description: "Describe your flat, the rooms and the furniture in them.",
    focus:
      "Thema dieser Lektion: Wohnen, Wohnung und Zimmer. Übe mit dem Lerner: Zimmer, Möbel, Lage der Wohnung, Miete, was ihm an seiner Wohnung gefällt. Grammatikfokus: Wechselpräpositionen mit Dativ bei der Ortsangabe (in der Küche, auf dem Tisch, an der Wand), Verben \"stehen\", \"liegen\", \"hängen\". Lass den Lerner ein Zimmer genau beschreiben. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Meine Wohnung hat zwei Zimmer.",
  },
  {
    id: "a2-07-invitations-and-appointments",
    level: "A2",
    title: "Invitations & appointments",
    description: "Invite someone, agree on a time, accept or turn something down.",
    focus:
      "Thema dieser Lektion: Einladungen und Verabredungen. Übe mit dem Lerner: jemanden einladen, einen Termin vorschlagen, zusagen, höflich absagen und einen Gegenvorschlag machen. Grammatikfokus: Modalverben \"können\" und \"wollen\", höfliche Formen mit \"Hättest du Lust …?\", Zeitangaben mit \"am\", \"um\", \"nächste Woche\". Schlag selbst etwas vor und lass den Lerner reagieren. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Hast du am Samstag Zeit?",
  },
  {
    id: "a2-08-comparing-things",
    level: "A2",
    title: "Comparing things",
    description: "Compare cities, people and things using comparative forms.",
    focus:
      "Thema dieser Lektion: Dinge vergleichen. Übe mit dem Lerner: Städte, Wohnungen, Verkehrsmittel oder Jahreszeiten vergleichen und eine Wahl begründen. Grammatikfokus: Komparativ und Superlativ (größer als, am größten), unregelmäßige Formen (gut/besser/am besten, viel/mehr), Vergleiche mit \"so … wie\" und \"als\". Frage nach echten Vergleichen aus dem Leben des Lerners. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Berlin ist größer als meine Stadt.",
  },

  // ---------------------------------------------------------------- B1
  {
    id: "b1-01-telling-stories",
    level: "B1",
    title: "Telling stories",
    description: "Narrate a longer story, mixing Perfekt and Präteritum.",
    focus:
      "Thema dieser Lektion: Geschichten erzählen. Übe mit dem Lerner: ein Erlebnis ausführlich erzählen, mit Anfang, Höhepunkt und Ende. Grammatikfokus: Mischung aus Perfekt (gesprochene Erzählung) und Präteritum (war, hatte, ging, dachte, sagte), Konnektoren für den Ablauf (zuerst, dann, plötzlich, schließlich), Nebensätze mit \"als\" und \"während\". Frage nach Details und Gefühlen, damit die Erzählung länger wird. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich erzähle dir, was mir letzte Woche passiert ist.",
  },
  {
    id: "b1-02-opinions-and-reasons",
    level: "B1",
    title: "Opinions & giving reasons",
    description: "State an opinion and back it up with clear reasons.",
    focus:
      "Thema dieser Lektion: Meinung äußern und begründen. Übe mit dem Lerner: eine Position zu einem Alltagsthema formulieren, Gründe nennen, zustimmen und widersprechen. Grammatikfokus: Nebensätze mit \"weil\", \"da\", \"obwohl\", \"deshalb\" und \"trotzdem\", Redemittel wie \"Meiner Meinung nach\", \"Ich finde, dass …\". Nimm selbst eine leicht andere Position ein, damit der Lerner argumentieren muss. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Meiner Meinung nach ist das keine gute Idee, weil …",
  },
  {
    id: "b1-03-plans-and-future",
    level: "B1",
    title: "Plans & the future",
    description: "Talk about your plans, goals and what you hope will happen.",
    focus:
      "Thema dieser Lektion: Pläne und Zukunft. Übe mit dem Lerner: Ziele für das nächste Jahr, berufliche und persönliche Pläne, Wünsche und Vermutungen über die Zukunft. Grammatikfokus: Futur I mit \"werden\", Präsens mit Zeitangabe für feste Pläne, Nebensätze mit \"wenn\" und \"damit\", Ausdrücke wie \"Ich habe vor, … zu …\". Frage nach konkreten Schritten, nicht nur nach dem Ziel. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Nächstes Jahr will ich …",
  },
  {
    id: "b1-04-complaints-and-problems",
    level: "B1",
    title: "Complaints & problem-solving",
    description: "Complain politely about a purchase or service and find a solution.",
    focus:
      "Thema dieser Lektion: Reklamation und Probleme lösen. Übe mit dem Lerner: ein Problem beschreiben, sich höflich beschweren, eine Lösung fordern, auf ein Angebot reagieren. Grammatikfokus: höflicher Konjunktiv II (könnten Sie, ich würde, wäre es möglich), Passiv-Einstieg (\"Das Gerät wurde beschädigt geliefert\"), Nebensätze mit \"dass\". Spiel die Rolle des Kundenservice und bleib freundlich, aber nicht sofort nachgiebig. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich möchte mich über meine Bestellung beschweren.",
  },
  {
    id: "b1-05-german-culture",
    level: "B1",
    title: "German culture & everyday life",
    description: "Discuss customs, holidays and everyday habits in Germany.",
    focus:
      "Thema dieser Lektion: deutsche Kultur und Alltagsleben. Übe mit dem Lerner: Feste und Feiertage, Essgewohnheiten, Pünktlichkeit, Mülltrennung, Unterschiede zum Heimatland des Lerners. Grammatikfokus: Relativsätze (der Feiertag, den man im Dezember feiert), Nebensätze mit \"während\" und \"obwohl\", unpersönliches \"man\". Frage nach Vergleichen mit der Kultur des Lerners. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "In Deutschland ist mir aufgefallen, dass …",
  },
  {
    id: "b1-06-media-and-internet",
    level: "B1",
    title: "Media & the internet",
    description: "Talk about news, social media and how you use technology.",
    focus:
      "Thema dieser Lektion: Medien und Internet. Übe mit dem Lerner: Nachrichtenquellen, soziale Netzwerke, Streaming, Bildschirmzeit, Vor- und Nachteile. Grammatikfokus: Relativsätze, Nebensätze mit \"ob\" und \"dass\", Verben mit Präpositionen (sich interessieren für, sich informieren über, abhängen von). Frage nach den Gewohnheiten des Lerners und lass ihn Vor- und Nachteile abwägen. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich informiere mich meistens online über Nachrichten.",
  },
  {
    id: "b1-07-feelings-and-relationships",
    level: "B1",
    title: "Feelings & relationships",
    description: "Describe friendships, conflicts and how situations make you feel.",
    focus:
      "Thema dieser Lektion: Gefühle und Beziehungen. Übe mit dem Lerner: Freundschaft, Familie, Streit und Versöhnung, Gefühle genau benennen (enttäuscht, erleichtert, stolz). Grammatikfokus: Reflexivverben (sich freuen über, sich ärgern über, sich streiten mit), Nebensätze mit \"weil\" und \"obwohl\", höflicher Konjunktiv II für Ratschläge (\"An deiner Stelle würde ich …\"). Frag behutsam nach und dräng den Lerner zu nichts Privatem. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich habe mich neulich über einen Freund geärgert.",
  },
  {
    id: "b1-08-job-interviews",
    level: "B1",
    title: "Job interviews",
    description: "Present your experience and answer typical interview questions.",
    focus:
      "Thema dieser Lektion: Bewerbungsgespräch. Übe mit dem Lerner: Werdegang darstellen, Stärken und Schwächen, Motivation für die Stelle, Fragen an das Unternehmen. Grammatikfokus: Perfekt und Präteritum für den Werdegang, Nebensätze mit \"weil\" und \"damit\", höflicher Konjunktiv II (\"Ich würde gerne …\"), formelles Sie. Spiel die Rolle der Personalerin und stelle typische Fragen nacheinander. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Erzählen Sie mir bitte etwas über sich.",
  },

  // ---------------------------------------------------------------- B2
  {
    id: "b2-01-argumentation",
    level: "B2",
    title: "Argumentation & debate",
    description: "Build an argument, counter objections and hold your position.",
    focus:
      "Thema dieser Lektion: Argumentieren und debattieren. Übe mit dem Lerner: These aufstellen, Argumente ordnen, Gegenargumente entkräften, Zugeständnisse machen. Grammatikfokus: Konnektoren der Argumentation (einerseits/andererseits, zwar … aber, dennoch, folglich), Nominalisierung, Konjunktiv II für abwägende Formulierungen. Übernimm konsequent die Gegenposition und fordere den Lerner heraus. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich bin der Ansicht, dass … Einerseits …",
  },
  {
    id: "b2-02-hypotheses",
    level: "B2",
    title: "Hypotheses (what if …)",
    description: "Speculate about unreal situations and their consequences.",
    focus:
      "Thema dieser Lektion: Hypothesen und irreale Situationen. Übe mit dem Lerner: \"Was wäre, wenn …\"-Szenarien, Wünsche, Bedauern über Vergangenes. Grammatikfokus: Konjunktiv II durchgehend, Gegenwart (wäre, hätte, könnte, würde) und Vergangenheit (wäre gewesen, hätte gemacht), irreale Bedingungssätze mit und ohne \"wenn\". Stelle immer wieder neue Was-wäre-wenn-Fragen. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Wenn ich mehr Zeit hätte, würde ich …",
  },
  {
    id: "b2-03-environment-and-society",
    level: "B2",
    title: "Environment & society",
    description: "Discuss climate, social issues and what should change.",
    focus:
      "Thema dieser Lektion: Umwelt und Gesellschaft. Übe mit dem Lerner: Klimawandel, Verkehr, Konsum, soziale Gerechtigkeit, Verantwortung von Einzelnen und Politik. Grammatikfokus: Passiv (wird gefördert, wurde beschlossen, muss reduziert werden), Nominalisierung (die Verringerung des Ausstoßes), unpersönliche Konstruktionen mit \"es\" und \"man\". Fordere konkrete Vorschläge statt allgemeiner Aussagen. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Der Klimawandel betrifft uns alle, weil …",
  },
  {
    id: "b2-04-news-and-current-topics",
    level: "B2",
    title: "News & current topics",
    description: "Summarize a piece of news and comment on it.",
    focus:
      "Thema dieser Lektion: Nachrichten und aktuelle Themen. Übe mit dem Lerner: eine Meldung zusammenfassen, Quellen einordnen, kommentieren, Vermutungen über Hintergründe äußern. Grammatikfokus: Konjunktiv I und indirekte Rede (er sagte, er sei/habe), Passiv in Berichtssprache, Redemittel wie \"laut\", \"zufolge\", \"es heißt, dass …\". Frag nach einem Thema, das den Lerner gerade beschäftigt, und hake kritisch nach. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich habe gelesen, dass …",
  },
  {
    id: "b2-05-idioms-and-colloquial",
    level: "B2",
    title: "Idioms & colloquial German",
    description: "Use everyday idioms and understand casual spoken German.",
    focus:
      "Thema dieser Lektion: idiomatische Wendungen und Umgangssprache. Übe mit dem Lerner: geläufige Redewendungen (die Nase voll haben, jemandem die Daumen drücken, unter vier Augen), Partikeln (doch, mal, halt, eben) und lockeren Alltagston. Grammatikfokus: idiomatische Wendungen im Satz korrekt einsetzen, Modalpartikeln, feste Verb-Nomen-Verbindungen. Baue selbst Wendungen ein, erkläre sie kurz im Gespräch und lass den Lerner sie sofort selbst verwenden. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich habe die Nase voll von diesem Wetter!",
  },
  {
    id: "b2-06-formal-writing-and-register",
    level: "B2",
    title: "Formal writing & register",
    description: "Switch between casual and formal German the way situations require.",
    focus:
      "Thema dieser Lektion: formelle Sprache und Register. Übe mit dem Lerner: förmliche E-Mails und Anfragen, Behördendeutsch verstehen, zwischen Du- und Sie-Ton wechseln, umgangssprachliche Sätze formell umformulieren. Grammatikfokus: Nominalisierung, Passiv, Funktionsverbgefüge (in Anspruch nehmen, zur Verfügung stellen), höflicher Konjunktiv II. Gib dem Lerner konkrete Sätze zum Umformulieren. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Sehr geehrte Damen und Herren, ich wende mich an Sie, weil …",
  },
  {
    id: "b2-07-presenting-and-summarizing",
    level: "B2",
    title: "Presenting & summarizing",
    description: "Structure a short talk and sum up information clearly.",
    focus:
      "Thema dieser Lektion: präsentieren und zusammenfassen. Übe mit dem Lerner: einen kurzen Vortrag gliedern, Kernaussagen bündeln, Grafiken und Zahlen beschreiben, ein Fazit ziehen. Grammatikfokus: Strukturierungsmittel (zunächst, im Folgenden, abschließend), Nominalisierung, Passiv, Relativsätze zur Verdichtung. Bitte den Lerner um eine kurze Zusammenfassung und gib danach eine gezielte Rückfrage wie im Publikum. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "In meinem kurzen Vortrag geht es um …",
  },
  {
    id: "b2-08-nuanced-feelings-and-criticism",
    level: "B2",
    title: "Nuanced feelings & criticism",
    description: "Express subtle feelings and give criticism diplomatically.",
    focus:
      "Thema dieser Lektion: differenzierte Gefühle und Kritik. Übe mit dem Lerner: feine Unterschiede benennen (verärgert, gekränkt, ernüchtert, gerührt), Kritik diplomatisch formulieren, Lob dosieren, Missverständnisse ansprechen. Grammatikfokus: Konjunktiv II für Abschwächung, Modalpartikeln zur Nuancierung, Ausdrücke wie \"Ich hätte mir gewünscht, dass …\" und \"Es kommt mir so vor, als ob …\". Gib dem Lerner Situationen, in denen er kritisieren muss, ohne zu verletzen. Beginne selbst mit einer passenden Frage dazu, falls der Lerner nur grüßt.",
    starter: "Ich hätte mir gewünscht, dass wir früher darüber gesprochen hätten.",
  },
];

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return BY_ID.get(id);
}

export function lessonsForLevel(level: CefrLevel): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

/** English names for the CEFR codes — chrome, so not German. */
export const LEVEL_NAMES: Record<CefrLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
};
