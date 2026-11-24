import type { ReactElement } from "react";

import type { Question } from "#lib/schemas.ts";

import { QuestionPicture } from "./QuestionPicture.tsx";

/**
 * The traffic sign a question shows, on a white mat.
 * @param props - The question.
 * @returns The figure, or nothing for questions without a sign.
 */
function QuestionImage(
  props: Readonly<{ question: Question }>,
): ReactElement | null {
  const { sign } = props.question;
  if (sign === null) {
    return null;
  }
  return (
    <figure className="mt-6">
      {/* The white mat stays white in dark mode: signs are drawn on white. */}
      <div className="inline-block rounded-md border border-line bg-white p-4">
        <QuestionPicture
          sign={sign}
          size="full"
        />
      </div>
    </figure>
  );
}

export { QuestionImage };
