import type { ReactElement } from "react";

import { questions } from "#lib/catalogue.ts";
import { masteryOf } from "#lib/mastery.ts";
import type { Mastery } from "#lib/mastery.ts";
import type { QuestionStat } from "#lib/schemas.ts";

import { MasteryBar } from "./MasteryBar.tsx";

function countMastery(
  stats: Readonly<Record<string, QuestionStat>>,
): Record<Mastery, number> {
  const counts: Record<Mastery, number> = {
    mastered: 0,
    once: 0,
    missed: 0,
    new: 0,
  };
  for (const entry of questions) {
    counts[masteryOf(stats[entry.id])] += 1;
  }
  return counts;
}

/**
 * How much of the catalogue is mastered, partly known or unseen.
 * @param props - Per-question statistics.
 * @returns The coverage section.
 */
function CoverageSection(
  props: Readonly<{ stats: Readonly<Record<string, QuestionStat>> }>,
): ReactElement {
  const basic = questions.filter((entry) => entry.section === "G").length;
  return (
    <section className="mt-16">
      <h2 className="text-heading">Fragenkatalog · Catalogue coverage</h2>
      <p className="mt-2 text-muted">
        {questions.length} practice questions: {basic} Grundstoff and{" "}
        {questions.length - basic} class B. A question counts as mastered after
        two correct answers in a row.
      </p>
      <MasteryBar counts={countMastery(props.stats)} />
    </section>
  );
}

export { CoverageSection };
