import type { LessonContent } from "./types";

/** Study sheets for the B1 lessons, keyed by lesson id (see lib/curriculum.ts). */
export const B1_CONTENT: Record<string, LessonContent> = {
  // Telling stories
  "b1-01-telling-stories": {
    goals: [
      "Tell a longer story with a beginning, a turning point and an end",
      "Mix Perfekt and Präteritum the way Germans do when they narrate",
      "Link events with connectors such as zuerst, plötzlich and schließlich",
    ],
    vocab: [
      { de: "Erlebnis", en: "experience, event", gender: "n", plural: "Erlebnisse" },
      { de: "Geschichte", en: "story", gender: "f", plural: "Geschichten" },
      { de: "Moment", en: "moment", gender: "m", plural: "Momente" },
      { de: "passieren", en: "to happen" },
      { de: "erleben", en: "to experience" },
      { de: "sich erinnern an", en: "to remember" },
      { de: "zuerst", en: "first, at first" },
      { de: "plötzlich", en: "suddenly" },
      { de: "schließlich", en: "finally, in the end" },
      { de: "zum Glück", en: "luckily, fortunately" },
      { de: "am Ende", en: "in the end, at the end" },
    ],
    phrases: [
      {
        de: "«Als ich gestern nach Hause kam», war die Wohnungstür offen.",
        en: "When I came home yesterday, the apartment door was open.",
      },
      {
        de: "«Plötzlich» ging das Licht aus.",
        en: "Suddenly the light went out.",
      },
      {
        de: "«Während ich auf den Bus wartete», hat es angefangen zu regnen.",
        en: "While I was waiting for the bus, it started to rain.",
      },
      {
        de: "«Zum Glück» ist niemandem etwas passiert.",
        en: "Luckily, nobody got hurt.",
      },
      {
        de: "«Schließlich» sind wir doch noch pünktlich angekommen.",
        en: "In the end we arrived on time after all.",
      },
      {
        de: "«Ich erinnere mich noch genau daran»: Es war ein Samstag im Juli.",
        en: "I remember it exactly: it was a Saturday in July.",
      },
    ],
    grammarIds: ["gr-b1-09-temporal-conjunctions", "gr-a2-01-perfekt"],
    dialogue: [
      {
        speaker: "Lena",
        de: "Du, was ist dir am Wochenende eigentlich passiert? Du wolltest mir noch etwas erzählen.",
        en: "Hey, what actually happened to you at the weekend? You wanted to tell me something.",
      },
      {
        speaker: "Tom",
        de: "Ja, das war verrückt! Zuerst wollte ich nur kurz einkaufen gehen.",
        en: "Yes, it was crazy! At first I only wanted to go shopping quickly.",
      },
      { speaker: "Lena", de: "Und dann?", en: "And then?" },
      {
        speaker: "Tom",
        de: "Als ich aus dem Supermarkt kam, war mein Fahrrad weg.",
        en: "When I came out of the supermarket, my bike was gone.",
      },
      {
        speaker: "Lena",
        de: "Oh nein! Hast du es gesucht?",
        en: "Oh no! Did you look for it?",
      },
      {
        speaker: "Tom",
        de: "Ja, ich bin die ganze Straße entlanggelaufen. Während ich noch suchte, habe ich es plötzlich vor einem Café gesehen.",
        en: "Yes, I walked all the way down the street. While I was still searching, I suddenly saw it in front of a café.",
      },
      { speaker: "Lena", de: "Und wer hatte es?", en: "And who had it?" },
      {
        speaker: "Tom",
        de: "Ein Nachbar hatte es aus Versehen mitgenommen. Zum Glück war er sehr nett.",
        en: "A neighbour had taken it by mistake. Luckily he was very nice.",
      },
    ],
    check: [
      {
        prompt: "___ ich ein Kind war, sind wir oft ans Meer gefahren.",
        answer: "Als",
        hint: "Use the connector for a single event or period in the past.",
      },
      {
        prompt: "Ich habe gekocht, ___ du telefoniert hast.",
        answer: "während",
        accept: ["als"],
        hint: "Two actions happen at the same time.",
      },
      {
        prompt: "Gestern ___ ich sehr müde, deshalb bin ich früh ins Bett gegangen.",
        answer: "war",
        hint: "Narrative past tense (Präteritum) of sein, ich-form.",
      },
    ],
  },

  // Opinions & giving reasons
  "b1-02-opinions-and-reasons": {
    goals: [
      "State your opinion and back it up with clear reasons",
      "Agree and disagree politely in a discussion",
      "Link ideas with weil, da, obwohl, deshalb and trotzdem",
    ],
    vocab: [
      { de: "Meinung", en: "opinion", gender: "f", plural: "Meinungen" },
      { de: "Grund", en: "reason", gender: "m", plural: "Gründe" },
      { de: "Argument", en: "argument", gender: "n", plural: "Argumente" },
      { de: "Vorteil", en: "advantage", gender: "m", plural: "Vorteile" },
      { de: "Nachteil", en: "disadvantage", gender: "m", plural: "Nachteile" },
      { de: "zustimmen", en: "to agree" },
      { de: "widersprechen", en: "to disagree, to contradict" },
      { de: "überzeugen", en: "to convince" },
      { de: "recht haben", en: "to be right" },
      { de: "meiner Meinung nach", en: "in my opinion" },
      { de: "einerseits … andererseits", en: "on the one hand … on the other hand" },
    ],
    phrases: [
      {
        de: "«Meiner Meinung nach» ist Homeoffice besser für die Familie.",
        en: "In my opinion, working from home is better for the family.",
      },
      {
        de: "«Ich finde, dass» Kinder weniger Zeit am Handy verbringen sollten.",
        en: "I think that children should spend less time on their phones.",
      },
      {
        de: "Ich bin dagegen, «weil das viel zu teuer ist».",
        en: "I'm against it because it's far too expensive.",
      },
      {
        de: "«Da es kaum Parkplätze gibt», fahre ich lieber mit dem Rad.",
        en: "Since there are hardly any parking spaces, I prefer to cycle.",
      },
      {
        de: "«Obwohl ich müde bin», gehe ich noch ins Fitnessstudio.",
        en: "Although I'm tired, I'm still going to the gym.",
      },
      {
        de: "Das Auto ist sehr teuer. «Trotzdem» brauche ich es für die Arbeit.",
        en: "The car is very expensive. Even so, I need it for work.",
      },
    ],
    grammarIds: ["gr-a2-05-subordinate-clauses"],
    dialogue: [
      {
        speaker: "Julia",
        de: "Sag mal, findest du, dass man immer im Büro arbeiten sollte?",
        en: "Tell me, do you think people should always work in the office?",
      },
      {
        speaker: "Max",
        de: "Nein, meiner Meinung nach ist Homeoffice viel besser, weil man keine Zeit im Stau verliert.",
        en: "No, in my opinion working from home is much better because you don't lose time in traffic jams.",
      },
      {
        speaker: "Julia",
        de: "Das stimmt, aber ich sehe das anders. Zu Hause lenkt mich oft alles ab.",
        en: "That's true, but I see it differently. At home I get distracted by everything.",
      },
      {
        speaker: "Max",
        de: "Ach, wirklich? Ich arbeite zu Hause konzentrierter, obwohl meine Wohnung ziemlich klein ist.",
        en: "Oh, really? I concentrate better at home, even though my apartment is pretty small.",
      },
      {
        speaker: "Julia",
        de: "Kann sein. Trotzdem vermisse ich zu Hause meine Kollegen, deshalb gehe ich lieber ins Büro.",
        en: "Maybe. Still, I miss my colleagues at home, so I prefer going to the office.",
      },
      {
        speaker: "Max",
        de: "Da hast du recht, der Kontakt ist wichtig. Vielleicht ist ein Mix die beste Lösung.",
        en: "You're right there, contact is important. Maybe a mix is the best solution.",
      },
      {
        speaker: "Julia",
        de: "Genau, zwei Tage zu Hause und drei im Büro. Damit könnte ich leben.",
        en: "Exactly, two days at home and three in the office. I could live with that.",
      },
      {
        speaker: "Max",
        de: "Dann sind wir uns ja einig.",
        en: "Then we agree after all.",
      },
    ],
    check: [
      {
        prompt: "Ich bleibe heute zu Hause, ___ ich krank bin.",
        answer: "weil",
        accept: ["da"],
        hint: "Reason clause: the conjugated verb goes to the end.",
      },
      {
        prompt: "Es regnet stark, ___ gehe ich spazieren.",
        answer: "trotzdem",
        accept: ["dennoch"],
        hint: "A connector meaning 'nevertheless'; the verb comes right after it.",
      },
      {
        prompt: "___ er viel verdient, ist er nicht glücklich.",
        answer: "Obwohl",
        hint: "'Although': a clause that contrasts with the main clause.",
      },
    ],
  },

  // Plans & the future
  "b1-03-plans-and-future": {
    goals: [
      "Describe your plans and goals for the coming year",
      "Talk about the future with werden and with the present tense plus a time",
      "Explain what you do to reach a goal using wenn and damit",
    ],
    vocab: [
      { de: "Plan", en: "plan", gender: "m", plural: "Pläne" },
      { de: "Ziel", en: "goal", gender: "n", plural: "Ziele" },
      { de: "Zukunft", en: "future", gender: "f" },
      { de: "Schritt", en: "step", gender: "m", plural: "Schritte" },
      { de: "Chance", en: "chance, opportunity", gender: "f", plural: "Chancen" },
      { de: "vorhaben", en: "to intend, to plan to" },
      { de: "planen", en: "to plan" },
      { de: "hoffen", en: "to hope" },
      { de: "verwirklichen", en: "to make come true, to realise" },
      { de: "umziehen", en: "to move (house)" },
      { de: "eines Tages", en: "one day" },
    ],
    phrases: [
      {
        de: "«Ich habe vor, nächstes Jahr nach Berlin zu ziehen.»",
        en: "I intend to move to Berlin next year.",
      },
      {
        de: "«Nächsten Monat fahre ich nach Hamburg.»",
        en: "Next month I'm going to Hamburg.",
      },
      {
        de: "«Ich werde jeden Tag eine halbe Stunde Deutsch lernen.»",
        en: "I will study German for half an hour every day.",
      },
      {
        de: "«Wenn ich genug Geld gespart habe», mache ich eine Weltreise.",
        en: "When I've saved enough money, I'll travel around the world.",
      },
      {
        de: "Ich spare Geld, «damit ich im Sommer reisen kann».",
        en: "I'm saving money so that I can travel in the summer.",
      },
      {
        de: "Ich hoffe, «dass es klappt».",
        en: "I hope it works out.",
      },
    ],
    grammarIds: ["gr-b1-06-futur-i", "gr-a2-05-subordinate-clauses"],
    dialogue: [
      {
        speaker: "Anna",
        de: "Was hast du für nächstes Jahr geplant, Paul?",
        en: "What have you planned for next year, Paul?",
      },
      {
        speaker: "Paul",
        de: "Ich habe vor, einen Master in Informatik anzufangen.",
        en: "I plan to start a master's in computer science.",
      },
      {
        speaker: "Anna",
        de: "Wow! Hast du dich schon beworben?",
        en: "Wow! Have you applied yet?",
      },
      {
        speaker: "Paul",
        de: "Noch nicht. Zuerst muss ich meine Zeugnisse übersetzen lassen, damit die Uni sie anerkennt.",
        en: "Not yet. First I have to get my certificates translated so that the university recognises them.",
      },
      {
        speaker: "Anna",
        de: "Und wenn du angenommen wirst, ziehst du dann um?",
        en: "And if you're accepted, will you move then?",
      },
      {
        speaker: "Paul",
        de: "Ja, dann werde ich nach München ziehen. Die Wohnungssuche wird bestimmt schwierig.",
        en: "Yes, then I'll move to Munich. Looking for a flat will certainly be difficult.",
      },
      {
        speaker: "Anna",
        de: "Das glaube ich auch. Ich hoffe, dass du schnell etwas findest.",
        en: "I think so too. I hope you find something quickly.",
      },
      {
        speaker: "Paul",
        de: "Danke! Und was sind deine Pläne?",
        en: "Thanks! And what are your plans?",
      },
    ],
    check: [
      {
        prompt: "Ich habe vor, nächstes Jahr in Köln ___ arbeiten.",
        answer: "zu",
        hint: "The small word that comes before the infinitive in this kind of clause.",
      },
      {
        prompt: "Wenn ich nächstes Jahr mehr Zeit ___, fange ich mit Yoga an.",
        answer: "habe",
        hint: "In a wenn-clause the conjugated verb moves to the end (ich-form).",
      },
      {
        prompt: "In fünf Jahren ___ ich wahrscheinlich in einer anderen Stadt wohnen.",
        answer: "werde",
        hint: "A prediction about the future: use the future auxiliary, ich-form.",
      },
    ],
  },

  // Complaints & problem-solving
  "b1-04-complaints-and-problems": {
    goals: [
      "Describe a problem with a purchase or a service clearly",
      "Complain politely and ask for a solution with Konjunktiv II",
      "Understand and react to the offer of a customer service agent",
    ],
    vocab: [
      { de: "Bestellung", en: "order", gender: "f", plural: "Bestellungen" },
      { de: "Lieferung", en: "delivery", gender: "f", plural: "Lieferungen" },
      { de: "Mangel", en: "defect, flaw", gender: "m", plural: "Mängel" },
      { de: "Rechnung", en: "invoice, bill", gender: "f", plural: "Rechnungen" },
      { de: "Ersatz", en: "replacement", gender: "m" },
      { de: "Rückerstattung", en: "refund", gender: "f", plural: "Rückerstattungen" },
      { de: "sich beschweren über", en: "to complain about" },
      { de: "reklamieren", en: "to make a complaint about a product" },
      { de: "umtauschen", en: "to exchange" },
      { de: "beschädigt", en: "damaged" },
      { de: "defekt", en: "faulty, broken" },
    ],
    phrases: [
      {
        de: "«Könnten Sie mir bitte» meine Bestellung noch einmal schicken?",
        en: "Could you please send my order again?",
      },
      {
        de: "«Wäre es möglich», das Gerät gegen ein neues umzutauschen?",
        en: "Would it be possible to exchange the device for a new one?",
      },
      {
        de: "«Ich würde gern» mein Geld zurückbekommen.",
        en: "I would like to get my money back.",
      },
      {
        de: "Das Gerät «wurde defekt geliefert».",
        en: "The device was delivered faulty.",
      },
      {
        de: "Ich ärgere mich, «dass die Lieferung so lange gedauert hat».",
        en: "I'm annoyed that the delivery took so long.",
      },
      {
        de: "Ich möchte «mich über den Service beschweren».",
        en: "I would like to complain about the service.",
      },
    ],
    grammarIds: ["gr-b1-02-konjunktiv-ii-politeness", "gr-b1-03-passive-present"],
    dialogue: [
      {
        speaker: "Jan",
        de: "Kundenservice, Jan Becker, guten Tag. Wie kann ich Ihnen helfen?",
        en: "Customer service, Jan Becker, good day. How can I help you?",
      },
      {
        speaker: "Sandra",
        de: "Guten Tag, ich möchte mich über meine Bestellung beschweren. Der Mixer wurde defekt geliefert.",
        en: "Hello, I'd like to complain about my order. The blender was delivered faulty.",
      },
      {
        speaker: "Jan",
        de: "Das tut mir leid. Könnten Sie mir bitte Ihre Bestellnummer sagen?",
        en: "I'm sorry about that. Could you please tell me your order number?",
      },
      {
        speaker: "Sandra",
        de: "Natürlich, die Nummer lautet 48215. Ich ärgere mich, dass das Gerät nach der langen Wartezeit nicht funktioniert.",
        en: "Of course, the number is 48215. I'm annoyed that the device doesn't work after such a long wait.",
      },
      {
        speaker: "Jan",
        de: "Ich verstehe Sie gut. Ich könnte Ihnen ein neues Gerät schicken oder das Geld zurückerstatten.",
        en: "I understand. I could send you a new device or refund the money.",
      },
      {
        speaker: "Sandra",
        de: "Wäre es möglich, das neue Gerät bis Freitag zu bekommen? Ich brauche es für eine Feier.",
        en: "Would it be possible to get the new device by Friday? I need it for a party.",
      },
      {
        speaker: "Jan",
        de: "Einen Moment, ich prüfe das. Ja, die Lieferung wird morgen verschickt, dann haben Sie es am Freitag.",
        en: "One moment, I'll check. Yes, the delivery will be sent tomorrow, so you'll have it on Friday.",
      },
      {
        speaker: "Sandra",
        de: "Das wäre perfekt. Vielen Dank für Ihre Hilfe!",
        en: "That would be perfect. Thank you very much for your help!",
      },
    ],
    check: [
      {
        prompt: "___ Sie mir bitte einen Ersatz schicken?",
        answer: "Könnten",
        accept: ["Würden", "Können"],
        hint: "A polite request: use a Konjunktiv II form.",
      },
      {
        prompt: "Das Paket ___ beschädigt geliefert.",
        answer: "wurde",
        hint: "Passive in the past: Präteritum of the passive helper verb.",
      },
      {
        prompt: "Ich ärgere mich, ___ die Lieferung so spät kam.",
        answer: "dass",
        accept: ["weil"],
        hint: "The conjunction that introduces a clause after a feeling; the verb goes last.",
      },
    ],
  },

  // German culture & everyday life
  "b1-05-german-culture": {
    goals: [
      "Describe German customs, holidays and everyday habits",
      "Compare Germany with your home country using relative clauses",
      "Talk in general terms with man and contrast ideas with während and obwohl",
    ],
    vocab: [
      { de: "Feiertag", en: "public holiday", gender: "m", plural: "Feiertage" },
      { de: "Brauch", en: "custom", gender: "m", plural: "Bräuche" },
      { de: "Tradition", en: "tradition", gender: "f", plural: "Traditionen" },
      { de: "Pünktlichkeit", en: "punctuality", gender: "f" },
      { de: "Mülltrennung", en: "waste separation", gender: "f" },
      { de: "Pfand", en: "bottle deposit", gender: "n" },
      { de: "Unterschied", en: "difference", gender: "m", plural: "Unterschiede" },
      { de: "Weihnachtsmarkt", en: "Christmas market", gender: "m", plural: "Weihnachtsmärkte" },
      { de: "feiern", en: "to celebrate" },
      { de: "auffallen", en: "to stand out, to notice" },
      { de: "üblich", en: "usual, customary" },
    ],
    phrases: [
      {
        de: "In Deutschland «trennt man den Müll» in mehrere Tonnen.",
        en: "In Germany you separate your waste into several bins.",
      },
      {
        de: "Der Feiertag, «den man im Dezember feiert», heißt Weihnachten.",
        en: "The holiday that people celebrate in December is called Christmas.",
      },
      {
        de: "Bei einer Einladung «ist es üblich», pünktlich zu kommen.",
        en: "When you're invited somewhere, it's usual to arrive on time.",
      },
      {
        de: "Das ist ein Brauch, «den ich aus meiner Heimat nicht kenne».",
        en: "That's a custom I don't know from my home country.",
      },
      {
        de: "«Während hier sonntags die meisten Geschäfte geschlossen sind», ist bei uns fast alles geöffnet.",
        en: "While most shops are closed on Sundays here, almost everything is open back home.",
      },
      {
        de: "«Obwohl ich schon zwei Jahre hier lebe», überrascht mich manches immer noch.",
        en: "Although I've lived here for two years, some things still surprise me.",
      },
    ],
    grammarIds: ["gr-b1-01-relative-clauses", "gr-b1-09-temporal-conjunctions"],
    dialogue: [
      {
        speaker: "Mira",
        de: "Mir ist aufgefallen, dass hier alle den Müll trennen. Das kenne ich von zu Hause nicht.",
        en: "I've noticed that everyone here separates their waste. I don't know that from home.",
      },
      {
        speaker: "Felix",
        de: "Ja, bei uns gibt es verschiedene Tonnen, in die man Papier, Plastik und Biomüll wirft.",
        en: "Yes, we have different bins that you put paper, plastic and organic waste into.",
      },
      {
        speaker: "Mira",
        de: "Und was ist mit den Flaschen? Ich habe gesehen, dass man sie im Supermarkt zurückgibt.",
        en: "And what about bottles? I saw that you return them at the supermarket.",
      },
      {
        speaker: "Felix",
        de: "Genau, auf die meisten Flaschen zahlt man Pfand, das man später zurückbekommt.",
        en: "Exactly, you pay a deposit on most bottles, which you get back later.",
      },
      {
        speaker: "Mira",
        de: "Praktisch! Mein Kollege war sauer, obwohl ich nur fünf Minuten zu spät war.",
        en: "Practical! My colleague was angry even though I was only five minutes late.",
      },
      {
        speaker: "Felix",
        de: "Pünktlichkeit ist hier wichtig. Während man in manchen Ländern lockerer ist, erwartet man hier Genauigkeit.",
        en: "Punctuality matters here. While people are more relaxed in some countries, precision is expected here.",
      },
      {
        speaker: "Mira",
        de: "Das merke ich mir! Welchen Feiertag feiert man eigentlich im Oktober?",
        en: "I'll remember that! Which public holiday do people celebrate in October, by the way?",
      },
      {
        speaker: "Felix",
        de: "Am 3. Oktober feiern wir den Tag der Deutschen Einheit. Da haben die meisten frei.",
        en: "On 3 October we celebrate German Unity Day. Most people have the day off.",
      },
    ],
    check: [
      {
        prompt: "Das ist ein Feiertag, ___ man im Dezember feiert.",
        answer: "den",
        hint: "Relative pronoun: masculine noun, direct object of the verb.",
      },
      {
        prompt: "Die Tonne, in ___ man Papier wirft, ist blau.",
        answer: "die",
        hint: "Relative pronoun after a preposition: feminine noun, and the paper goes into the bin (movement).",
      },
      {
        prompt: "___ er erst seit zwei Monaten in Deutschland ist, spricht er schon sehr gut Deutsch.",
        answer: "Obwohl",
        hint: "The second part is surprising given the first: use the contrast conjunction.",
      },
    ],
  },

  // Media & the internet
  "b1-06-media-and-internet": {
    goals: [
      "Talk about how you get news and use social media",
      "Weigh up advantages and disadvantages of technology",
      "Use verbs with fixed prepositions such as sich interessieren für and abhängen von",
    ],
    vocab: [
      { de: "Nachricht", en: "news item, message", gender: "f", plural: "Nachrichten" },
      { de: "Quelle", en: "source", gender: "f", plural: "Quellen" },
      { de: "Beitrag", en: "post, article, contribution", gender: "m", plural: "Beiträge" },
      { de: "Werbung", en: "advertising", gender: "f" },
      { de: "Bildschirmzeit", en: "screen time", gender: "f" },
      { de: "Nutzer", en: "user", gender: "m", plural: "Nutzer" },
      { de: "sich interessieren für", en: "to be interested in" },
      { de: "sich informieren über", en: "to find out about" },
      { de: "abhängen von", en: "to depend on" },
      { de: "verbreiten", en: "to spread" },
      { de: "glaubwürdig", en: "credible, trustworthy" },
    ],
    phrases: [
      {
        de: "Ich «informiere mich» meistens online «über» aktuelle Themen.",
        en: "I mostly find out about current topics online.",
      },
      {
        de: "Ich «interessiere mich für» Podcasts über Wissenschaft.",
        en: "I'm interested in podcasts about science.",
      },
      {
        de: "Das «hängt davon ab», ob ich abends Zeit habe.",
        en: "That depends on whether I have time in the evening.",
      },
      {
        de: "Ich bin nicht sicher, «ob die Meldung stimmt».",
        en: "I'm not sure whether the report is true.",
      },
      {
        de: "Es ist gefährlich, «wie schnell sich Falschmeldungen verbreiten».",
        en: "It's dangerous how quickly false reports spread.",
      },
      {
        de: "Die App, «die ich am häufigsten nutze», ist WhatsApp.",
        en: "The app that I use most often is WhatsApp.",
      },
    ],
    grammarIds: ["gr-b1-10-verbs-with-prepositions", "gr-b1-01-relative-clauses"],
    dialogue: [
      {
        speaker: "Clara",
        de: "Wie informierst du dich eigentlich über die Nachrichten?",
        en: "How do you actually keep up with the news?",
      },
      {
        speaker: "David",
        de: "Meistens online. Ich interessiere mich besonders für Politik und Technik.",
        en: "Mostly online. I'm especially interested in politics and technology.",
      },
      {
        speaker: "Clara",
        de: "Ich lese lieber die Zeitung, weil ich nicht weiß, ob man allen Quellen im Internet trauen kann.",
        en: "I prefer reading the newspaper because I don't know whether you can trust all sources on the internet.",
      },
      {
        speaker: "David",
        de: "Da hast du recht. Viele Beiträge, die in den sozialen Medien geteilt werden, sind falsch.",
        en: "You're right. Many posts that are shared on social media are false.",
      },
      {
        speaker: "Clara",
        de: "Wie lange bist du eigentlich jeden Tag am Handy?",
        en: "How long are you actually on your phone every day?",
      },
      {
        speaker: "David",
        de: "Ehrlich gesagt, über vier Stunden. Das hängt davon ab, ob ich frei habe oder arbeite.",
        en: "Honestly, over four hours. It depends on whether I'm off or working.",
      },
      {
        speaker: "Clara",
        de: "Das ist viel! Ich finde, dass man die Bildschirmzeit begrenzen sollte.",
        en: "That's a lot! I think you should limit your screen time.",
      },
      {
        speaker: "David",
        de: "Stimmt, ich versuche es. Die App, die mir die Zeit anzeigt, hilft mir dabei.",
        en: "True, I'm trying. The app that shows me the time helps me with that.",
      },
    ],
    check: [
      {
        prompt: "Ich interessiere mich ___ Podcasts.",
        answer: "für",
        hint: "This reflexive verb takes a fixed preposition.",
      },
      {
        prompt: "Ich weiß nicht, ___ er heute kommt oder nicht.",
        answer: "ob",
        hint: "Indirect yes/no question: which conjunction introduces it?",
      },
      {
        prompt: "Der Artikel, ___ ich gestern gelesen habe, war sehr interessant.",
        answer: "den",
        hint: "Relative pronoun: masculine noun, direct object of the verb.",
      },
    ],
  },

  // Feelings & relationships
  "b1-07-feelings-and-relationships": {
    goals: [
      "Name your feelings precisely and say what causes them",
      "Talk about friendships, arguments and making up",
      "Give friendly advice with An deiner Stelle würde ich …",
    ],
    vocab: [
      { de: "Freundschaft", en: "friendship", gender: "f", plural: "Freundschaften" },
      { de: "Streit", en: "argument, quarrel", gender: "m" },
      { de: "Vertrauen", en: "trust", gender: "n" },
      { de: "Entschuldigung", en: "apology", gender: "f", plural: "Entschuldigungen" },
      { de: "enttäuscht", en: "disappointed" },
      { de: "erleichtert", en: "relieved" },
      { de: "stolz", en: "proud" },
      { de: "sich freuen über", en: "to be pleased about" },
      { de: "sich ärgern über", en: "to be annoyed about" },
      { de: "sich streiten mit", en: "to argue with" },
      { de: "sich versöhnen", en: "to make up, to reconcile" },
    ],
    phrases: [
      {
        de: "Ich «freue mich über» deinen Besuch.",
        en: "I'm happy about your visit.",
      },
      {
        de: "Ich habe «mich über ihn geärgert», weil er nie anruft.",
        en: "I was annoyed with him because he never calls.",
      },
      {
        de: "«Wir streiten uns manchmal über Kleinigkeiten», obwohl wir uns gut verstehen.",
        en: "We sometimes argue about little things, even though we get along well.",
      },
      {
        de: "«An deiner Stelle würde ich» mit ihr reden.",
        en: "If I were you, I would talk to her.",
      },
      {
        de: "Ich war enttäuscht, «weil er sein Versprechen nicht gehalten hat».",
        en: "I was disappointed because he didn't keep his promise.",
      },
      {
        de: "Wir haben «uns wieder versöhnt», obwohl der Streit schlimm war.",
        en: "We made up again, even though the argument was bad.",
      },
    ],
    grammarIds: ["gr-a2-10-reflexive-verbs", "gr-b1-02-konjunktiv-ii-politeness"],
    dialogue: [
      {
        speaker: "Nora",
        de: "Du siehst traurig aus, Ben. Was ist los?",
        en: "You look sad, Ben. What's wrong?",
      },
      {
        speaker: "Ben",
        de: "Ich habe mich gestern mit Jonas gestritten. Er hat meinen Geburtstag vergessen.",
        en: "I had an argument with Jonas yesterday. He forgot my birthday.",
      },
      {
        speaker: "Nora",
        de: "Das ist ärgerlich. Hast du dich sehr über ihn geärgert?",
        en: "That's annoying. Were you very angry with him?",
      },
      {
        speaker: "Ben",
        de: "Ja, und ich war auch enttäuscht, weil wir seit zehn Jahren befreundet sind.",
        en: "Yes, and I was disappointed too, because we've been friends for ten years.",
      },
      {
        speaker: "Nora",
        de: "An deiner Stelle würde ich mit ihm sprechen. Vielleicht gibt es einen Grund.",
        en: "If I were you, I would talk to him. Maybe there's a reason.",
      },
      {
        speaker: "Ben",
        de: "Meinst du? Obwohl er sich nicht gemeldet hat, will ich die Freundschaft nicht verlieren.",
        en: "Do you think so? Even though he hasn't been in touch, I don't want to lose the friendship.",
      },
      {
        speaker: "Nora",
        de: "Eben. Ruf ihn an, dann könnt ihr euch wieder versöhnen.",
        en: "Exactly. Call him, then you can make up again.",
      },
      {
        speaker: "Ben",
        de: "Gut, ich versuche es heute Abend. Danke, dass du zugehört hast.",
        en: "Okay, I'll try this evening. Thanks for listening.",
      },
    ],
    check: [
      {
        prompt: "Ich freue ___ sehr über deine Nachricht.",
        answer: "mich",
        hint: "Reflexive pronoun for ich (accusative).",
      },
      {
        prompt: "Wir streiten ___ oft über Kleinigkeiten.",
        answer: "uns",
        hint: "Reflexive pronoun that matches wir.",
      },
      {
        prompt: "An deiner Stelle ___ ich mit ihr reden.",
        answer: "würde",
        hint: "Friendly advice: Konjunktiv II with the helper verb.",
      },
    ],
  },

  // Job interviews
  "b1-08-job-interviews": {
    goals: [
      "Present your career so far in a job interview",
      "Name your strengths and weaknesses and explain why you want the job",
      "Ask polite questions to the company with Konjunktiv II and formal Sie",
    ],
    vocab: [
      { de: "Bewerbung", en: "application", gender: "f", plural: "Bewerbungen" },
      { de: "Vorstellungsgespräch", en: "job interview", gender: "n", plural: "Vorstellungsgespräche" },
      { de: "Stelle", en: "job, position", gender: "f", plural: "Stellen" },
      { de: "Lebenslauf", en: "CV, résumé", gender: "m", plural: "Lebensläufe" },
      { de: "Erfahrung", en: "experience", gender: "f", plural: "Erfahrungen" },
      { de: "Stärke", en: "strength", gender: "f", plural: "Stärken" },
      { de: "Schwäche", en: "weakness", gender: "f", plural: "Schwächen" },
      { de: "Gehalt", en: "salary", gender: "n", plural: "Gehälter" },
      { de: "sich bewerben um", en: "to apply for" },
      { de: "motiviert", en: "motivated" },
      { de: "zuverlässig", en: "reliable" },
      { de: "Verantwortung übernehmen", en: "to take on responsibility" },
    ],
    phrases: [
      {
        de: "Ich habe «mich um die Stelle als Entwickler beworben».",
        en: "I applied for the position of developer.",
      },
      {
        de: "«Von 2021 bis 2023 arbeitete ich» als Softwareentwickler in Köln.",
        en: "From 2021 to 2023 I worked as a software developer in Cologne.",
      },
      {
        de: "«Ich würde gern» in einem Team arbeiten, weil mir Zusammenarbeit wichtig ist.",
        en: "I would like to work in a team because collaboration is important to me.",
      },
      {
        de: "«Meine größte Stärke ist», dass ich Probleme strukturiert lösen kann.",
        en: "My greatest strength is that I can solve problems in a structured way.",
      },
      {
        de: "Ich lerne gerade Deutsch, «damit ich im Team besser kommunizieren kann».",
        en: "I'm currently learning German so that I can communicate better in the team.",
      },
      {
        de: "«Könnten Sie mir bitte etwas über das Team erzählen?»",
        en: "Could you please tell me something about the team?",
      },
    ],
    grammarIds: ["gr-b1-02-konjunktiv-ii-politeness", "gr-a2-05-subordinate-clauses"],
    dialogue: [
      {
        speaker: "Petra",
        de: "Guten Tag, Herr Aydin. Schön, dass Sie da sind. Erzählen Sie mir bitte etwas über Ihren Werdegang.",
        en: "Good day, Mr Aydin. Nice that you're here. Please tell me something about your career so far.",
      },
      {
        speaker: "Murat",
        de: "Gern. Ich habe in Hamburg Informatik studiert und danach zwei Jahre als Entwickler gearbeitet.",
        en: "Gladly. I studied computer science in Hamburg and then worked as a developer for two years.",
      },
      {
        speaker: "Petra",
        de: "Warum haben Sie sich um diese Stelle beworben?",
        en: "Why did you apply for this position?",
      },
      {
        speaker: "Murat",
        de: "Ich suche eine neue Herausforderung, damit ich mich weiterentwickeln kann. Außerdem würde ich gern mehr Verantwortung übernehmen.",
        en: "I'm looking for a new challenge so that I can develop further. I would also like to take on more responsibility.",
      },
      {
        speaker: "Petra",
        de: "Was ist Ihre größte Stärke?",
        en: "What is your greatest strength?",
      },
      {
        speaker: "Murat",
        de: "Ich bin sehr zuverlässig und lerne schnell. Meine Schwäche ist, dass ich manchmal zu perfektionistisch bin.",
        en: "I'm very reliable and learn quickly. My weakness is that I'm sometimes too much of a perfectionist.",
      },
      {
        speaker: "Petra",
        de: "Das klingt ehrlich. Haben Sie noch Fragen an uns?",
        en: "That sounds honest. Do you have any questions for us?",
      },
      {
        speaker: "Murat",
        de: "Ja, könnten Sie mir bitte sagen, wie groß das Team ist?",
        en: "Yes, could you please tell me how big the team is?",
      },
    ],
    check: [
      {
        prompt: "Ich ___ gern in einem internationalen Team arbeiten.",
        answer: "würde",
        accept: ["möchte"],
        hint: "A polite wish: Konjunktiv II.",
      },
      {
        prompt: "Von 2020 bis 2022 ___ ich als Verkäufer in Kassel.",
        answer: "arbeitete",
        accept: ["war"],
        hint: "Past tense of the verb for 'to work' in the written/narrative style (Präteritum).",
      },
      {
        prompt: "Ich habe mich um die Stelle beworben, ___ ich neue Aufgaben suche.",
        answer: "weil",
        accept: ["da"],
        hint: "Reason clause: the conjugated verb goes to the end.",
      },
    ],
  },
};
