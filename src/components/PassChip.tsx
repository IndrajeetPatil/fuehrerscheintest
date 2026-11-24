import type { ReactElement } from "react";

import { passed } from "#lib/quiz.ts";
import type { Verdict } from "#lib/quiz.ts";

import { Icon } from "./Icon.tsx";

/**
 * Passed or not passed, with an icon.
 * @param props - Error points and missed 5-point questions of a mock exam.
 * @returns The chip.
 */
function PassChip(props: Readonly<{ result: Verdict }>): ReactElement {
  const ok = passed(props.result);
  return (
    <span className={`chip ${ok ? "chip-accent" : "chip-rust"}`}>
      <Icon
        name={ok ? "check" : "cross"}
        size="sm"
      />
      {ok ? "Bestanden · Passed" : "Nicht bestanden · Not passed"}
    </span>
  );
}

export { PassChip };
