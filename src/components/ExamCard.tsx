import type { ReactElement } from "react";

import { EXAM } from "#lib/quiz.ts";

/**
 * Starts a mock exam.
 * @param props - Whether a session is active, and the start handler.
 * @returns The card.
 */
function ExamCard(
  props: Readonly<{ disabled: boolean; onStart: () => void }>,
): ReactElement {
  const { disabled, onStart } = props;
  return (
    <div className="flex min-w-0 flex-col rounded-md border border-line bg-surface p-6">
      <h2 className="text-heading">Prüfungssimulation</h2>
      <p className="folio-mark mt-1">Mock exam</p>
      <p className="mt-3 text-muted">
        {EXAM.basic} Grundstoff and {EXAM.classB} class B questions, a{" "}
        {EXAM.minutes}-minute timer and no feedback until you submit. Pass with
        at most {EXAM.maxErrorPoints} error points and no more than one missed
        5-point question.
      </p>
      <div className="mt-auto pt-6">
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={onStart}
          disabled={disabled}
        >
          Start mock exam
        </button>
      </div>
    </div>
  );
}

export { ExamCard };
