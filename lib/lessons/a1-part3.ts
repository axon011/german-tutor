import type { LessonContent } from "./types";

/**
 * Study sheets for the A1 lessons added when the path grew from 8 to 20
 * (batch 3 of 2). Keyed by lesson id; merged into LESSON_CONTENT in index.ts.
 */
export const A1_PART3_CONTENT: Record<string, LessonContent> = {
  // Transport & tickets
  "a1-15-transport-and-tickets": {
    goals: [
      "Ask when a train or bus leaves and where it goes from",
      "Buy a ticket and say where you are travelling to",
      "Say how you get around with mit dem and mit der",
    ],
    vocab: [
      { de: "Zug", en: "train", gender: "m", plural: "Züge" },
      { de: "Bus", en: "bus", gender: "m", plural: "Busse" },
      { de: "U-Bahn", en: "underground, subway", gender: "f", plural: "U-Bahnen" },
      { de: "Fahrrad", en: "bicycle", gender: "n", plural: "Fahrräder" },
      { de: "Fahrkarte", en: "ticket", gender: "f", plural: "Fahrkarten" },
      { de: "Gleis", en: "platform, track", gender: "n", plural: "Gleise" },
      { de: "Abfahrt", en: "departure", gender: "f", plural: "Abfahrten" },
      { de: "Ankunft", en: "arrival", gender: "f", plural: "Ankünfte" },
      { de: "Haltestelle", en: "stop (bus, tram)", gender: "f", plural: "Haltestellen" },
      { de: "abfahren", en: "to depart, to leave" },
      { de: "ankommen", en: "to arrive" },
      { de: "umsteigen", en: "to change (trains, buses)" },
    ],
    phrases: [
      { de: "«Wann» fährt der nächste Zug nach Berlin?", en: "When does the next train to Berlin leave?" },
      { de: "«Wo» ist die Haltestelle?", en: "Where is the stop?" },
      { de: "Ich fahre «mit dem Bus» zur Arbeit.", en: "I take the bus to work." },
      { de: "Ich fahre «mit der U-Bahn» nach Hause.", en: "I take the underground home." },
      { de: "Der Zug «kommt» um 14:30 Uhr in München «an».", en: "The train arrives in Munich at 2:30 p.m." },
      { de: "Ich «steige» in Frankfurt «um».", en: "I change trains in Frankfurt." },
    ],
    grammarIds: ["gr-a1-08-questions", "gr-a2-08-separable-verbs"],
    dialogue: [
      { speaker: "Lena", de: "Guten Tag! Ich möchte eine Fahrkarte nach Hamburg, bitte.", en: "Hello! I would like a ticket to Hamburg, please." },
      { speaker: "Markus", de: "Gern. Wann möchten Sie fahren?", en: "Of course. When would you like to travel?" },
      { speaker: "Lena", de: "Morgen früh. Wann fährt der nächste Zug?", en: "Tomorrow morning. When does the next train leave?" },
      { speaker: "Markus", de: "Um 8:10 Uhr. Er kommt um 11:40 Uhr in Hamburg an.", en: "At 8:10. It arrives in Hamburg at 11:40." },
      { speaker: "Lena", de: "Muss ich umsteigen?", en: "Do I have to change?" },
      { speaker: "Markus", de: "Nein, der Zug fährt direkt. Das macht 59 Euro.", en: "No, the train goes straight through. That's 59 euros." },
      { speaker: "Lena", de: "Und wo fährt er ab?", en: "And where does it leave from?" },
      { speaker: "Markus", de: "Auf Gleis sieben. Gute Reise!", en: "From platform seven. Have a good trip!" },
    ],
    check: [
      {
        prompt: "Der Zug fährt um acht Uhr ___.",
        answer: "ab",
        accept: ["los", "weg"],
        hint: "The verb is split: its prefix goes to the very end of the main clause.",
      },
      {
        prompt: "Ich fahre ___ der Bahn nach Köln.",
        answer: "mit",
        hint: "Which preposition goes with a means of transport, as in \"by train\"?",
      },
      {
        prompt: "___ fährt der Zug nach München ab? – Um neun Uhr.",
        answer: "Wann",
        hint: "Which question word asks about time?",
      },
    ],
  },

  // Phone calls & appointments
  "a1-16-phone-and-appointments": {
    goals: [
      "Introduce yourself and ask for someone on the phone",
      "Arrange an appointment with a day and a time",
      "Say what you can and cannot do with können and müssen",
    ],
    vocab: [
      { de: "Telefon", en: "telephone", gender: "n", plural: "Telefone" },
      { de: "Handy", en: "mobile phone", gender: "n", plural: "Handys" },
      { de: "Nummer", en: "number", gender: "f", plural: "Nummern" },
      { de: "Anruf", en: "call", gender: "m", plural: "Anrufe" },
      { de: "Büro", en: "office", gender: "n", plural: "Büros" },
      { de: "Praxis", en: "doctor's practice", gender: "f", plural: "Praxen" },
      { de: "Montag", en: "Monday", gender: "m", plural: "Montage" },
      { de: "Dienstag", en: "Tuesday", gender: "m", plural: "Dienstage" },
      { de: "Mittwoch", en: "Wednesday", gender: "m", plural: "Mittwoche" },
      { de: "anrufen", en: "to call, to phone" },
      { de: "warten", en: "to wait" },
      { de: "müssen", en: "must, to have to" },
    ],
    phrases: [
      { de: "«Hier ist» Anna Weber.", en: "This is Anna Weber speaking." },
      { de: "Ich möchte «einen Termin machen».", en: "I would like to make an appointment." },
      { de: "«Kann ich» bitte Frau Keller sprechen?", en: "Can I speak to Ms Keller, please?" },
      { de: "Am Dienstag «kann ich» leider nicht.", en: "I'm afraid I can't on Tuesday." },
      { de: "Sie «müssen» am Mittwoch um zehn Uhr kommen.", en: "You have to come on Wednesday at ten o'clock." },
      { de: "«Passt Ihnen» Montag um zehn Uhr?", en: "Does Monday at ten o'clock suit you?" },
    ],
    grammarIds: ["gr-a2-07-modal-verbs", "gr-a2-04-prepositions"],
    dialogue: [
      { speaker: "Julia", de: "Praxis Dr. Weber, guten Tag.", en: "Dr Weber's practice, hello." },
      { speaker: "Daniel", de: "Guten Tag, hier ist Daniel Krüger. Ich möchte einen Termin machen.", en: "Hello, this is Daniel Krüger. I would like to make an appointment." },
      { speaker: "Julia", de: "Gern. Können Sie am Montag um neun Uhr kommen?", en: "Of course. Can you come on Monday at nine?" },
      { speaker: "Daniel", de: "Am Montag kann ich leider nicht. Ich muss arbeiten.", en: "I can't on Monday, I'm afraid. I have to work." },
      { speaker: "Julia", de: "Und am Dienstag um zehn Uhr? Passt das?", en: "And on Tuesday at ten? Does that suit you?" },
      { speaker: "Daniel", de: "Ja, Dienstag um zehn ist gut.", en: "Yes, Tuesday at ten is fine." },
      { speaker: "Julia", de: "Gut. Dann bis Dienstag, Herr Krüger.", en: "Good. See you Tuesday, Mr Krüger." },
      { speaker: "Daniel", de: "Danke, auf Wiederhören!", en: "Thank you, goodbye!" },
    ],
    check: [
      {
        prompt: "Ich kann nicht kommen, denn ich ___ am Montag arbeiten. (müssen)",
        answer: "muss",
        hint: "You need the modal verb for \"have to\", in the ich form.",
      },
      {
        prompt: "Ich komme ___ Dienstag um zehn Uhr.",
        answer: "am",
        hint: "Which short preposition goes with a day of the week?",
      },
      {
        prompt: "Ich rufe Sie morgen ___.",
        answer: "an",
        accept: ["zurück"],
        hint: "Separable verb: the prefix jumps to the end of the sentence.",
      },
    ],
  },

  // Feeling ill
  "a1-17-feeling-ill": {
    goals: [
      "Say that you are ill and what hurts",
      "Call in sick with a short reason",
      "Understand simple advice with müssen",
    ],
    vocab: [
      { de: "Ärztin", en: "doctor (female)", gender: "f", plural: "Ärztinnen" },
      { de: "Nase", en: "nose", gender: "f", plural: "Nasen" },
      { de: "Zahn", en: "tooth", gender: "m", plural: "Zähne" },
      { de: "Ohr", en: "ear", gender: "n", plural: "Ohren" },
      { de: "Bein", en: "leg", gender: "n", plural: "Beine" },
      { de: "Hand", en: "hand", gender: "f", plural: "Hände" },
      { de: "Tablette", en: "tablet, pill", gender: "f", plural: "Tabletten" },
      { de: "Tee", en: "tea", gender: "m", plural: "Tees" },
      { de: "krank", en: "ill, sick" },
      { de: "gesund", en: "healthy, well" },
      { de: "müde", en: "tired" },
      { de: "bleiben", en: "to stay" },
    ],
    phrases: [
      { de: "Ich «habe» Kopfschmerzen.", en: "I have a headache." },
      { de: "Ich «habe Fieber» und bin sehr müde.", en: "I have a fever and am very tired." },
      { de: "Ich «bin krank» und bleibe heute im Bett.", en: "I am ill and staying in bed today." },
      { de: "Ich «kann heute nicht» arbeiten, denn ich bin krank.", en: "I can't work today because I am ill." },
      { de: "Sie «müssen» im Bett bleiben.", en: "You have to stay in bed." },
      { de: "Sie «müssen» viel Tee trinken und viel schlafen.", en: "You have to drink a lot of tea and sleep a lot." },
    ],
    grammarIds: ["gr-a1-02-sein-haben", "gr-a2-07-modal-verbs"],
    dialogue: [
      { speaker: "Anja", de: "Guten Morgen, Herr Schmidt. Wie geht es Ihnen?", en: "Good morning, Mr Schmidt. How are you?" },
      { speaker: "Paul", de: "Nicht gut. Ich bin krank und sehr müde.", en: "Not well. I'm ill and very tired." },
      { speaker: "Anja", de: "Haben Sie Fieber?", en: "Do you have a fever?" },
      { speaker: "Paul", de: "Ja, ich habe Fieber und Kopfschmerzen.", en: "Yes, I have a fever and a headache." },
      { speaker: "Anja", de: "Sie müssen jetzt im Bett bleiben und viel Tee trinken.", en: "You have to stay in bed now and drink a lot of tea." },
      { speaker: "Paul", de: "Muss ich auch eine Tablette nehmen?", en: "Do I have to take a tablet too?" },
      { speaker: "Anja", de: "Ja, zweimal am Tag eine Tablette. Dann sind Sie bald wieder gesund.", en: "Yes, one tablet twice a day. Then you'll soon be well again." },
    ],
    check: [
      {
        prompt: "Ich ___ Kopfschmerzen.",
        answer: "habe",
        accept: ["bekomme", "hatte"],
        hint: "In German you do not \"be\" in pain, you own it: use the verb for owning, ich form.",
      },
      {
        prompt: "Der Arzt sagt: Sie ___ im Bett bleiben!",
        answer: "müssen",
        accept: ["sollen"],
        hint: "You need the modal verb for \"have to\"; the second verb stays in the infinitive at the end.",
      },
      {
        prompt: "Ich bin ___ und bleibe im Bett.",
        answer: "krank",
        accept: ["müde"],
        hint: "The adjective for being unwell; it goes with sein, not haben.",
      },
    ],
  },

  // Describing people
  "a1-18-describing-people": {
    goals: [
      "Describe what a person looks like",
      "Say what a person is like",
      "Use sein and ihr to talk about someone's family and things",
    ],
    vocab: [
      { de: "dunkel", en: "dark" },
      { de: "blond", en: "blond" },
      { de: "lang", en: "long" },
      { de: "kurz", en: "short (length)" },
      { de: "jung", en: "young" },
      { de: "nett", en: "nice, kind" },
      { de: "lustig", en: "funny" },
      { de: "ruhig", en: "quiet, calm" },
      { de: "Haar", en: "hair", gender: "n", plural: "Haare" },
      { de: "Auge", en: "eye", gender: "n", plural: "Augen" },
      { de: "Brille", en: "glasses", gender: "f", plural: "Brillen" },
      { de: "aussehen", en: "to look (like)" },
    ],
    phrases: [
      { de: "Mein Freund «ist» groß und ruhig.", en: "My friend is tall and quiet." },
      { de: "Sie «hat» lange Haare und blaue Augen.", en: "She has long hair and blue eyes." },
      { de: "Er «hat» eine Brille.", en: "He wears glasses." },
      { de: "«Seine» Schwester ist sehr lustig.", en: "His sister is very funny." },
      { de: "«Ihr» Bruder ist zwanzig Jahre alt.", en: "Her brother is twenty years old." },
      { de: "«Wie sieht» dein Freund «aus»?", en: "What does your friend look like?" },
    ],
    grammarIds: ["gr-a1-02-sein-haben", "gr-a1-10-possessives"],
    dialogue: [
      { speaker: "Sara", de: "Wer ist das, Jan?", en: "Who is that, Jan?" },
      { speaker: "Jan", de: "Das ist meine Schwester Lisa.", en: "That's my sister Lisa." },
      { speaker: "Sara", de: "Wie sieht sie aus?", en: "What does she look like?" },
      { speaker: "Jan", de: "Sie ist groß und hat lange Haare. Sie hat auch eine Brille.", en: "She is tall and has long hair. She also wears glasses." },
      { speaker: "Sara", de: "Und wie ist sie? Ist sie nett?", en: "And what is she like? Is she nice?" },
      { speaker: "Jan", de: "Ja, sehr nett und lustig. Ihr Freund ist auch nett, aber er ist ruhig.", en: "Yes, very nice and funny. Her boyfriend is nice too, but he is quiet." },
      { speaker: "Sara", de: "Ist er auch groß?", en: "Is he tall too?" },
      { speaker: "Jan", de: "Nein, er ist klein. Seine Haare sind kurz.", en: "No, he is short. His hair is short." },
    ],
    check: [
      {
        prompt: "Meine Schwester ___ lange Haare.",
        answer: "hat",
        hint: "In German you own hair: use the verb for owning, sie form.",
      },
      {
        prompt: "Mein Bruder ist groß. ___ Freundin ist klein.",
        answer: "Seine",
        hint: "Pick the possessive for a male owner; the noun is feminine, so it needs an -e ending.",
      },
      {
        prompt: "Wie ___ deine Schwester aus?",
        answer: "sieht",
        hint: "Separable verb: the main part stays in position 2 and the prefix goes to the end. Think of sehen with er/sie/es.",
      },
    ],
  },

  // Birthdays & celebrations
  "a1-19-birthdays-and-celebrations": {
    goals: [
      "Say the date of a birthday or party with am and an ordinal",
      "Congratulate someone and talk about presents",
      "Say what you buy and bring with the accusative",
    ],
    vocab: [
      { de: "Geschenk", en: "present, gift", gender: "n", plural: "Geschenke" },
      { de: "Party", en: "party", gender: "f", plural: "Partys" },
      { de: "Kuchen", en: "cake", gender: "m", plural: "Kuchen" },
      { de: "Einladung", en: "invitation", gender: "f", plural: "Einladungen" },
      { de: "Gast", en: "guest", gender: "m", plural: "Gäste" },
      { de: "Blume", en: "flower", gender: "f", plural: "Blumen" },
      { de: "Datum", en: "date", gender: "n", plural: "Daten" },
      { de: "Glückwunsch", en: "congratulation", gender: "m", plural: "Glückwünsche" },
      { de: "feiern", en: "to celebrate" },
      { de: "schenken", en: "to give (as a present)" },
      { de: "einladen", en: "to invite" },
      { de: "gratulieren", en: "to congratulate" },
    ],
    phrases: [
      { de: "Mein Geburtstag ist «am ersten» Mai.", en: "My birthday is on the first of May." },
      { de: "Meine Mutter hat «im» Juni Geburtstag.", en: "My mother's birthday is in June." },
      { de: "Die Party ist «am siebten» Juli.", en: "The party is on the seventh of July." },
      { de: "«Herzlichen Glückwunsch» zum Geburtstag!", en: "Happy birthday! (congratulations on your birthday)" },
      { de: "Ich «kaufe einen Kuchen» und ein Geschenk.", en: "I'm buying a cake and a present." },
      { de: "Ich «lade» dich am Samstag zur Party «ein».", en: "I'm inviting you to the party on Saturday." },
    ],
    grammarIds: ["gr-a1-06-accusative", "gr-a2-04-prepositions"],
    dialogue: [
      { speaker: "Nina", de: "Felix, ich habe bald Geburtstag!", en: "Felix, my birthday is coming up soon!" },
      { speaker: "Felix", de: "Wirklich? Wann denn?", en: "Really? When exactly?" },
      { speaker: "Nina", de: "Am zwanzigsten Mai. Ich mache eine Party und lade dich ein.", en: "On the twentieth of May. I'm having a party and I'm inviting you." },
      { speaker: "Felix", de: "Danke, gern! Wie viele Gäste kommen?", en: "Thanks, gladly! How many guests are coming?" },
      { speaker: "Nina", de: "Zehn Gäste. Ich kaufe einen Kuchen und Blumen.", en: "Ten guests. I'm buying a cake and flowers." },
      { speaker: "Felix", de: "Super. Ich kaufe ein Geschenk für dich.", en: "Great. I'll buy a present for you." },
      { speaker: "Nina", de: "Das ist nett! Danke.", en: "That's kind of you! Thanks." },
      { speaker: "Felix", de: "Dann bis zum zwanzigsten Mai!", en: "Then see you on the twentieth of May!" },
    ],
    check: [
      {
        prompt: "Mein Geburtstag ist am ___ Juni. (3.)",
        answer: "dritten",
        hint: "The ordinal for 3 is irregular, and after am it ends in -n.",
      },
      {
        prompt: "Ich kaufe ___ Kuchen. (ein)",
        answer: "einen",
        hint: "Kuchen is masculine, and the object takes the accusative: the ending of ein changes.",
      },
      {
        prompt: "Meine Mutter hat ___ Mai Geburtstag.",
        answer: "im",
        hint: "Months take the preposition that merges in + dem.",
      },
    ],
  },

  // Writing a short message
  "a1-20-short-messages": {
    goals: [
      "Start and end a short message with Liebe/Lieber and Viele Grüße",
      "Invite someone, cancel or say you will be late",
      "Give a reason with denn",
    ],
    vocab: [
      { de: "Nachricht", en: "message", gender: "f", plural: "Nachrichten" },
      { de: "Entschuldigung", en: "apology, sorry", gender: "f", plural: "Entschuldigungen" },
      { de: "Problem", en: "problem", gender: "n", plural: "Probleme" },
      { de: "Verspätung", en: "delay, lateness", gender: "f", plural: "Verspätungen" },
      { de: "Stau", en: "traffic jam", gender: "m", plural: "Staus" },
      { de: "Kino", en: "cinema", gender: "n", plural: "Kinos" },
      { de: "Tür", en: "door", gender: "f", plural: "Türen" },
      { de: "absagen", en: "to cancel, to decline" },
      { de: "antworten", en: "to answer, to reply" },
      { de: "leider", en: "unfortunately" },
      { de: "später", en: "later" },
      { de: "pünktlich", en: "on time" },
    ],
    phrases: [
      { de: "«Lieber Tom,» hast du am Freitag Zeit?", en: "Dear Tom, do you have time on Friday?" },
      { de: "Ich «kann» leider nicht «kommen», denn ich bin krank.", en: "Unfortunately I can't come, because I am ill." },
      { de: "Ich komme zehn Minuten später, «denn» ich stehe im Stau.", en: "I'll be ten minutes late because I'm stuck in traffic." },
      { de: "Ich schreibe «später» eine Nachricht.", en: "I'll write a message later." },
      { de: "Entschuldigung! Ich habe zehn Minuten «Verspätung».", en: "Sorry! I'm ten minutes late." },
      { de: "«Viele Grüße» und bis bald, Tom", en: "Best wishes and see you soon, Tom" },
    ],
    grammarIds: ["gr-a1-07-verb-second", "gr-a2-07-modal-verbs"],
    dialogue: [
      { speaker: "Tom", de: "Liebe Anna, hast du am Freitag Zeit? Wir gehen um acht Uhr ins Kino.", en: "Dear Anna, do you have time on Friday? We're going to the cinema at eight." },
      { speaker: "Anna", de: "Lieber Tom, ja, ich komme gern! Wo ist das Kino?", en: "Dear Tom, yes, I'd love to come! Where is the cinema?" },
      { speaker: "Tom", de: "Das Kino ist am Bahnhof. Ich warte vor der Tür.", en: "The cinema is at the station. I'll wait outside the door." },
      { speaker: "Anna", de: "Super! Ich bin um acht Uhr dort. Viele Grüße, Anna", en: "Great! I'll be there at eight. Best wishes, Anna" },
      { speaker: "Tom", de: "Hallo Anna, ich komme zehn Minuten später, denn ich stehe im Stau. Entschuldigung!", en: "Hello Anna, I'll be ten minutes late because I'm stuck in traffic. Sorry!" },
      { speaker: "Anna", de: "Kein Problem! Ich warte vor dem Kino. Bis gleich!", en: "No problem! I'll wait outside the cinema. See you soon!" },
      { speaker: "Tom", de: "Danke! Bis bald, Tom", en: "Thanks! See you soon, Tom" },
    ],
    check: [
      {
        prompt: "Ich kann heute nicht kommen, ___ ich bin krank. (because)",
        answer: "denn",
        hint: "Which connector gives a reason and does not change the word order?",
      },
      {
        prompt: "Heute ___ ich leider nicht kommen.",
        answer: "kann",
        accept: ["darf", "möchte"],
        hint: "The verb stays in second position, so ich comes after it. Use the modal for \"be able to\".",
      },
      {
        prompt: "Entschuldigung! Ich habe zehn Minuten ___.",
        answer: "Verspätung",
        hint: "Feminine noun for arriving later than planned.",
      },
    ],
  },
};
