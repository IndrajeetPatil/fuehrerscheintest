import { describe, expect, test } from "vite-plus/test";

import {
  catalogue,
  correctText,
  isRight,
  label,
  optionText,
  question,
  questions,
  toggleOption,
  topicName,
} from "./catalogue.ts";
import { EXAM } from "./quiz.ts";

const first = question("G001");

describe("bundled question catalogue", () => {
  test("has enough questions in each section for several mock exams", () => {
    const basic = questions.filter((entry) => entry.section === "G");
    const classB = questions.filter((entry) => entry.section === "B");
    expect(basic.length).toBeGreaterThanOrEqual(EXAM.basic * 2);
    expect(classB.length).toBeGreaterThanOrEqual(EXAM.classB * 2);
  });

  test("gives every question at least one wrong option and a known topic", () => {
    const topics = new Set(catalogue.topics.map((topic) => topic.code));
    for (const entry of questions) {
      expect(entry.correct.length).toBeLessThan(entry.de.o.length);
      expect(entry.en.o).toHaveLength(entry.de.o.length);
      expect(topics.has(entry.topic)).toBe(true);
    }
  });
});

describe(question, () => {
  test("finds a question by id and rejects unknown ids", () => {
    expect(question("G001")).toBe(first);
    expect(() => question("nope")).toThrow(/unknown question/u);
  });
});

describe(label, () => {
  test("names the question and its points", () => {
    expect(label(first)).toBe("G001 · 5 Punkte");
  });
});

describe(topicName, () => {
  test("names topics in German and English, falling back to the code", () => {
    expect([
      topicName("vorfahrt"),
      topicName("vorfahrt", "en"),
      topicName("wetter"),
    ]).toStrictEqual(["Vorfahrt und Vorrang", "Right of way", "wetter"]);
  });
});

describe(optionText, () => {
  test("returns option text and an empty string out of range", () => {
    expect(optionText(first, 0, "de")).toBe("Vorfahrt gewähren");
    expect(optionText(first, 9, "en")).toBe("");
  });
});

describe(correctText, () => {
  test("joins every correct option", () => {
    expect(correctText(first, "en")).toBe(
      "Give way · Stop if necessary, when I would otherwise endanger or significantly hinder traffic with priority",
    );
  });
});

describe(isRight, () => {
  test("credits only exactly the correct options", () => {
    expect(isRight(first, [0, 2])).toBe(true);
    expect(isRight(first, [0])).toBe(false);
    expect(isRight(first, [0, 1, 2])).toBe(false);
    expect(isRight(first, [])).toBe(false);
  });
});

describe(toggleOption, () => {
  test("ticks in ascending order and unticks", () => {
    expect(toggleOption([2], 0)).toStrictEqual([0, 2]);
    expect(toggleOption([0, 2], 2)).toStrictEqual([0]);
  });
});
