// Runtime schemas for every value that crosses a trust boundary: the bundled
// catalogue, progress-store inputs, IndexedDB records, backup files and
// localStorage. Types are inferred from them, so validation and typing cannot
// drift apart.
import { z as zod } from "zod/mini";

/** Options are keyed A to D. */
const OPTION_COUNT = 4;
const LAST_OPTION = OPTION_COUNT - 1;
const MIN_OPTIONS = 2;
/** Error points a question can cost. */
const MIN_POINTS = 2;
const MAX_POINTS = 5;
const text = zod.string();
const nullableText = zod.nullable(text);
const atLeastZero = zod.minimum(0);
const atLeastOne = zod.minimum(1);
const count = zod.int().check(atLeastZero);
const duration = zod.number().check(atLeastZero);

const optionIndexSchema = zod
  .int()
  .check(atLeastZero, zod.maximum(LAST_OPTION));

/**
 * Chosen options as catalogue indices, each at most once and in ascending
 * order; empty when nothing is chosen.
 */
const choiceSchema = zod.array(optionIndexSchema).check(
  zod.maxLength(OPTION_COUNT),
  zod.refine(
    (indices) =>
      indices.every(
        (value, at) => at === 0 || value > (indices[at - 1] ?? value),
      ),
    "options must be listed once, in ascending order",
  ),
);
type Choice = zod.infer<typeof choiceSchema>;

const sectionSchema = zod.enum(["G", "B"]);
type Section = zod.infer<typeof sectionSchema>;

const localisedQuestionSchema = zod.object({
  q: text,
  o: zod
    .array(text)
    .check(zod.minLength(MIN_OPTIONS), zod.maxLength(OPTION_COUNT)),
  why: text,
});

const questionSchema = zod.object({
  id: text,
  section: sectionSchema,
  topic: text,
  points: zod.int().check(zod.minimum(MIN_POINTS), zod.maximum(MAX_POINTS)),
  de: localisedQuestionSchema,
  en: localisedQuestionSchema,
  correct: choiceSchema.check(zod.minLength(1)),
  sign: zod.nullable(
    zod.object({ code: text, number: text, de: text, en: text }),
  ),
  law: zod.nullable(zod.object({ ref: text, url: text })),
  keepOrder: zod.boolean(),
});
type Question = zod.infer<typeof questionSchema>;

const catalogueSchema = zod.object({
  topics: zod.array(zod.object({ code: text, de: text, en: text })),
  questions: zod.array(questionSchema),
});
type Catalogue = zod.infer<typeof catalogueSchema>;

const modeSchema = zod.enum(["exam", "practice"]);
type Mode = zod.infer<typeof modeSchema>;

const focusSchema = zod.enum([
  "smart",
  "new",
  "mistakes",
  "heavy",
  "all",
  "selected",
]);
type Focus = zod.infer<typeof focusSchema>;

const isoDateSchema = zod.iso.date();

const settingsSchema = zod.object({
  examDate: zod.nullable(isoDateSchema),
  showEnglish: zod.boolean(),
  shuffleOptions: zod.boolean(),
});
type Settings = zod.infer<typeof settingsSchema>;

const settingsPatchSchema = zod.partial(settingsSchema);
type SettingsPatch = zod.infer<typeof settingsPatchSchema>;

/** A session as stored; open sessions have no `finishedAt` yet. */
const storedSessionSchema = zod.object({
  id: zod.int(),
  mode: modeSchema,
  focus: zod.nullable(focusSchema),
  questionCount: zod.int(),
  startedAt: zod.string(),
  finishedAt: nullableText,
  durationMs: zod.nullable(zod.int()),
});
type StoredSession = zod.infer<typeof storedSessionSchema>;

/** A finished session with its score. */
const sessionSummarySchema = zod.extend(storedSessionSchema, {
  finishedAt: text,
  /** First attempts only; retries inside a practice session do not count. */
  answered: zod.int(),
  correct: zod.int(),
  /** Points of the wrongly answered (or, in an exam, blank) questions. */
  errorPoints: zod.int(),
  /** Points of every question asked: the most that could be lost. */
  maxPoints: zod.int(),
  /** Wrongly answered 5-point questions; two of them fail an exam. */
  fivePointMisses: zod.int(),
});
type SessionSummary = zod.infer<typeof sessionSummarySchema>;

