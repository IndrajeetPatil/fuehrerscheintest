import type { ReactElement } from "react";

import type { OptionState } from "#lib/optionState.ts";

import { OptionKey } from "./OptionKey.tsx";

const ROW_TONE: Readonly<Record<OptionState, string>> = {
  idle: "hover:bg-bg-alt",
  chosen: "bg-accent/[0.07]",
  correct: "bg-accent/[0.08]",
  missed: "bg-accent/[0.04]",
  wrong: "bg-rust/[0.07]",
  dim: "",
};

const SCREEN_READER_NOTE: Readonly<Partial<Record<OptionState, string>>> = {
  correct: " (richtig angekreuzt / correctly ticked)",
  missed: " (richtig, nicht angekreuzt / correct, not ticked)",
  wrong: " (falsch angekreuzt / ticked, but wrong)",
};

interface Props {
  option: number;
  keyLabel: string;
  german: string;
  english: string;
  state: OptionState;
  checked: boolean;
  showEnglish: boolean;
  onChoose: ((option: number) => void) | undefined;
}

/**
 * One answer option: German and English side by side in a single checkbox
 * row.
 * @param props - Option text, state and handlers.
 * @returns The labelled checkbox row.
 */
function OptionRow(props: Readonly<Props>): ReactElement {
  const { option, state, showEnglish, onChoose } = props;
  const columns = showEnglish
    ? "md:grid-cols-[2.25rem_1fr_1fr] md:gap-x-10"
    : "";
  return (
    <label
      className={`relative grid cursor-pointer grid-cols-[2.25rem_1fr] items-start gap-x-3 px-4 py-3.5 transition-colors has-[:disabled]:cursor-default ${columns} ${ROW_TONE[state]}`}
    >
      <input
        type="checkbox"
        value={option}
        checked={props.checked}
        disabled={onChoose === undefined}
        onChange={() => {
          onChoose?.(option);
        }}
        className="peer sr-only"
      />
      <OptionKey
        state={state}
        keyLabel={props.keyLabel}
      />
      <span
        lang="de"
        className="min-w-0 font-medium"
      >
        {props.german}
        <span className="sr-only">{SCREEN_READER_NOTE[state] ?? ""}</span>
      </span>
      {showEnglish ? (
        <span
          lang="en"
          className="col-start-2 min-w-0 text-[0.95rem] text-muted md:col-start-3 md:border-l md:border-line md:pl-10"
        >
          {props.english}
        </span>
      ) : null}
    </label>
  );
}

export { OptionRow };
