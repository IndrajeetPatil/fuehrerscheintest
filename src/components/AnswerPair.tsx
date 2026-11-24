import type { ReactElement } from "react";

function germanClass(struck: boolean): string {
  return struck ? "line-through decoration-rust/50" : "font-semibold";
}

/**
 * One option in German and English, as used in feedback.
 * @param props - Texts, language toggle and whether to strike it through.
 * @returns The pair.
 */
function AnswerPair(
  props: Readonly<{
    german: string;
    english: string;
    showEnglish: boolean;
    struck?: boolean;
  }>,
): ReactElement {
  const { showEnglish } = props;
  return (
    <div
      className={`mt-1 grid gap-x-10 gap-y-1 ${showEnglish ? "md:grid-cols-2" : ""}`}
    >
      <p
        lang="de"
        className={germanClass(props.struck === true)}
      >
        {props.german}
      </p>
      {showEnglish ? (
        <p
          lang="en"
          className="text-muted"
        >
          {props.english}
        </p>
      ) : null}
    </div>
  );
}

export { AnswerPair };
