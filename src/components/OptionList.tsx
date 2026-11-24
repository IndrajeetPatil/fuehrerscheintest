import type { ReactElement } from "react";

import { Icon } from "./Icon.tsx";

/**
 * A question's options with the correct ones marked.
 * @param props - Options, correct indices, language and emphasis tone.
 * @returns The list.
 */
function OptionList(
  props: Readonly<{
    options: readonly string[];
    correct: readonly number[];
    lang: "de" | "en";
    answerTone: string;
  }>,
): ReactElement {
  const { options, correct, lang, answerTone } = props;
  return (
    <ol className="mt-2 space-y-1">
      {options.map((option, index) => {
        const right = correct.includes(index);
        return (
          <li
            key={option}
            lang={lang}
            className={`flex items-start gap-2 ${right ? `font-semibold ${answerTone}` : ""}`}
          >
            <span className="mt-1.5 w-4">
              {right ? (
                <Icon
                  name="check"
                  size="md"
                />
              ) : null}
            </span>
            {option}
            {right ? (
              <span className="sr-only"> (richtig / correct)</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export { OptionList };
