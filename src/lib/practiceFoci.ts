// The practice focus choices shown on the dashboard.
import { masteryOf, needsReview } from "./mastery.ts";
import type { Stats } from "./mastery.ts";
import { TOP_POINTS } from "./quiz.ts";
import type { Focus, Question } from "./schemas.ts";

interface FocusChoice {
  value: Exclude<Focus, "selected">;
  label: string;
  hint: string;
  /** Whether the session size applies; otherwise every match is used. */
  sized: boolean;
}

const FOCI: readonly FocusChoice[] = [
  {
    value: "smart",
    label: "Smart mix",
    hint: "Recommended. Up to half the session revisits questions you missed or got right only once; the rest are new ones, with mastered ones returning now and then.",
    sized: true,
  },
  {
    value: "new",
    label: "Not seen yet",
    hint: "Only questions you have never answered.",
    sized: true,
  },
  {
    value: "mistakes",
    label: "My mistakes",
    hint: "Questions you missed last time or have got right only once since.",
    sized: true,
  },
  {
    value: "heavy",
    label: "5-point questions",
    hint: "Right of way, hazards and alcohol: the questions that cost the most. Missing two of them fails the exam on its own.",
    sized: true,
  },
  {
    value: "all",
    label: "Whole catalogue",
    hint: "Every question in the catalogue, in random order. Takes a while.",
    sized: false,
  },
];

const SESSION_SIZES = {
  short: 10,
  standard: 20,
  examLength: 30,
  long: 50,
} as const;
const SIZES: readonly number[] = Object.values(SESSION_SIZES);
const DEFAULT_SIZE = SESSION_SIZES.standard;

/**
 * The focus choice with the given value.
 * @param value - Focus value.
 * @returns Its label, hint and sizing.
 */
function focusChoice(value: FocusChoice["value"]): FocusChoice {
  const found = FOCI.find((choice) => choice.value === value);
  if (found === undefined) {
    throw new Error(`unknown focus ${value}`);
  }
  return found;
}

/**
 * How many questions each focus can draw from.
 * @param questions - The whole catalogue.
 * @param stats - Per-question statistics.
 * @returns Count per focus.
 */
function focusCounts(
  questions: readonly Question[],
  stats: Stats,
): Record<FocusChoice["value"], number> {
  const count = (keep: (entry: Question) => boolean): number =>
    questions.filter((entry) => keep(entry)).length;
  return {
    smart: questions.length,
    new: count((entry) => masteryOf(stats[entry.id]) === "new"),
    mistakes: count((entry) => needsReview(stats[entry.id])),
    heavy: count((entry) => entry.points === TOP_POINTS),
    all: questions.length,
  };
}

export { DEFAULT_SIZE, FOCI, SIZES, focusChoice, focusCounts };
export type { FocusChoice };
