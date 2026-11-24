import { expect, test } from "vite-plus/test";

import { fromBackup, toBackup } from "./backup.ts";
import {
  EMPTY_PROGRESS,
  ValidationError,
  finishSession,
  recordAnswer,
  startSession,
} from "./progress.ts";
import type { Backup, Progress } from "./schemas.ts";
import { rightOf, wrongOf } from "./testing.ts";

const AT = new Date(Date.UTC(2026, 9, 31, 10, 0, 0));

/**
 * Progress with one finished practice session and one right answer.
 * @returns The document.
 */
function sample(): Progress {
  const started = startSession(
    EMPTY_PROGRESS,
    { mode: "practice", focus: "smart", questionCount: 1 },
    AT,
  );
  const sessionId = started.result;
  const { progress } = recordAnswer(started.progress, {
    sessionId,
    input: {
      questionId: "G001",
      position: 0,
      chosen: rightOf("G001"),
      timeMs: 1,
    },
    now: AT,
  });
  return finishSession(progress, { sessionId, now: AT }).progress;
}

/**
 * A backup of the sample whose answers were edited.
 * @param edit - Changes every answer in place.
 * @returns The edited backup.
 */
function edited(edit: (answer: Progress["answers"][number]) => void): Backup {
  const backup = structuredClone(toBackup(sample()));
  for (const answer of backup.progress.answers) {
    edit(answer);
  }
  return backup;
}

test("round-trips a backup through JSON", () => {
  const original = sample();
  const backup = toBackup(original, AT);
  expect(backup).toMatchObject({
    app: "fuehrerscheintest",
    exportedAt: AT.toISOString(),
  });
  expect(fromBackup(structuredClone(backup))).toStrictEqual(original);
});

test("judges imported answers again instead of trusting the file", () => {
  const tampered = edited((answer) => {
    answer.chosen = wrongOf("G001");
    answer.correct = true;
  });
  expect(fromBackup(tampered).answers[0]?.correct).toBe(false);
});

test.each([
  { name: "another app's file", value: { app: "other" } },
  { name: "a file that is not an object", value: "progress" },
  {
    name: "an answer without its session",
    value: toBackup({ ...sample(), sessions: [] }),
  },
  {
    name: "an unknown question",
    value: edited((answer) => {
      answer.questionId = "G999";
    }),
  },
])("rejects $name", ({ value }) => {
  expect(() => fromBackup(value)).toThrow(ValidationError);
});
