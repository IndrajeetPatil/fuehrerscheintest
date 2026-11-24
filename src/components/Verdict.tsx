import type { ReactElement } from "react";

import { Icon } from "./Icon.tsx";

function verdict(correct: boolean, answered: boolean): string {
  if (correct) {
    return "Richtig · Correct";
  }
  return answered
    ? "Nicht ganz · Not quite"
    : "Nicht beantwortet · Not answered";
}

/**
 * Right, wrong or unanswered, with an icon and, when wrong, the error points
 * it costs.
 * @param props - Whether the answer was correct, whether one was given, and
 * the question's points.
 * @returns The verdict line.
 */
function Verdict(
  props: Readonly<{ correct: boolean; answered: boolean; points: number }>,
): ReactElement {
  const { correct, answered, points } = props;
  return (
    <p
      className={`flex flex-wrap items-center gap-2 text-sm font-semibold ${correct ? "text-accent" : "text-rust"}`}
    >
      <Icon name={correct ? "check" : "cross"} />
      {verdict(correct, answered)}
      {correct ? null : (
        <span className="font-normal">
          · {points} Fehlerpunkte · {points} error points
        </span>
      )}
    </p>
  );
}

export { Verdict };
