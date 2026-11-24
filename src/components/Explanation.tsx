import type { ReactElement } from "react";

import type { Question } from "#lib/schemas.ts";

import { ExternalLink } from "./ExternalLink.tsx";

/**
 * Why the correct answer is right, in English and German, with a link to the
 * law it follows from.
 * @param props - The question.
 * @returns The explanation block.
 */
function Explanation(props: Readonly<{ question: Question }>): ReactElement {
  const { question } = props;
  return (
    <div className="mt-4 max-w-prose space-y-2 text-[0.95rem]">
      <p className="folio-mark">Warum · Why</p>
      <p lang="en">{question.en.why}</p>
      <p
        lang="de"
        className="text-muted"
      >
        {question.de.why}
      </p>
      {question.law === null ? null : (
        <p className="text-sm text-muted">
          Rechtsgrundlage · Legal basis:{" "}
          <ExternalLink href={question.law.url}>
            {question.law.ref}
          </ExternalLink>
        </p>
      )}
    </div>
  );
}

export { Explanation };
