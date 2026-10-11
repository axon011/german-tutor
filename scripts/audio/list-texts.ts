/**
 * Lists every German text the study sheets can play, for scripts/audio/
 * generate.py. Run with tsx (`npm run audio:build` does).
 *
 * The FILE KEY is always audioKey(original text), because that is what the
 * browser computes from the page. SPOKEN_OVERRIDES only changes what Piper is
 * asked to SAY for that file — e.g. spelling out a number or an abbreviation
 * the voice mispronounces — so overriding never breaks the lookup.
 */

import fs from "node:fs";
import path from "node:path";
import { audioKey, spokenTexts } from "../../lib/audio/key";
import { LESSON_CONTENT } from "../../lib/lessons";

/** key = normalized original text, value = what Piper should actually say. */
export const SPOKEN_OVERRIDES: Record<string, string> = {
  // Symbols, letters and abbreviations the voice reads literally or not at all.
  "Schreibt man das mit ß oder mit ss?":
    "Schreibt man das mit Eszett oder mit Doppel-s?",
  "W, E, I und ß. Das ß ist ein Buchstabe, kein doppeltes S.":
    "We, E, I und Eszett. Das Eszett ist ein Buchstabe, kein doppeltes Es.",
  "Ich buchstabiere meinen Namen: M-A-R-I-A.":
    "Ich buchstabiere meinen Namen: Em, A, Er, I, A.",
  "Das Zeichen @ heißt ät.": "Das Zeichen ät heißt ät.",
  "Praxis Dr. Weber, guten Tag.": "Praxis Doktor Weber, guten Tag.",
  "Das ist Passiv und Konjunktiv II in einem Satz, oder?":
    "Das ist Passiv und Konjunktiv zwei in einem Satz, oder?",
  // Numbers the way a German says them: years as "neunzehnhundert…", dates
  // as ordinals, clock times as "acht Uhr zehn", phone numbers and postcodes
  // digit by digit.
  "Meine Telefonnummer ist 0176 234 567.":
    "Meine Telefonnummer ist null eins sieben sechs, zwei drei vier, fünf sechs sieben.",
  "Am 3. Oktober feiern wir den Tag der Deutschen Einheit. Da haben die meisten frei.":
    "Am dritten Oktober feiern wir den Tag der Deutschen Einheit. Da haben die meisten frei.",
  "Von 2021 bis 2023 arbeitete ich als Softwareentwickler in Köln.":
    "Von zweitausendeinundzwanzig bis zweitausenddreiundzwanzig arbeitete ich als Softwareentwickler in Köln.",
  "Wir bezahlen 600 Euro Miete im Monat.":
    "Wir bezahlen sechshundert Euro Miete im Monat.",
  "Um 8:10 Uhr. Er kommt um 11:40 Uhr in Hamburg an.":
    "Um acht Uhr zehn. Er kommt um elf Uhr vierzig in Hamburg an.",
  "Ich nehme Bezug auf Ihr Schreiben vom 3. Oktober.":
    "Ich nehme Bezug auf Ihr Schreiben vom dritten Oktober.",
  "Der Zug kommt um 14:30 Uhr in München an.":
    "Der Zug kommt um vierzehn Uhr dreißig in München an.",
  "Natürlich, die Nummer lautet 48215. Ich ärgere mich, dass das Gerät nach der langen Wartezeit nicht funktioniert.":
    "Natürlich, die Nummer lautet vier acht zwei eins fünf. Ich ärgere mich, dass das Gerät nach der langen Wartezeit nicht funktioniert.",
  "Die Studie, die wir 2024 durchgeführt haben, umfasst 500 Personen.":
    "Die Studie, die wir zweitausendvierundzwanzig durchgeführt haben, umfasst fünfhundert Personen.",
  "Ich bin am 5. Mai 1990 geboren.":
    "Ich bin am fünften Mai neunzehnhundertneunzig geboren.",
  "Gartenstraße 5, 80331 München.":
    "Gartenstraße fünf, acht null drei drei eins München.",
  "Nur 600 Euro im Monat. Im Schlafzimmer steht mein Bett, mehr nicht.":
    "Nur sechshundert Euro im Monat. Im Schlafzimmer steht mein Bett, mehr nicht.",
  "Schwarz, Größe 50. Haben Sie ihn auch in Grün?":
    "Schwarz, Größe fünfzig. Haben Sie ihn auch in Grün?",
  "Ich bin am 12. März 1995 in Graz geboren.":
    "Ich bin am zwölften März neunzehnhundertfünfundneunzig in Graz geboren.",
  "Nein, der Zug fährt direkt. Das macht 59 Euro.":
    "Nein, der Zug fährt direkt. Das macht neunundfünfzig Euro.",
};

const texts = new Set<string>();
for (const content of Object.values(LESSON_CONTENT)) {
  for (const t of spokenTexts(content)) texts.add(t);
}

// An override whose key no longer matches any lesson text (a typo, or the
// content was edited since) silently does nothing — say so loudly instead.
const stale = Object.keys(SPOKEN_OVERRIDES).filter((k) => !texts.has(k));
if (stale.length > 0) {
  console.error(`Unused SPOKEN_OVERRIDES (no matching lesson text):`);
  for (const k of stale) console.error(`  ${JSON.stringify(k)}`);
  process.exitCode = 1;
}

const entries = [...texts]
  .map((original) => ({
    key: audioKey(original),
    text: SPOKEN_OVERRIDES[original] ?? original,
  }))
  .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

const out = path.join(__dirname, "texts.json");
fs.writeFileSync(out, JSON.stringify(entries, null, 2) + "\n", "utf8");
console.log(`${entries.length} texts -> ${path.relative(process.cwd(), out)}`);
