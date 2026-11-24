import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { questions } from "./catalogue.ts";
import type { Question } from "./schemas.ts";
import {
  RETRY_GAP,
  check,
  choose,
  createSession,
  endSession,
  goTo,
  load,
  nextStep,
  save,
  toAnswer,
  toggleFlag,
} from "./session.ts";
import { required, rightOf, seeded, wrongOf } from "./testing.ts";

const FIRST_TEN = questions.slice(0, 10);

function first(): Question {
  return required(questions.at(0));
}

function practice(
  entries: readonly Question[],
): ReturnType<typeof createSession> {
  return createSession({
    id: 1,
    mode: "practice",
    focus: "smart",
    questions: entries,
    shuffleOptions: true,
    now: 0,
    rng: seeded(1),
  });
}

const wrongOption = (entry: Question): number => wrongOf(entry.id)[0] ?? 0;

describe(check, () => {
  test("queues a first-time miss a few questions later with fresh options", () => {
    const entry = first();
    const checked = check(choose(practice(FIRST_TEN), wrongOption(entry)), {
      question: entry,
      shuffleOptions: true,
      now: 1000,
      rng: seeded(2),
    });
    expect(checked.items).toHaveLength(11);
    expect(checked.items[1 + RETRY_GAP]).toMatchObject({
      qid: entry.id,
      retry: true,
      chosen: [],
    });
    expect(checked.items[0]?.timeMs).toBe(1000);
  });

  test("does not queue a missed second try again", () => {
    const entry = first();
    const options = { question: entry, shuffleOptions: true, now: 1000 };
    const once = check(
      choose(practice(FIRST_TEN), wrongOption(entry)),
      options,
    );
    const again = check(
      choose(goTo(once, 1 + RETRY_GAP, 2000), wrongOption(entry)),
      options,
    );
    expect(again.items).toHaveLength(11);
  });

  test("ignores checking without a chosen option", () => {
    const session = practice([first()]);
    expect(check(session, { question: first(), shuffleOptions: true })).toBe(
      session,
    );
  });

  test("locks a checked answer", () => {
    const entry = first();
    let session = practice([entry]);
    for (const option of rightOf(entry.id)) {
      session = choose(session, option);
    }
    const checked = check(session, {
      question: entry,
      shuffleOptions: false,
      now: 10,
    });
    expect(checked.items).toHaveLength(1);
    expect(choose(checked, wrongOption(entry)).items[0]?.chosen).toStrictEqual(
      rightOf(entry.id),
    );
  });
});

describe(createSession, () => {
  test("gives mock exams a 45-minute deadline", () => {
    const session = createSession({
      id: 1,
      mode: "exam",
      focus: null,
      questions: questions.slice(0, 3),
      shuffleOptions: true,
      now: 1000,
    });
    expect(session.deadline).toBe(1000 + 45 * 60_000);
  });
});

describe(goTo, () => {
  test("clamps the target and adds the time spent", () => {
    const moved = goTo(practice(questions.slice(0, 3)), 99, 500);
    expect([moved.index, moved.items[0]?.timeMs, moved.shownAt]).toStrictEqual([
      2, 500, 500,
    ]);
  });
});

describe(toggleFlag, () => {
  test("flags and unflags the current question", () => {
    const session = practice([first()]);
    expect(toggleFlag(session).items[0]?.flagged).toBe(true);
    expect(toggleFlag(toggleFlag(session)).items[0]?.flagged).toBe(false);
  });
});

describe(toAnswer, () => {
  test("converts an item into the API shape", () => {
    const item = required(practice([first()]).items.at(0));
    expect(toAnswer(item, 3)).toStrictEqual({
      questionId: first().id,
      position: 3,
      chosen: [],
      timeMs: 0,
      retry: false,
    });
  });
});

describe("persistence", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
  });

  test("round-trips the session in progress", () => {
    const session = practice([first()]);
    save(session);
    expect(load()).toStrictEqual(session);
    save(null);
    expect(load()).toBeNull();
  });

  test("ignores malformed saved state", () => {
    store.set("fst.activeSession.v1", "{not json");
    expect(load()).toBeNull();
    store.set("fst.activeSession.v1", JSON.stringify({ id: "x" }));
    expect(load()).toBeNull();
  });
});

describe(nextStep, () => {
  test("advances, then asks to submit an exam or finishes practice", () => {
    const two = practice(questions.slice(0, 2));
    const exam = { ...goTo(two, 1), mode: "exam" } as const;
    expect([
      nextStep(two),
      nextStep(goTo(two, 1)),
      nextStep(exam),
    ]).toStrictEqual(["advance", "finish", "confirm"]);
  });
});

describe(endSession, () => {
  test("saves a practice session with answers and leaves an empty one", () => {
    const calls: string[] = [];
    const actions = {
      finish: () => calls.push("finish"),
      exit: () => calls.push("exit"),
    };
    const entry = first();
    const answered = check(choose(practice([entry]), wrongOption(entry)), {
      question: entry,
      shuffleOptions: false,
    });
    endSession(practice([entry]), actions);
    endSession(answered, actions);
    expect(calls).toStrictEqual(["exit", "finish"]);
  });
});
