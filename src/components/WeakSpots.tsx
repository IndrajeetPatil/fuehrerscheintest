import type { ReactElement } from "react";

import { correctText, label, questions } from "#lib/catalogue.ts";
import { weakest } from "#lib/mastery.ts";
import type { QuestionStat } from "#lib/schemas.ts";

import { History } from "./History.tsx";

const SHOWN = 8;

/**
 * The questions missed most, with their answers and a practice button.
 * @param props - Statistics, whether a session is active, and the handler.
 * @returns The section, or nothing before the first mistake.
 */
function WeakSpots(
  props: Readonly<{
    stats: Readonly<Record<string, QuestionStat>>;
    disabled: boolean;
    onPractise: (ids: string[]) => void;
  }>,
): ReactElement | null {
  const { disabled, onPractise } = props;
  const spots = weakest(questions, props.stats, SHOWN);
  if (spots.length === 0) {
    return null;
  }
  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-heading">Schwachstellen · Weak spots</h2>
        <button
          type="button"
          className="btn"
          disabled={disabled}
          onClick={() => {
            onPractise(spots.map((spot) => spot.question.id));
          }}
        >
          Practise these {spots.length}
        </button>
      </div>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {spots.map(({ question, stat }) => (
          <li
            key={question.id}
            className="grid gap-x-10 gap-y-1 py-4 md:grid-cols-2"
          >
            <div className="min-w-0">
              <p className="folio-mark">{label(question)}</p>
              <p
                lang="de"
                className="mt-0.5"
              >
                {question.de.q}
              </p>
              <p
                lang="de"
                className="mt-1 font-semibold text-accent"
              >
                {correctText(question, "de")}
              </p>
            </div>
            <div className="min-w-0 text-muted md:pt-5">
              <p lang="en">{question.en.q}</p>
              <p
                lang="en"
                className="mt-1"
              >
                {correctText(question, "en")}
              </p>
              <p className="mt-1 text-sm">
                <History stat={stat} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { WeakSpots };
