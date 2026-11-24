import type { ReactElement } from "react";

import { isRight } from "#lib/catalogue.ts";
import type { Choice, Question, QuestionStat } from "#lib/schemas.ts";

import { Correction } from "./Correction.tsx";
import { Explanation } from "./Explanation.tsx";
import { FeedbackRecord } from "./FeedbackRecord.tsx";
import { Verdict } from "./Verdict.tsx";

interface Props {
  question: Question;
  chosen: Choice;
  stat?: QuestionStat | undefined;
  /** Practice: the question was queued again later in this session. */
  comesBack?: boolean;
  showEnglish: boolean;
}

/**
 * What to learn from an answer: the correct options in both languages, why,
 * and your record.
 * @param props - Question, ticked options, record and language toggle.
 * @returns The feedback panel.
 */
function Feedback(props: Readonly<Props>): ReactElement {
  const { question, chosen, stat, comesBack = false, showEnglish } = props;
  const correct = isRight(question, chosen);
  return (
    <section
      aria-live="polite"
      className={`mt-6 rounded-md border border-line px-5 py-4 ${correct ? "bg-accent/[0.05]" : "bg-rust/[0.05]"}`}
    >
      <Verdict
        correct={correct}
        answered={chosen.length > 0}
        points={question.points}
      />
      {correct ? null : (
        <Correction
          question={question}
          chosen={chosen}
          showEnglish={showEnglish}
        />
      )}
      <Explanation question={question} />
      <FeedbackRecord
        stat={stat}
        comesBack={comesBack}
      />
    </section>
  );
}

export { Feedback };
