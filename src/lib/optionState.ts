// Display state of an answer option.
type OptionState = "idle" | "chosen" | "correct" | "missed" | "wrong" | "dim";

// Revealed states by [is correct][was ticked].
const REVEALED: Readonly<
  Record<"answer" | "other", Readonly<Record<"ticked" | "blank", OptionState>>>
> = {
  answer: { ticked: "correct", blank: "missed" },
  other: { ticked: "wrong", blank: "dim" },
};

/**
 * How an option looks, from whether answers are revealed, whether it was
 * ticked and whether it is correct.
 * @param revealed - Whether the correct answer is shown.
 * @param isChosen - Whether this option was ticked.
 * @param isAnswer - Whether this option is correct.
 * @returns The option's display state.
 */
function optionState(
  revealed: boolean,
  isChosen: boolean,
  isAnswer: boolean,
): OptionState {
  if (!revealed) {
    return isChosen ? "chosen" : "idle";
  }
  return REVEALED[isAnswer ? "answer" : "other"][isChosen ? "ticked" : "blank"];
}

export { optionState };
export type { OptionState };
