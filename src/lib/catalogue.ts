// The bundled question catalogue, validated once at start-up.
import data from "#data/catalogue.json" with { type: "json" };

import { catalogueSchema } from "./schemas.ts";
import type { Catalogue, Choice, Question, Section } from "./schemas.ts";

const catalogue: Catalogue = catalogueSchema.parse(data);
const questions: readonly Question[] = catalogue.questions;
const byId = new Map(questions.map((entry) => [entry.id, entry]));

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

const SECTION_LABEL: Readonly<Record<Section, { de: string; en: string }>> = {
  G: { de: "Grundstoff", en: "Basic material" },
  B: { de: "Klasse B", en: "Class B" },
};

/**
 * Looks up a question by id.
 * @param id - Catalogue id such as `G001` or `B012`.
 * @returns The question.
 */
function question(id: string): Question {
  const found = byId.get(id);
  if (found === undefined) {
    throw new Error(`unknown question ${id}`);
  }
  return found;
}

/**
 * Text of one option in one language.
 * @param entry - The question.
 * @param option - Catalogue option index.
 * @param lang - Language.
 * @returns The option text, or an empty string for an invalid index.
 */
function optionText(
  entry: Question,
  option: number,
  lang: "de" | "en",
): string {
  return entry[lang].o[option] ?? "";
}

/**
 * The correct options of a question in one language, joined for a one-line
 * summary.
 * @param entry - The question.
 * @param lang - Language.
 * @returns For example "Vorfahrt gewähren · Notfalls anhalten".
 */
function correctText(entry: Question, lang: "de" | "en"): string {
  return entry.correct
    .map((option) => optionText(entry, option, lang))
    .join(" · ");
}

/**
 * Names a topic of the catalogue.
 * @param code - Topic code such as `vorfahrt`.
 * @param lang - Language of the name.
 * @returns The topic's name, or the code itself if unknown.
 */
function topicName(code: string, lang: "de" | "en" = "de"): string {
  return catalogue.topics.find((topic) => topic.code === code)?.[lang] ?? code;
}

/**
 * Human-facing label of a question, such as "G012 · 5 Punkte".
 * @param entry - The question.
 * @returns The label.
 */
function label(entry: Question): string {
  return `${entry.id} · ${entry.points} Punkte`;
}

/**
 * Whether a choice ticks exactly the correct options: the exam gives credit
 * only for a fully right answer.
 * @param entry - The question.
 * @param chosen - Ticked catalogue indices, ascending.
 * @returns True when the choice matches the answer key.
 */
function isRight(entry: Question, chosen: Choice): boolean {
  return (
    chosen.length === entry.correct.length &&
    chosen.every((option, at) => option === entry.correct[at])
  );
}

/**
 * Ticks or unticks one option, keeping the choice in ascending order.
 * @param chosen - The current choice.
 * @param option - Catalogue index to toggle.
 * @returns The new choice.
 */
function toggleOption(chosen: Choice, option: number): Choice {
  return chosen.includes(option)
    ? chosen.filter((value) => value !== option)
    : [...chosen, option].toSorted((left, right) => left - right);
}

export {
  catalogue,
  correctText,
  isRight,
  label,
  OPTION_KEYS,
  optionText,
  question,
  questions,
  SECTION_LABEL,
  toggleOption,
  topicName,
};
