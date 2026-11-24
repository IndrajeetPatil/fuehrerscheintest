// Fixtures shared by the unit tests.
import { question } from "./catalogue.ts";
import type { Choice, QuestionStat, SessionSummary } from "./schemas.ts";

const MODULUS = 2_147_483_647;
const MULTIPLIER = 16_807;

/**
 * Deterministic Park–Miller generator, so random tests are reproducible.
 * @param seed - Positive integer seed.
 * @returns A generator of numbers in [0, 1).
 */
function seeded(seed: number): () => number {
  let state = seed % MODULUS || 1;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
}

/**
 * Returns a value that the test setup guarantees, failing loudly otherwise.
 * @param value - Possibly undefined value.
 * @returns The value.
 */
function required<Value>(value: Value | null | undefined): Value {
  if (value === undefined || value === null) {
    throw new Error("expected a value in the test fixture");
  }
  return value;
}

/**
 * Statistics with the given recent results, newest first.
 * @param recent - For example `"10"`: right last time, wrong before.
 * @param lastAt - Time of the latest answer.
 * @returns The statistics.
 */
function statOf(
  recent: string,
  lastAt = "2026-10-30T10:00:00.000Z",
): QuestionStat {
  return {
    attempts: recent.length,
    correct: recent.split("").filter((result) => result === "1").length,
    lastAt,
    recent,
  };
}

/**
 * A finished session for figure tests.
 * @param overrides - Fields to change.
 * @returns The session summary.
 */
function sessionOf(overrides: Partial<SessionSummary>): SessionSummary {
  return {
    id: 1,
    mode: "exam",
    focus: null,
    questionCount: 30,
    startedAt: "2026-10-30T18:00:00.000Z",
    finishedAt: "2026-10-30T18:25:00.000Z",
    durationMs: 1_500_000,
    answered: 30,
    correct: 27,
    errorPoints: 8,
    maxPoints: 115,
    fivePointMisses: 1,
    ...overrides,
  };
}

/**
 * The right answer to a question: exactly its correct options.
 * @param id - Catalogue id.
 * @returns The correct choice.
 */
function rightOf(id: string): Choice {
  return [...question(id).correct];
}

/**
 * A wrong answer to a question: its first incorrect option alone.
 * @param id - Catalogue id.
 * @returns A choice that misses the answer.
 */
function wrongOf(id: string): Choice {
  const entry = question(id);
  const wrong = entry.de.o.findIndex(
    (_option, index) => !entry.correct.includes(index),
  );
  return [wrong];
}

export { required, rightOf, seeded, sessionOf, statOf, wrongOf };
