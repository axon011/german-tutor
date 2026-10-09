import type { LessonContent } from "./types";

/** Study sheets for the B2 lessons, keyed by lesson id (see lib/curriculum.ts). */
export const B2_CONTENT: Record<string, LessonContent> = {
  // Argumentation & debate
  "b2-01-argumentation": {
    goals: [
      "State a thesis and back it up with ordered arguments",
      "Concede a point and still hold your position",
      "Weigh two sides with connectors like einerseits … andererseits",
    ],
    vocab: [
      { de: "These", en: "thesis, claim", gender: "f", plural: "Thesen" },
      { de: "Argument", en: "argument", gender: "n", plural: "Argumente" },
      { de: "Einwand", en: "objection", gender: "m", plural: "Einwände" },
      { de: "Standpunkt", en: "position, point of view", gender: "m", plural: "Standpunkte" },
      { de: "Zugeständnis", en: "concession", gender: "n", plural: "Zugeständnisse" },
      { de: "Vorteil", en: "advantage", gender: "m", plural: "Vorteile" },
      { de: "überzeugen", en: "to convince" },
      { de: "widerlegen", en: "to refute" },
      { de: "behaupten", en: "to claim, to assert" },
      { de: "abwägen", en: "to weigh up" },
      { de: "dennoch", en: "nevertheless" },
      { de: "folglich", en: "consequently" },
    ],
    phrases: [
      {
        de: "«Ich bin der Ansicht, dass» Homeoffice die Produktivität steigert.",
        en: "I am of the opinion that working from home increases productivity.",
      },
      {
        de: "Das Auto ist «zwar bequem, aber» für die Umwelt schädlich.",
        en: "The car is comfortable, to be sure, but harmful to the environment.",
      },
      {
        de: "Dieser Einwand ist berechtigt, «dennoch halte ich» an meiner These fest.",
        en: "This objection is justified, but I still stick to my thesis.",
      },
      {
        de: "Die Mieten steigen weiter, «folglich» wird Wohnen für viele unbezahlbar.",
        en: "Rents keep rising, so housing becomes unaffordable for many.",
      },
      {
        de: "«Ich räume ein, dass» du in diesem Punkt recht hast.",
        en: "I concede that you are right on this point.",
      },
      {
        de: "«Man könnte einwenden, dass» das zu teuer ist.",
        en: "One could object that this is too expensive.",
      },
    ],
    grammarIds: ["gr-b2-10-konnektoren", "gr-b2-01-konjunktiv-ii-tenses"],
    dialogue: [
      {
        speaker: "Lena",
        de: "Ich bin der Ansicht, dass wir die Viertagewoche einführen sollten.",
        en: "I think we should introduce the four-day week.",
      },
      {
        speaker: "Tim",
        de: "Einerseits klingt das attraktiv, andererseits wäre es für viele Firmen kaum machbar.",
        en: "On the one hand that sounds attractive, on the other it would hardly be feasible for many firms.",
      },
      {
        speaker: "Lena",
        de: "Dieser Einwand ist berechtigt. Dennoch zeigen mehrere Studien, dass die Mitarbeiter produktiver werden.",
        en: "That objection is justified. Still, several studies show that employees become more productive.",
      },
      {
        speaker: "Tim",
        de: "Mag sein, aber in der Pflege fehlt schon jetzt Personal. Folglich würde sich das Problem verschärfen.",
        en: "Maybe, but nursing is already short of staff. Consequently the problem would get worse.",
      },
      {
        speaker: "Lena",
        de: "Da gebe ich dir recht. Für solche Branchen bräuchte man eine andere Lösung.",
        en: "I agree there. Such sectors would need a different solution.",
      },
      {
        speaker: "Tim",
        de: "Dann räumst du also ein, dass deine These nicht überall gilt?",
        en: "So you concede that your thesis does not apply everywhere?",
      },
      {
        speaker: "Lena",
        de: "Zugegeben, aber als Grundsatz überzeugt sie mich trotzdem.",
        en: "Granted, but as a principle it still convinces me.",
      },
      {
        speaker: "Tim",
        de: "Gut, dann lass uns die Vor- und Nachteile Punkt für Punkt abwägen.",
        en: "Fine, then let's weigh the pros and cons point by point.",
      },
    ],
    check: [
      {
        prompt: "Das Auto ist ___ praktisch, aber teuer.",
        answer: "zwar",
        hint: "The word that pairs with aber to concede a point before the objection.",
      },
      {
        prompt: "Er hat keinen Führerschein, ___ muss er den Bus nehmen.",
        answer: "folglich",
        accept: ["deshalb", "deswegen", "daher", "darum"],
        hint: "A connector that introduces the consequence; the verb follows directly after it.",
      },
      {
        prompt: "Einerseits ist das Gehalt hoch, ___ sind die Arbeitszeiten lang.",
        answer: "andererseits",
        hint: "The second half of the einerseits pair.",
      },
    ],
  },

  // Hypotheses (what if …)
  "b2-02-hypotheses": {
    goals: [
      "Ask and answer what-if questions about unreal situations",
      "Express regret about the past with hätte and wäre",
      "Build conditional sentences with and without wenn",
    ],
    vocab: [
      { de: "Wunsch", en: "wish", gender: "m", plural: "Wünsche" },
      { de: "Bedauern", en: "regret", gender: "n" },
      { de: "Möglichkeit", en: "possibility, option", gender: "f", plural: "Möglichkeiten" },
      { de: "Konsequenz", en: "consequence", gender: "f", plural: "Konsequenzen" },
      { de: "Gelegenheit", en: "opportunity, occasion", gender: "f", plural: "Gelegenheiten" },
      { de: "Entscheidung", en: "decision", gender: "f", plural: "Entscheidungen" },
      { de: "bereuen", en: "to regret" },
      { de: "verpassen", en: "to miss (a chance)" },
      { de: "sich vorstellen", en: "to imagine" },
      { de: "beinahe", en: "almost, nearly" },
      { de: "andernfalls", en: "otherwise" },
      { de: "an deiner Stelle", en: "in your place" },
    ],
    phrases: [
      {
        de: "«Wenn ich mehr Zeit hätte», würde ich öfter reisen.",
        en: "If I had more time, I would travel more often.",
      },
      {
        de: "«Hätte ich das gewusst», wäre ich nicht gekommen.",
        en: "Had I known that, I would not have come.",
      },
      {
        de: "Ich wäre «beinahe zu spät gekommen».",
        en: "I almost arrived too late.",
      },
      {
        de: "«Was wäre, wenn» wir einfach umziehen würden?",
        en: "What if we simply moved?",
      },
      {
        de: "«An deiner Stelle würde ich» das Angebot annehmen.",
        en: "In your place I would accept the offer.",
      },
      {
        de: "Ich «hätte früher anrufen können», aber ich habe es vergessen.",
        en: "I could have called earlier, but I forgot.",
      },
    ],
    grammarIds: ["gr-b2-01-konjunktiv-ii-tenses", "gr-b1-02-konjunktiv-ii-politeness"],
    dialogue: [
      {
        speaker: "Jonas",
        de: "Was wäre, wenn du im Lotto gewinnen würdest?",
        en: "What if you won the lottery?",
      },
      {
        speaker: "Mia",
        de: "Dann würde ich sofort kündigen und ein Jahr lang reisen.",
        en: "Then I would quit right away and travel for a year.",
      },
      {
        speaker: "Jonas",
        de: "Wirklich? Ich würde zuerst eine Wohnung kaufen.",
        en: "Really? I would buy an apartment first.",
      },
      {
        speaker: "Mia",
        de: "Vernünftig. Ich habe neulich eine Gelegenheit verpasst. Hätte ich früher zugesagt, wäre ich jetzt in Lissabon.",
        en: "Sensible. I recently missed an opportunity. Had I said yes earlier, I would be in Lisbon now.",
      },
      {
        speaker: "Jonas",
        de: "Bereust du das?",
        en: "Do you regret it?",
      },
      {
        speaker: "Mia",
        de: "Ein bisschen. Ich hätte mich einfach schneller entscheiden sollen.",
        en: "A little. I should simply have decided faster.",
      },
      {
        speaker: "Jonas",
        de: "An deiner Stelle würde ich es noch einmal versuchen.",
        en: "In your place I would try again.",
      },
      {
        speaker: "Mia",
        de: "Du hast recht. Andernfalls ärgere ich mich nur weiter.",
        en: "You're right. Otherwise I'll just keep being annoyed.",
      },
    ],
    check: [
      {
        prompt: "Wenn ich mehr Geld ___, würde ich ein Haus kaufen.",
        answer: "hätte",
        hint: "Present Konjunktiv II of haben.",
      },
      {
        prompt: "Wenn du mich angerufen hättest, ___ ich sofort gekommen.",
        answer: "wäre",
        hint: "Past Konjunktiv II; kommen forms its perfect with sein.",
      },
      {
        prompt: "___ ich das gewusst, hätte ich anders entschieden.",
        answer: "Hätte",
        hint: "Conditional without wenn: the verb moves to the front.",
      },
    ],
  },

  // Environment & society
  "b2-03-environment-and-society": {
    goals: [
      "Discuss climate and social issues using the passive",
      "Name measures with nominalised nouns like die Verringerung des Ausstoßes",
      "Make concrete proposals with man and es",
    ],
    vocab: [
      { de: "Klimawandel", en: "climate change", gender: "m" },
      { de: "Ausstoß", en: "emissions, output", gender: "m" },
      { de: "Maßnahme", en: "measure", gender: "f", plural: "Maßnahmen" },
      { de: "Verringerung", en: "reduction", gender: "f", plural: "Verringerungen" },
      { de: "Nachhaltigkeit", en: "sustainability", gender: "f" },
      { de: "Verbot", en: "ban", gender: "n", plural: "Verbote" },
      { de: "Gesellschaft", en: "society", gender: "f", plural: "Gesellschaften" },
      { de: "Konsum", en: "consumption", gender: "m" },
      { de: "fördern", en: "to promote, to support" },
      { de: "einschränken", en: "to restrict" },
      { de: "auf etwas verzichten", en: "to do without something" },
      { de: "beschließen", en: "to decide, to pass (a law)" },
    ],
    phrases: [
      {
        de: "In vielen Städten «wird der Autoverkehr eingeschränkt».",
        en: "In many cities car traffic is being restricted.",
      },
      {
        de: "Das Gesetz «wurde im vergangenen Jahr beschlossen».",
        en: "The law was passed last year.",
      },
      {
        de: "«Der CO₂-Ausstoß muss reduziert werden», sonst verfehlen wir die Klimaziele.",
        en: "CO₂ emissions must be reduced, otherwise we will miss the climate targets.",
      },
      {
        de: "«Es kommt darauf an», dass jeder Verantwortung übernimmt.",
        en: "What matters is that everyone takes responsibility.",
      },
      {
        de: "«Man sollte» häufiger auf das Auto verzichten.",
        en: "One should do without the car more often.",
      },
      {
        de: "«Die Verringerung des Energieverbrauchs» ist ohne Verzicht kaum möglich.",
        en: "Reducing energy consumption is hardly possible without sacrifice.",
      },
    ],
    grammarIds: ["gr-b2-02-passive-all-tenses", "gr-b2-03-nominalisierung"],
    dialogue: [
      {
        speaker: "Sara",
        de: "Hast du gelesen, dass in unserer Stadt der Autoverkehr eingeschränkt werden soll?",
        en: "Did you read that car traffic is to be restricted in our city?",
      },
      {
        speaker: "Felix",
        de: "Ja, für die Innenstadt wurde gestern ein Fahrverbot beschlossen.",
        en: "Yes, a driving ban was passed for the city centre yesterday.",
      },
      {
        speaker: "Sara",
        de: "Finde ich richtig. Es muss endlich etwas gegen den Ausstoß getan werden.",
        en: "I think that's right. Something finally has to be done about emissions.",
      },
      {
        speaker: "Felix",
        de: "Aber man kann nicht alles verbieten. Besser wäre es, wenn der Nahverkehr stärker gefördert würde.",
        en: "But you can't ban everything. It would be better if public transport were promoted more.",
      },
      {
        speaker: "Sara",
        de: "Beides gehört zusammen. Die Verringerung des Verkehrs lässt sich nur mit Alternativen erreichen.",
        en: "Both belong together. Reducing traffic can only be achieved with alternatives.",
      },
      {
        speaker: "Felix",
        de: "Da hast du recht. Man müsste zuerst mehr Radwege bauen.",
        en: "You're right. One would first have to build more cycle paths.",
      },
      {
        speaker: "Sara",
        de: "Genau, und jeder trägt Verantwortung, auch beim Konsum.",
        en: "Exactly, and everyone bears responsibility, including in consumption.",
      },
      {
        speaker: "Felix",
        de: "Dann fange ich gleich an und verzichte am Wochenende auf das Auto.",
        en: "Then I'll start right away and do without the car on the weekend.",
      },
    ],
    check: [
      {
        prompt: "Der Ausstoß von CO₂ ___ in den letzten Jahren deutlich verringert worden.",
        answer: "ist",
        hint: "Perfect passive: participle + worden, plus the right form of the auxiliary.",
      },
      {
        prompt: "Das neue Gesetz ___ gestern vom Bundestag beschlossen.",
        answer: "wurde",
        hint: "Past-tense passive: use the Präteritum of werden.",
      },
      {
        prompt: "Die ___ des Verbrauchs ist unser wichtigstes Ziel.",
        answer: "Verringerung",
        accept: ["Senkung", "Reduzierung", "Reduktion"],
        hint: "Nominalisation: a noun made from the verb meaning to make smaller.",
      },
    ],
  },

  // News & current topics
  "b2-04-news-and-current-topics": {
    goals: [
      "Summarize a news item and name its source",
      "Report what others said using Konjunktiv I",
      "Use laut, zufolge and es heißt to mark information as reported",
    ],
    vocab: [
      { de: "Meldung", en: "news item, report", gender: "f", plural: "Meldungen" },
      { de: "Quelle", en: "source", gender: "f", plural: "Quellen" },
      { de: "Bericht", en: "report, article", gender: "m", plural: "Berichte" },
      { de: "Schlagzeile", en: "headline", gender: "f", plural: "Schlagzeilen" },
      { de: "Behauptung", en: "claim, assertion", gender: "f", plural: "Behauptungen" },
      { de: "Hintergrund", en: "background", gender: "m", plural: "Hintergründe" },
      { de: "berichten", en: "to report" },
      { de: "bestätigen", en: "to confirm" },
      { de: "dementieren", en: "to deny (officially)" },
      { de: "verbreiten", en: "to spread" },
      { de: "laut", en: "according to" },
      { de: "es heißt, dass", en: "it is said that" },
    ],
    phrases: [
      {
        de: "«Laut einem Bericht» der Tagesschau steigen die Preise weiter.",
        en: "According to a report by the Tagesschau, prices keep rising.",
      },
      {
        de: "Dem Ministerium «zufolge sei» die Lage unter Kontrolle.",
        en: "According to the ministry, the situation is under control.",
      },
      {
        de: "Der Minister sagte, «er habe» davon nichts gewusst.",
        en: "The minister said he had known nothing about it.",
      },
      {
        de: "«Es heißt, dass» die Verhandlungen scheitern könnten.",
        en: "It is said that the negotiations could fail.",
      },
      {
        de: "Die Firma «hat die Vorwürfe dementiert».",
        en: "The company has denied the allegations.",
      },
      {
        de: "«Ich habe gelesen, dass» das Werk geschlossen wird.",
        en: "I read that the plant is being closed.",
      },
    ],
    grammarIds: ["gr-b2-05-subjective-modals", "gr-b2-02-passive-all-tenses"],
    dialogue: [
      {
        speaker: "Nina",
        de: "Hast du die Schlagzeile von heute gesehen? Der Bürgermeister soll zurücktreten.",
        en: "Did you see today's headline? The mayor is supposed to resign.",
      },
      {
        speaker: "Paul",
        de: "Ja, aber ich traue der Quelle nicht. Woher stammt die Meldung?",
        en: "Yes, but I don't trust the source. Where does the report come from?",
      },
      {
        speaker: "Nina",
        de: "Laut der Zeitung hat ein Insider davon berichtet.",
        en: "According to the paper, an insider reported it.",
      },
      {
        speaker: "Paul",
        de: "Der Bürgermeister selbst sagte gestern, er habe nie über einen Rücktritt nachgedacht.",
        en: "The mayor himself said yesterday that he had never thought about resigning.",
      },
      {
        speaker: "Nina",
        de: "Vielleicht dementiert er es nur, weil er es noch nicht bestätigen darf.",
        en: "Maybe he only denies it because he is not yet allowed to confirm it.",
      },
      {
        speaker: "Paul",
        de: "Möglich. Es heißt außerdem, dass die Partei ihn nicht mehr unterstütze.",
        en: "Possible. It is also said that the party no longer supports him.",
      },
      {
        speaker: "Nina",
        de: "Dann würde ich erst einmal weitere Berichte abwarten.",
        en: "Then I would wait for further reports first.",
      },
      {
        speaker: "Paul",
        de: "Genau, solche Behauptungen verbreiten sich viel zu schnell.",
        en: "Exactly, such claims spread far too fast.",
      },
    ],
    check: [
      {
        prompt: "Der Sprecher sagte, die Firma ___ keine Fehler gemacht.",
        answer: "habe",
        accept: ["hätte", "hat"],
        hint: "Reported speech: Konjunktiv I of the auxiliary, third person singular.",
      },
      {
        prompt: "___ einer neuen Studie sinkt die Zahl der Unfälle.",
        answer: "Laut",
        accept: ["Nach"],
        hint: "A preposition that cites a source.",
      },
      {
        prompt: "Der Politiker ___ das Gerücht sofort dementiert haben.",
        answer: "soll",
        hint: "The modal verb that marks a claim made by others, which you cannot verify.",
      },
    ],
  },

  // Idioms & colloquial German
  "b2-05-idioms-and-colloquial": {
    goals: [
      "Use common idioms like die Nase voll haben in the right sentence",
      "Soften and colour casual speech with particles such as halt and eben",
      "Understand relaxed, spoken everyday German",
    ],
    vocab: [
      { de: "Redewendung", en: "idiom, set phrase", gender: "f", plural: "Redewendungen" },
      { de: "Umgangssprache", en: "colloquial language", gender: "f" },
      { de: "von etwas die Nase voll haben", en: "to be fed up with something" },
      { de: "jemandem die Daumen drücken", en: "to keep one's fingers crossed for someone" },
      { de: "unter vier Augen", en: "in private, one-on-one" },
      { de: "auf dem Schlauch stehen", en: "to be slow on the uptake" },
      { de: "Schwein haben", en: "to be lucky" },
      { de: "nur Bahnhof verstehen", en: "to not understand a thing" },
      { de: "Tomaten auf den Augen haben", en: "to be oblivious to what's in front of you" },
      { de: "Das ist nicht mein Bier.", en: "That's not my business (lit. not my beer)." },
      { de: "halt", en: "simply, just (particle)" },
      { de: "eben", en: "simply, just so (particle)" },
    ],
    phrases: [
      {
        de: "«Ich habe die Nase voll» von dem Wetter.",
        en: "I'm fed up with this weather.",
      },
      {
        de: "«Ich drücke dir die Daumen» für die Prüfung.",
        en: "I'm keeping my fingers crossed for you for the exam.",
      },
      {
        de: "Können wir das «unter vier Augen» besprechen?",
        en: "Can we discuss this in private?",
      },
      {
        de: "Da hast du aber «Schwein gehabt»!",
        en: "You were really lucky there!",
      },
      {
        de: "Ich glaube, ich «stehe gerade auf dem Schlauch».",
        en: "I think I'm being slow on the uptake right now.",
      },
      {
        de: "Das ist «eben» so, da kann man nichts machen.",
        en: "That's just how it is, there's nothing you can do.",
      },
    ],
    grammarIds: ["gr-b2-07-register", "gr-b2-08-funktionsverbgefuege"],
    dialogue: [
      {
        speaker: "Tobias",
        de: "Ich habe die Nase voll von diesem Regen!",
        en: "I'm fed up with this rain!",
      },
      {
        speaker: "Eva",
        de: "Ach komm, das ist halt der deutsche Herbst. Wie war eigentlich dein Vorstellungsgespräch?",
        en: "Come on, that's just the German autumn. How was your job interview, by the way?",
      },
      {
        speaker: "Tobias",
        de: "Ich glaube, ich stand total auf dem Schlauch.",
        en: "I think I was completely slow on the uptake.",
      },
      {
        speaker: "Eva",
        de: "Mach dir keinen Kopf, das passiert jedem mal. Ich drücke dir die Daumen.",
        en: "Don't worry, that happens to everyone. I'm keeping my fingers crossed for you.",
      },
      {
        speaker: "Tobias",
        de: "Danke. Kann ich dir noch etwas unter vier Augen erzählen?",
        en: "Thanks. Can I tell you something else in private?",
      },
      {
        speaker: "Eva",
        de: "Klar, schieß los.",
        en: "Sure, go ahead.",
      },
      {
        speaker: "Tobias",
        de: "Der Chef hat mich nach Excel gefragt, und ich habe nur Bahnhof verstanden.",
        en: "The boss asked me about Excel, and I didn't understand a thing.",
      },
      {
        speaker: "Eva",
        de: "Das war halt Pech. Aber keine Sorge, du hast bestimmt Schwein und bekommst die Stelle.",
        en: "That was just bad luck. But don't worry, you'll surely be lucky and get the job.",
      },
    ],
    check: [
      {
        prompt: "Ich habe die ___ voll von diesem Stress.",
        answer: "Nase",
        hint: "A body-part idiom meaning to be fed up.",
      },
      {
        prompt: "Wir drücken dir morgen bei der Prüfung die ___.",
        answer: "Daumen",
        hint: "The idiom for wishing luck uses a part of the hand, in the plural.",
      },
      {
        prompt: "Das kann ich dir nur ___ vier Augen sagen.",
        answer: "unter",
        hint: "The preposition in the fixed expression for a private conversation.",
      },
    ],
  },

  // Formal writing & register
  "b2-06-formal-writing-and-register": {
    goals: [
      "Write a polite formal email or letter with the right opening and closing",
      "Rephrase casual sentences in formal German",
      "Use Funktionsverbgefüge and the passive in official language",
    ],
    vocab: [
      { de: "Anfrage", en: "enquiry, request", gender: "f", plural: "Anfragen" },
      { de: "Anliegen", en: "concern, request", gender: "n", plural: "Anliegen" },
      { de: "Frist", en: "deadline", gender: "f", plural: "Fristen" },
      { de: "Bearbeitung", en: "processing", gender: "f" },
      { de: "Unterlagen", en: "documents, papers (plural only)", gender: "f" },
      { de: "Rückmeldung", en: "feedback, reply", gender: "f", plural: "Rückmeldungen" },
      { de: "in Anspruch nehmen", en: "to make use of" },
      { de: "zur Verfügung stellen", en: "to make available" },
      { de: "Bezug nehmen auf", en: "to refer to" },
      { de: "beantragen", en: "to apply for" },
      { de: "umgehend", en: "immediately, without delay" },
      { de: "hiermit", en: "hereby" },
    ],
    phrases: [
      {
        de: "«Sehr geehrte Damen und Herren», ich wende mich an Sie, weil ich Fragen zu meiner Anmeldung habe.",
        en: "Dear Sir or Madam, I am writing to you because I have questions about my registration.",
      },
      {
        de: "«Ich nehme Bezug auf» Ihr Schreiben vom 3. Oktober.",
        en: "I am referring to your letter of 3 October.",
      },
      {
        de: "«Ich wäre Ihnen dankbar, wenn» Sie mir die Unterlagen zusenden könnten.",
        en: "I would be grateful if you could send me the documents.",
      },
      {
        de: "Die Unterlagen «werden Ihnen umgehend zur Verfügung gestellt».",
        en: "The documents will be made available to you without delay.",
      },
      {
        de: "Für eine baldige Rückmeldung «wäre ich Ihnen sehr verbunden».",
        en: "I would be very obliged for a prompt reply.",
      },
      {
        de: "Ich möchte gern Ihre Beratung «in Anspruch nehmen».",
        en: "I would like to make use of your advisory service.",
      },
    ],
    grammarIds: ["gr-b2-07-register", "gr-b2-08-funktionsverbgefuege"],
    dialogue: [
      {
        speaker: "Katrin",
        de: "Ich muss meinem Vermieter schreiben. Soll ich einfach schreiben, dass die Heizung kaputt ist und er sie schnell reparieren soll?",
        en: "I have to write to my landlord. Should I simply write that the heating is broken and he should repair it quickly?",
      },
      {
        speaker: "Markus",
        de: "Lieber förmlicher. Zum Beispiel: „Ich möchte Sie darauf hinweisen, dass die Heizung defekt ist.“",
        en: "Better more formal. For example: \"I would like to point out that the heating is defective.\"",
      },
      {
        speaker: "Katrin",
        de: "Und die Bitte? „Repariere das bitte schnell“ klingt wohl zu locker.",
        en: "And the request? \"Please repair that quickly\" probably sounds too casual.",
      },
      {
        speaker: "Markus",
        de: "Ja. Schreib: „Ich wäre Ihnen dankbar, wenn die Heizung umgehend repariert werden könnte.“",
        en: "Yes. Write: \"I would be grateful if the heating could be repaired without delay.\"",
      },
      {
        speaker: "Katrin",
        de: "Das ist Passiv und Konjunktiv II in einem Satz, oder?",
        en: "That's passive and Konjunktiv II in one sentence, right?",
      },
      {
        speaker: "Markus",
        de: "Genau. Und am Anfang nimmst du Bezug auf euren letzten Kontakt.",
        en: "Exactly. And at the start you refer to your last contact.",
      },
      {
        speaker: "Katrin",
        de: "Also: „Ich nehme Bezug auf unser Telefonat vom Montag.“",
        en: "So: \"I am referring to our phone call on Monday.\"",
      },
      {
        speaker: "Markus",
        de: "Perfekt. Zum Schluss schreibst du „Mit freundlichen Grüßen“.",
        en: "Perfect. At the end you write \"Yours sincerely\".",
      },
    ],
    check: [
      {
        prompt: "Ich nehme ___ auf Ihr Schreiben vom 3. Oktober.",
        answer: "Bezug",
        hint: "Funktionsverbgefüge meaning to refer to; the noun is the first word of the pair.",
      },
      {
        prompt: "Wir stellen Ihnen die Unterlagen gern zur ___.",
        answer: "Verfügung",
        hint: "Fixed expression for making something available; a feminine noun after zur.",
      },
      {
        prompt: "Ich ___ Ihnen sehr dankbar, wenn Sie mir antworten könnten.",
        answer: "wäre",
        hint: "Polite Konjunktiv II of sein.",
      },
    ],
  },

  // Presenting & summarizing
  "b2-07-presenting-and-summarizing": {
    goals: [
      "Structure a short talk with signal words like zunächst and abschließend",
      "Describe a graph and its numbers",
      "Condense information with relative clauses and nominal phrases",
    ],
    vocab: [
      { de: "Vortrag", en: "talk, presentation", gender: "m", plural: "Vorträge" },
      { de: "Gliederung", en: "outline, structure", gender: "f", plural: "Gliederungen" },
      { de: "Kernaussage", en: "key message", gender: "f", plural: "Kernaussagen" },
      { de: "Fazit", en: "conclusion, takeaway", gender: "n" },
      { de: "Grafik", en: "chart, graphic", gender: "f", plural: "Grafiken" },
      { de: "Anstieg", en: "rise, increase", gender: "m", plural: "Anstiege" },
      { de: "Rückgang", en: "decline, decrease", gender: "m", plural: "Rückgänge" },
      { de: "Anteil", en: "share, proportion", gender: "m", plural: "Anteile" },
      { de: "zusammenfassen", en: "to summarize" },
      { de: "darstellen", en: "to present, to depict" },
      { de: "hervorheben", en: "to highlight" },
      { de: "eingehen auf", en: "to go into, to address" },
    ],
    phrases: [
      {
        de: "«In meinem Vortrag geht es um» die Folgen des Homeoffice.",
        en: "My talk is about the consequences of working from home.",
      },
      {
        de: "«Zunächst möchte ich» einen Überblick geben.",
        en: "First, I would like to give an overview.",
      },
      {
        de: "«Im Folgenden» stelle ich drei Ergebnisse vor.",
        en: "In what follows I will present three results.",
      },
      {
        de: "Die Grafik zeigt «einen deutlichen Anstieg» der Online-Käufe.",
        en: "The chart shows a clear increase in online purchases.",
      },
      {
        de: "Die Studie, «die wir 2024 durchgeführt haben», umfasst 500 Personen.",
        en: "The study, which we carried out in 2024, covers 500 people.",
      },
      {
        de: "«Abschließend lässt sich festhalten, dass» das Projekt erfolgreich war.",
        en: "In conclusion, it can be said that the project was successful.",
      },
    ],
    grammarIds: ["gr-b2-03-nominalisierung", "gr-b1-01-relative-clauses"],
    dialogue: [
      {
        speaker: "Julia",
        de: "Ich übe gerade meinen Vortrag. Darf ich dir die Gliederung zeigen?",
        en: "I'm practising my talk right now. May I show you the outline?",
      },
      {
        speaker: "David",
        de: "Klar. Worum geht es?",
        en: "Sure. What is it about?",
      },
      {
        speaker: "Julia",
        de: "Um den Rückgang des Autoverkehrs in Innenstädten. Zunächst stelle ich die Zahlen vor, im Folgenden gehe ich auf die Ursachen ein.",
        en: "About the decline of car traffic in city centres. First I present the figures, then I address the causes.",
      },
      {
        speaker: "David",
        de: "Und wie schließt du ab?",
        en: "And how do you finish?",
      },
      {
        speaker: "Julia",
        de: "Abschließend fasse ich die Kernaussagen zusammen und ziehe ein Fazit.",
        en: "Finally I summarize the key messages and draw a conclusion.",
      },
      {
        speaker: "David",
        de: "Die Grafik, die du mir gestern gezeigt hast, ist stark. Heb unbedingt den Anstieg beim Radverkehr hervor.",
        en: "The chart you showed me yesterday is strong. Be sure to highlight the rise in cycling.",
      },
      {
        speaker: "Julia",
        de: "Gute Idee. Und wenn jemand nach dem Anteil der Fußgänger fragt?",
        en: "Good idea. And if someone asks about the share of pedestrians?",
      },
      {
        speaker: "David",
        de: "Dann gehst du kurz darauf ein und sagst ehrlich, was du nicht weißt.",
        en: "Then you briefly address it and say honestly what you don't know.",
      },
    ],
    check: [
      {
        prompt: "Die Grafik, ___ ich Ihnen zeigen möchte, stammt aus dem Jahr 2023.",
        answer: "die",
        accept: ["welche"],
        hint: "Relative pronoun: feminine, accusative.",
      },
      {
        prompt: "___ möchte ich Ihnen die wichtigsten Ergebnisse vorstellen.",
        answer: "Zunächst",
        accept: ["Zuerst", "Als Erstes", "Erstens"],
        hint: "A signal word that opens the first point of a talk.",
      },
      {
        prompt: "Der ___ der Preise hat viele Kunden verärgert.",
        answer: "Anstieg",
        accept: ["Erhöhung"],
        hint: "Nominal style: a noun meaning a rise, followed by a genitive.",
      },
    ],
  },

  // Nuanced feelings & criticism
  "b2-08-nuanced-feelings-and-criticism": {
    goals: [
      "Name fine shades of feeling such as gekränkt, ernüchtert or gerührt",
      "Give criticism diplomatically with Konjunktiv II",
      "Clear up a misunderstanding without blaming anyone",
    ],
    vocab: [
      { de: "Enttäuschung", en: "disappointment", gender: "f", plural: "Enttäuschungen" },
      { de: "Missverständnis", en: "misunderstanding", gender: "n", plural: "Missverständnisse" },
      { de: "Vorwurf", en: "reproach, accusation", gender: "m", plural: "Vorwürfe" },
      { de: "Verständnis", en: "understanding, sympathy", gender: "n" },
      { de: "Kritik", en: "criticism", gender: "f" },
      { de: "verärgert", en: "annoyed" },
      { de: "gekränkt", en: "hurt, offended" },
      { de: "ernüchtert", en: "disillusioned, sobered" },
      { de: "gerührt", en: "touched, moved" },
      { de: "ansprechen", en: "to bring up, to raise" },
      { de: "Rücksicht nehmen auf", en: "to show consideration for" },
      { de: "durchaus", en: "quite, definitely (particle)" },
    ],
    phrases: [
      {
        de: "«Ich hätte mir gewünscht, dass» wir früher darüber gesprochen hätten.",
        en: "I would have wished that we had talked about it earlier.",
      },
      {
        de: "«Es kommt mir so vor, als ob» du mir nicht richtig zuhörst.",
        en: "It seems to me as if you are not really listening to me.",
      },
      {
        de: "Das ist «nicht als Vorwurf gemeint», aber die Verspätung hat mich geärgert.",
        en: "That is not meant as a reproach, but the delay annoyed me.",
      },
      {
        de: "«Könntest du bitte» beim nächsten Mal Bescheid sagen?",
        en: "Could you please let me know next time?",
      },
      {
        de: "Dein Vortrag war «insgesamt gelungen, allerdings» etwas zu lang.",
        en: "Your talk was successful overall, though a bit too long.",
      },
      {
        de: "Ich glaube, da gab es «ein Missverständnis».",
        en: "I think there was a misunderstanding.",
      },
    ],
    grammarIds: ["gr-b1-02-konjunktiv-ii-politeness", "gr-b2-01-konjunktiv-ii-tenses"],
    dialogue: [
      {
        speaker: "Anna",
        de: "Lukas, kann ich dich kurz etwas fragen? Es kommt mir so vor, als ob du in letzter Zeit sauer auf mich wärst.",
        en: "Lukas, may I ask you something? It seems to me as if you've been angry with me lately.",
      },
      {
        speaker: "Lukas",
        de: "Ehrlich gesagt war ich ein bisschen gekränkt. Du hast mich bei der Besprechung nicht erwähnt.",
        en: "Honestly, I was a little hurt. You didn't mention me in the meeting.",
      },
      {
        speaker: "Anna",
        de: "Oh, das war nicht böse gemeint. Ich glaube, da gab es ein Missverständnis.",
        en: "Oh, I didn't mean it badly. I think there was a misunderstanding.",
      },
      {
        speaker: "Lukas",
        de: "Vielleicht. Ich hätte mir gewünscht, dass du vorher kurz mit mir gesprochen hättest.",
        en: "Maybe. I would have wished that you had spoken to me briefly beforehand.",
      },
      {
        speaker: "Anna",
        de: "Du hast recht. Das hätte ich tun sollen. Es tut mir leid.",
        en: "You're right. I should have done that. I'm sorry.",
      },
      {
        speaker: "Lukas",
        de: "Danke, das weiß ich zu schätzen. Deine Präsentation fand ich übrigens insgesamt gelungen, allerdings etwas zu lang.",
        en: "Thanks, I appreciate that. By the way, I found your presentation successful overall, though a bit too long.",
      },
      {
        speaker: "Anna",
        de: "Das ist fair. Könntest du mir beim nächsten Mal vorher Feedback geben?",
        en: "That's fair. Could you give me feedback beforehand next time?",
      },
      {
        speaker: "Lukas",
        de: "Gern. Dann sprechen wir künftig früher miteinander.",
        en: "Gladly. Then we'll talk to each other earlier from now on.",
      },
    ],
    check: [
      {
        prompt: "Ich hätte mir gewünscht, dass du mich vorher angerufen ___.",
        answer: "hättest",
        hint: "Past Konjunktiv II of haben in the dass-clause, second person singular.",
      },
      {
        prompt: "Es kommt mir so vor, ___ ob du mir nicht zuhörst.",
        answer: "als",
        hint: "The conjunction that forms the phrase for \"as if\".",
      },
      {
        prompt: "___ du mir bitte kurz helfen?",
        answer: "Könntest",
        accept: ["Würdest"],
        hint: "A polite request uses Konjunktiv II.",
      },
    ],
  },
};
