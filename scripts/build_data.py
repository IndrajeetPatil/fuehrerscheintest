"""Build src/data/catalogue.json and public/signs/*.svg from the question bank.

The questions live in questions/*.toml: original practice questions written from German traffic
law, each citing its legal basis. questions.py checks every entry and the build stops, listing
every problem, when one is malformed. signs.py draws the traffic signs the questions show.

Usage: uv run build_data.py
"""

lazy import json
lazy import sys
lazy from pathlib import Path
lazy from typing import Final

lazy from laws import law_url
lazy from questions import TOPICS, Question, QuestionError, Text, load
lazy from signs import SIGNS

ROOT: Final = Path(__file__).resolve().parent.parent
QUESTIONS: Final = ROOT / "questions"
OUT_JSON: Final = ROOT / "src" / "data" / "catalogue.json"
OUT_SIGNS: Final = ROOT / "public" / "signs"

type Record = dict[str, object]


def localised(text: Text) -> Record:
    """The question, options and explanation in one language."""
    return {"q": text.question, "o": list(text.options), "why": text.why}


def sign(code: str | None) -> Record | None:
    """The sign shown with a question: its number, names and picture."""
    if code is None:
        return None
    drawn = SIGNS[code]
    return {"code": code, "number": drawn.number, "de": drawn.de, "en": drawn.en}


def law(reference: str | None) -> Record | None:
    """The legal basis of a question, with a link to its text."""
    return None if reference is None else {"ref": reference, "url": law_url(reference)}


def record(question: Question) -> Record:
    """One catalogue entry."""
    return {
        "id": question.qid,
        "section": question.section,
        "topic": question.topic,
        "points": question.points,
        "de": localised(question.de),
        "en": localised(question.en),
        "correct": list(question.correct),
        "sign": sign(question.sign),
        "law": law(question.law),
        "keepOrder": question.keep_order,
    }


def document(questions: list[Question]) -> Record:
    """The catalogue file's content."""
    return {
        "topics": [{"code": code, "de": de, "en": en} for code, (de, en) in TOPICS.items()],
        "questions": [record(question) for question in questions],
    }


def serialise(questions: list[Question]) -> str:
    """The catalogue as written to disk."""
    return json.dumps(document(questions), ensure_ascii=False, indent=1) + "\n"


def drawings() -> dict[str, str]:
    """Every sign picture by file name."""
    return {f"{code}.svg": drawn.draw() for code, drawn in SIGNS.items()}


def main() -> int:
    """Check and write the catalogue and sign pictures; returns the exit status."""
    try:
        questions = load(QUESTIONS)
    except QuestionError as error:
        print(error, file=sys.stderr)
        return 1
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(serialise(questions), encoding="utf-8")
    OUT_SIGNS.mkdir(parents=True, exist_ok=True)
    for old in OUT_SIGNS.glob("*.svg"):
        old.unlink()
    for name, picture in drawings().items():
        (OUT_SIGNS / name).write_text(picture, encoding="utf-8")
    counts = {section: sum(q.section == section for q in questions) for section in ("G", "B")}
    print(
        f"wrote {OUT_JSON.relative_to(ROOT)}: {len(questions)} questions "
        f"({counts['G']} Grundstoff, {counts['B']} Klasse B), {len(SIGNS)} signs"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
