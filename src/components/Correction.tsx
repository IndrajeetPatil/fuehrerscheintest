import type { ReactElement } from "react";

import { optionText } from "#lib/catalogue.ts";
import type { Choice, Question } from "#lib/schemas.ts";

import { AnswerPair } from "./AnswerPair.tsx";

function correctCaption(count: number): string {
  return count > 1
    ? "Richtige Antworten · Correct answers"
    : "Richtige Antwort · Correct answer";
}

/**
 * Every correct option and, if any were ticked, the ticked ones, in both
 * languages; ticked options that are wrong are struck through.
 * @param props - Question, ticked options and language toggle.
 * @returns The answer groups.
 */
function Correction(
  props: Readonly<{
    question: Question;
    chosen: Choice;
    showEnglish: boolean;
  }>,
): ReactElement {
  const { question, chosen, showEnglish } = props;
  return (
    <>
      <div className="mt-3">
        <p className="folio-mark">{correctCaption(question.correct.length)}</p>
        {question.correct.map((option) => (
          <AnswerPair
            key={option}
            german={optionText(question, option, "de")}
            english={optionText(question, option, "en")}
            showEnglish={showEnglish}
          />
        ))}
      </div>
      {chosen.length === 0 ? null : (
        <div className="mt-3">
          <p className="folio-mark">Ihre Auswahl · Your selection</p>
          {chosen.map((option) => (
            <AnswerPair
              key={option}
              german={optionText(question, option, "de")}
              english={optionText(question, option, "en")}
              showEnglish={showEnglish}
              struck={!question.correct.includes(option)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export { Correction };
