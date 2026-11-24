"""Load the question bank (questions/*.toml) and check every entry."""

lazy import re
lazy import tomllib
lazy from dataclasses import dataclass
lazy from pathlib import Path
lazy from typing import Final

lazy from laws import LawError, law_url
lazy from signs import SIGNS

# Each file holds one section of the exam: G for Grundstoff, B for Zusatzstoff Klasse B.
SECTIONS: Final = frozendict({"G": "grundstoff.toml", "B": "klasse-b.toml"})
TOPICS: Final = frozendict({
    "gefahren": ("Gefahrenlehre", "Hazard awareness"),
    "verhalten": ("Verhalten im Straßenverkehr", "Behaviour in traffic"),
    "vorfahrt": ("Vorfahrt und Vorrang", "Right of way"),
    "zeichen": ("Verkehrszeichen", "Traffic signs"),
    "umwelt": ("Umweltschutz", "Environmental protection"),
    "technik": ("Technik", "Vehicle technology"),
    "eignung": ("Eignung und Befähigung", "Fitness and licences"),
    "betrieb": ("Betrieb der Fahrzeuge", "Operating vehicles"),
})
POINTS: Final = range(2, 6)
# The app keys options A to D.
OPTION_COUNTS: Final = range(2, 5)
KEYS: Final = frozenset({
    "id",
    "topic",
    "points",
    "sign",
    "law",
    "keep_order",
    "correct",
    "de",
    "en",
})
TEXT_KEYS: Final = frozenset({"q", "o", "why"})
NUMERIC: Final = re.compile(r"\d")

type Table = dict[str, object]


class QuestionError(ValueError):
    """The question bank is malformed."""


@dataclass(frozen=True, slots=True)
class Text:
    """A question, its options and its explanation in one language."""

    question: str
    options: tuple[str, ...]
    why: str


@dataclass(frozen=True, slots=True)
class Question:
    """One checked question."""

    qid: str
    section: str
    topic: str
    points: int
    correct: tuple[int, ...]
    de: Text
    en: Text
    sign: str | None
    law: str | None
    keep_order: bool


def text(value: object, where: str) -> str:
    """A non-empty string without stray whitespace."""
    if not isinstance(value, str) or not value or value != value.strip():
        msg = f"{where}: expected a trimmed, non-empty string"
        raise QuestionError(msg)
    return value


def table(value: object, where: str, keys: frozenset[str]) -> Table:
    """A TOML table with no keys beyond `keys`."""
    if not isinstance(value, dict):
        msg = f"{where}: expected a table"
        raise QuestionError(msg)
    entries: Table = {str(key): item for key, item in value.items()}
    unknown = sorted(set(entries) - keys)
    if unknown:
        msg = f"{where}: unknown keys {unknown}"
        raise QuestionError(msg)
    return entries


def integers(value: object, where: str) -> tuple[int, ...]:
    """A TOML array of integers."""
    if not isinstance(value, list) or not all(type(item) is int for item in value):
        msg = f"{where}: expected a list of integers"
        raise QuestionError(msg)
    return tuple(item for item in value if isinstance(item, int))


def localised(value: object, where: str) -> Text:
    """The `de` or `en` table of a question."""
    entries = table(value, where, TEXT_KEYS)
    options = entries.get("o")
    if not isinstance(options, list):
        msg = f"{where}.o: expected a list"
        raise QuestionError(msg)
    return Text(
        question=text(entries.get("q"), f"{where}.q"),
        options=tuple(text(option, f"{where}.o") for option in options),
        why=text(entries.get("why"), f"{where}.why"),
    )


def optional_text(value: object, where: str) -> str | None:
    """An optional string field."""
    return None if value is None else text(value, where)


def parse(value: object, section: str) -> Question:
    """One `[[questions]]` entry, with its types checked."""
    entries = table(value, section, KEYS)
    qid = text(entries.get("id"), f"{section} question")
    points = entries.get("points")
    keep_order = entries.get("keep_order", False)
    if type(points) is not int or not isinstance(keep_order, bool):
        msg = f"{qid}: points must be an integer and keep_order a boolean"
        raise QuestionError(msg)
    return Question(
        qid=qid,
        section=section,
        topic=text(entries.get("topic"), f"{qid}.topic"),
        points=int(points),
        correct=integers(entries.get("correct"), f"{qid}.correct"),
        de=localised(entries.get("de"), f"{qid}.de"),
        en=localised(entries.get("en"), f"{qid}.en"),
        sign=optional_text(entries.get("sign"), f"{qid}.sign"),
        law=optional_text(entries.get("law"), f"{qid}.law"),
        keep_order=keep_order,
    )


def law_problem(reference: str | None) -> str | None:
    """Why a legal reference cannot be linked, if it cannot."""
    try:
        if reference is not None:
            law_url(reference)
    except LawError as error:
        return str(error)
    return None


def label_problems(question: Question) -> list[str]:
    """Id, topic, points, sign and law must be known values."""
    checks = (
        (
            re.fullmatch(rf"{question.section}\d{{3}}", question.qid) is None,
            f"id must be {question.section} and three digits",
        ),
        (question.topic not in TOPICS, f"unknown topic {question.topic!r}"),
        (question.points not in POINTS, "points must be 2 to 5"),
        (
            question.sign is not None and question.sign not in SIGNS,
            f"no drawing for sign {question.sign!r}",
        ),
    )
    problems = [f"{question.qid}: {message}" for failed, message in checks if failed]
    law = law_problem(question.law)
    return problems if law is None else [*problems, f"{question.qid}: {law}"]


def option_problems(question: Question) -> list[str]:
    """Options must pair up across languages, and the key must point at them."""
    count = len(question.de.options)
    problems: list[str] = []
    if count not in OPTION_COUNTS or len(question.en.options) != count:
        problems.append(f"{question.qid}: needs 2 to 4 options, the same in German and English")
    if len(set(question.de.options)) != count:
        problems.append(f"{question.qid}: repeats an option")
    correct = question.correct
    if not correct or list(correct) != sorted(set(correct)) or correct[-1] >= count:
        problems.append(f"{question.qid}: correct must list option indices once, in order")
    numeric = all(NUMERIC.match(option) for option in question.de.options)
    if numeric and not question.keep_order:
        problems.append(f"{question.qid}: numeric options need keep_order = true")
    return problems


def bank_problems(questions: list[Question]) -> list[str]:
    """Ids, and German wordings with their sign, must be unique across the bank."""
    problems: list[str] = []
    seen: set[str] = set()
    for question in questions:
        wording = f"{question.de.question} [{question.sign}]"
        for key in (question.qid, wording):
            if key in seen:
                problems.append(f"{question.qid}: duplicate {key!r}")
            seen.add(key)
    return problems


def load(directory: Path) -> list[Question]:
    """Every question, Grundstoff first, failing with every problem found."""
    questions: list[Question] = []
    for section, name in SECTIONS.items():
        document = tomllib.loads((directory / name).read_text(encoding="utf-8"))
        entries = document.get("questions")
        if not isinstance(entries, list):
            msg = f"{name}: expected [[questions]] entries"
            raise QuestionError(msg)
        questions.extend(parse(entry, section) for entry in entries)
    problems = [
        *bank_problems(questions),
        *(issue for question in questions for issue in label_problems(question)),
        *(issue for question in questions for issue in option_problems(question)),
    ]
    if problems:
        raise QuestionError("question problems:\n  " + "\n  ".join(problems))
    return questions
