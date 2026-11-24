import { describe, expect, test } from "vite-plus/test";

import { questions } from "./catalogue.ts";
import {
  EXAM,
  accuracy,
  drawExam,
  optionOrder,
  passed,
  practiceQuestions,
  scoredOutOf,
  shuffle,
  weightedSample,
} from "./quiz.ts";
import { required, seeded, sessionOf, statOf } from "./testing.ts";

const SAMPLE_RUNS = 8000;
const numeric = required(questions.find((entry) => entry.keepOrder));
const text = required(
  questions.find((entry) => !entry.keepOrder && entry.de.o.length === 4),
);
const base = { questions, size: 10, rng: seeded(1) } as const;

function positionCounts(): number[] {
  const counts = [0, 0, 0, 0];
  const rng = seeded(7);
  for (let run = 0; run < SAMPLE_RUNS; run += 1) {
    const position = shuffle([0, 1, 2, 3], rng).indexOf(0);
    counts[position] = required(counts[position]) + 1;
  }
  return counts;
}

function ids(picked: readonly { id: string }[]): string[] {
  return picked.map((entry) => entry.id);
}

describe("option order", () => {
  test("only keeps numeric options in fixed order unless marked", () => {
    const numbers = questions.filter((entry) =>
      entry.de.o.every((option) => /^\d/u.test(option)),
    );
    expect(numbers.every((entry) => entry.keepOrder)).toBe(true);
  });
});

describe(shuffle, () => {
  test("returns a permutation and leaves its input untouched", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const shuffled = shuffle(input, seeded(3));
    expect(shuffled.toSorted((left, right) => left - right)).toStrictEqual(
      input,
    );
    expect(input).toStrictEqual([1, 2, 3, 4, 5, 6]);
  });

  test("puts an item in each position about equally often", () => {
    expect(Math.min(...positionCounts())).toBeGreaterThan(1800);
  });
});

describe(weightedSample, () => {
  test("never picks more than asked or repeats an item", () => {
    const picked = weightedSample({
      items: [1, 2, 3, 4, 5],
      weight: () => 1,
      count: 3,
      rng: seeded(5),
    });
    expect(new Set(picked).size).toBe(3);
  });
});

describe(drawExam, () => {
  test("draws 20 distinct Grundstoff questions, then 10 for class B", () => {
    const exam = drawExam(questions, seeded(11));
    expect(new Set(ids(exam)).size).toBe(EXAM.total);
    expect(
      exam.slice(0, EXAM.basic).every((entry) => entry.section === "G"),
    ).toBe(true);
    expect(exam.slice(EXAM.basic).every((entry) => entry.section === "B")).toBe(
      true,
    );
  });

  test("differs between draws", () => {
    const first = drawExam(questions, seeded(1));
    const second = drawExam(questions, seeded(2));
    expect(ids(first)).not.toStrictEqual(ids(second));
  });
});

describe(optionOrder, () => {
  test("keeps numeric options in place", () => {
    expect(optionOrder(numeric, true, seeded(5))).toStrictEqual([0, 1, 2]);
  });

  test("shuffles text options only when asked", () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_unused, run) =>
        optionOrder(text, true, seeded(run + 1)).join(""),
      ),
    );
    expect(orders.size).toBeGreaterThan(5);
    expect(optionOrder(text, false)).toStrictEqual([0, 1, 2, 3]);
  });
});

describe(practiceQuestions, () => {
  test("picks only unseen questions for the new focus", () => {
    const stats = { G001: statOf("1"), G002: statOf("0") };
    const picked = practiceQuestions({
      ...base,
      focus: "new",
      stats,
      size: 400,
    });
    expect(picked).toHaveLength(questions.length - 2);
    expect(ids(picked)).not.toStrictEqual(expect.arrayContaining(["G001"]));
  });

  test("picks only shaky or missed questions for the mistakes focus", () => {
    const stats = { G001: statOf("1"), G002: statOf("0"), G003: statOf("11") };
    const picked = practiceQuestions({ ...base, focus: "mistakes", stats });
    expect(ids(picked).toSorted()).toStrictEqual(["G001", "G002"]);
  });

  test("covers the whole catalogue for the all focus", () => {
    const picked = practiceQuestions({ ...base, focus: "all", stats: {} });
    expect(picked).toHaveLength(questions.length);
  });

  test("picks only 5-point questions for the heavy focus", () => {
    const picked = practiceQuestions({ ...base, focus: "heavy", stats: {} });
    expect(picked).toHaveLength(10);
    expect(picked.every((entry) => entry.points === 5)).toBe(true);
  });

  test("picks exactly the selected questions", () => {
    const picked = practiceQuestions({
      ...base,
      focus: "selected",
      stats: {},
      selected: ["G005", "B002"],
    });
    expect(ids(picked).toSorted()).toStrictEqual(["B002", "G005"]);
  });

  test("caps review questions at half a smart mix", () => {
    const stats = Object.fromEntries(
      questions.slice(0, 40).map((entry) => [entry.id, statOf("0")]),
    );
    const picked = practiceQuestions({
      ...base,
      focus: "smart",
      stats,
      size: 20,
    });
    expect(new Set(ids(picked)).size).toBe(20);
    expect(picked.filter((entry) => entry.id in stats)).toHaveLength(10);
  });

  test("always includes a few missed questions in a smart mix", () => {
    const stats = { G010: statOf("0"), G020: statOf("0"), G030: statOf("0") };
    const picked = practiceQuestions({
      ...base,
      focus: "smart",
      stats,
      size: 20,
    });
    expect(ids(picked)).toStrictEqual(
      expect.arrayContaining(["G010", "G020", "G030"]),
    );
  });
});

describe(accuracy, () => {
  test.each([
    {
      session: sessionOf({ errorPoints: 11, maxPoints: 110 }),
      expected: 0.9,
    },
    { session: sessionOf({ maxPoints: 0 }), expected: 0 },
    {
      session: sessionOf({ mode: "practice", correct: 10, answered: 20 }),
      expected: 0.5,
    },
    {
      session: sessionOf({ mode: "practice", correct: 0, answered: 0 }),
      expected: 0,
    },
  ])("is $expected for $session.mode", ({ session, expected }) => {
    expect(accuracy(session)).toBeCloseTo(expected);
  });
});

describe(scoredOutOf, () => {
  test("counts exams out of every question, practice out of answered", () => {
    expect([
      scoredOutOf(sessionOf({ correct: 11, answered: 20 })),
      scoredOutOf(sessionOf({ mode: "practice", correct: 10, answered: 20 })),
    ]).toStrictEqual([EXAM.total, 20]);
  });
});

describe(passed, () => {
  test.each([
    { errorPoints: 10, fivePointMisses: 1, expected: true },
    { errorPoints: 11, fivePointMisses: 0, expected: false },
    { errorPoints: 10, fivePointMisses: 2, expected: false },
  ])(
    "is $expected with $errorPoints error points and $fivePointMisses missed 5-pointers",
    ({ expected, ...result }) => {
      expect(passed(result)).toBe(expected);
    },
  );
});