const questionStatSchema = zod.object({
  attempts: zod.int(),
  correct: zod.int(),
  lastAt: zod.string(),
  /** Most recent results first: `1` = correct, `0` = wrong (at most 5). */
  recent: zod.string().check(zod.regex(/^[01]*$/u)),
});
type QuestionStat = zod.infer<typeof questionStatSchema>;

const summarySchema = zod.object({
  settings: settingsSchema,
  sessions: zod.array(sessionSummarySchema),
  stats: zod.record(zod.string(), questionStatSchema),
});
type Summary = zod.infer<typeof summarySchema>;

const answerInputSchema = zod.object({
  questionId: zod.string(),
  position: count,
  /** Catalogue option indices; empty when an exam question was left blank. */
  chosen: choiceSchema,
  timeMs: zod.nullable(duration),
  retry: zod.optional(zod.boolean()),
});
type AnswerInput = zod.infer<typeof answerInputSchema>;

const startSessionInputSchema = zod.object({
  mode: modeSchema,
  focus: zod.nullable(focusSchema),
  questionCount: zod.int().check(atLeastOne),
});
type StartSessionInput = zod.infer<typeof startSessionInputSchema>;

const finishInputSchema = zod.object({
  answers: zod.optional(zod.array(answerInputSchema)),
  durationMs: zod.optional(duration),
});

/** One answer as stored, judged against the answer key when saved. */
const storedAnswerSchema = zod.object({
  id: zod.int(),
  sessionId: zod.int(),
  questionId: zod.string(),
  position: count,
  chosen: choiceSchema,
  correct: zod.boolean(),
  retry: zod.boolean(),
  timeMs: zod.nullable(zod.int()),
  answeredAt: zod.string(),
});
type StoredAnswer = zod.infer<typeof storedAnswerSchema>;

/** Everything the browser keeps about your progress, as one document. */
const progressSchema = zod.object({
  version: zod.literal(1),
  settings: settingsPatchSchema,
  sessions: zod.array(storedSessionSchema),
  answers: zod.array(storedAnswerSchema),
  /**
   * The next session id. Ids are never reused, even after a reset or import,
   * so a session still open in another tab cannot write into a newer one.
   */
  nextSessionId: zod.optional(zod.int().check(atLeastOne)),
});
type Progress = zod.infer<typeof progressSchema>;

/** An exported backup file. */
const backupSchema = zod.object({
  app: zod.literal("fuehrerscheintest"),
  exportedAt: zod.string(),
  progress: progressSchema,
});
type Backup = zod.infer<typeof backupSchema>;

const itemSchema = zod.object({
  qid: zod.string(),
  /** Catalogue option indices in display order. */
  order: zod.array(optionIndexSchema),
  /** Catalogue indices of the ticked options. */
  chosen: choiceSchema,
  flagged: zod.boolean(),
  /** Practice: the answer has been checked and feedback shown. */
  checked: zod.boolean(),
  /** Practice: a second chance at a question missed earlier. */
  retry: zod.boolean(),
  timeMs: zod.number(),
});
type Item = zod.infer<typeof itemSchema>;

const activeSessionSchema = zod.object({
  id: zod.int(),
  mode: modeSchema,
  focus: zod.nullable(focusSchema),
  startedAt: zod.number(),
  /** Exam: wall-clock deadline (ms), so reloading does not reset the timer. */
  deadline: zod.nullable(zod.number()),
  items: zod.array(itemSchema),
  index: zod.int(),
  /** When the current question was shown (ms); used to time answers. */
  shownAt: zod.number(),
});
type ActiveSession = zod.infer<typeof activeSessionSchema>;

const themeSchema = zod.enum(["light", "dark"]);
type Theme = zod.infer<typeof themeSchema>;

export {
  catalogueSchema,
  isoDateSchema,
  settingsPatchSchema,
  answerInputSchema,
  startSessionInputSchema,
  finishInputSchema,
  progressSchema,
  backupSchema,
  activeSessionSchema,
  themeSchema,
};
export type {
  Choice,
  Section,
  Question,
  Catalogue,
  Mode,
  Focus,
  Settings,
  SettingsPatch,
  SessionSummary,
  QuestionStat,
  Summary,
  AnswerInput,
  StartSessionInput,
  StoredSession,
  StoredAnswer,
  Progress,
  Backup,
  Item,
  ActiveSession,
  Theme,
};
