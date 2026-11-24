import { describe, expect, test } from "vite-plus/test";

import { questions } from "./catalogue.ts";
import { focusChoice, focusCounts } from "./practiceFoci.ts";
import { TOP_POINTS } from "./quiz.ts";
import { statOf } from "./testing.ts";

describe(focusCounts, () => {
  test("counts the questions available to each focus", () => {
    const stats = { G001: statOf("0"), G002: statOf("1"), G003: statOf("11") };
    expect(focusCounts(questions, stats)).toStrictEqual({
      smart: questions.length,
      new: questions.length - 3,
      mistakes: 2,
      heavy: questions.filter((entry) => entry.points === TOP_POINTS).length,
      all: questions.length,
    });
  });
});

describe(focusChoice, () => {
  test("finds a focus with its sizing", () => {
    expect([
      focusChoice("all").sized,
      focusChoice("heavy").sized,
    ]).toStrictEqual([false, true]);
  });
});
