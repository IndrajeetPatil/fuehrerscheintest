import { describe, expect, test } from "vite-plus/test";

import { progressFigures } from "./progressFigures.ts";
import { sessionOf } from "./testing.ts";

describe(progressFigures, () => {
  test("shows dashes before the first mock exam", () => {
    expect(progressFigures([], new Date(2026, 9, 31))).toStrictEqual({
      latest: undefined,
      averageRecent: "–",
      best: "–",
      passedOfTaken: "–",
      streak: "0",
    });
  });

  test("summarises the latest, recent, best and passed mock exams", () => {
    const results = [
      [14, 0],
      [9, 2],
      [6, 0],
      [3, 0],
    ] as const;
    const sessions = results.map(([errorPoints, fivePointMisses], index) =>
      sessionOf({
        id: index + 1,
        errorPoints,
        fivePointMisses,
        startedAt: new Date(2026, 9, 28 + index, 12).toISOString(),
      }),
    );
    const figures = progressFigures(sessions, new Date(2026, 9, 31, 20));
    expect(figures).toMatchObject({
      averageRecent: "6.0",
      best: "3",
      passedOfTaken: "2/4",
      streak: "4",
    });
    expect(figures.latest?.id).toBe(4);
  });
});
