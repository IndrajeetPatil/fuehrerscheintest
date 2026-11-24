"""Tests for loading and checking the question bank."""

lazy from pathlib import Path

lazy import pytest

lazy from questions import (
    Question,
    QuestionError,
    Text,
    bank_problems,
    label_problems,
    load,
    option_problems,
    parse,
)

GOOD = {
    "id": "G901",
    "topic": "vorfahrt",
    "points": 5,
    "law": "§ 8 StVO",
    "correct": [0, 2],
    "de": {"q": "Was gilt?", "o": ["Eins", "Zwei", "Drei"], "why": "Darum."},
    "en": {"q": "What applies?", "o": ["One", "Two", "Three"], "why": "Because."},
}


def question(**changes: object) -> Question:
    return parse({**GOOD, **changes}, "G")


def test_parse_reads_a_question() -> None:
    parsed = question(sign="z205")
    assert parsed.correct == (0, 2)
    assert parsed.de == Text("Was gilt?", ("Eins", "Zwei", "Drei"), "Darum.")
    assert parsed.sign == "z205"
    assert parsed.keep_order is False
    assert label_problems(parsed) == []
    assert option_problems(parsed) == []


@pytest.mark.parametrize(
    "changes",
    [
        pytest.param({"colour": "red"}, id="unknown key"),
        pytest.param({"points": "5"}, id="points as text"),
        pytest.param({"keep_order": "yes"}, id="keep_order as text"),
        pytest.param({"correct": [True]}, id="boolean index"),
        pytest.param({"correct": "0"}, id="correct as text"),
        pytest.param({"de": "Was gilt?"}, id="language as text"),
        pytest.param({"de": {"q": "Was gilt?", "o": "Eins", "why": "Darum."}}, id="options"),
        pytest.param({"de": {"q": " Was gilt?", "o": ["Eins"], "why": "Darum."}}, id="padded"),
        pytest.param({"law": ""}, id="empty law"),
    ],
)
def test_parse_rejects_malformed_entries(changes: dict[str, object]) -> None:
    with pytest.raises(QuestionError):
        question(**changes)


@pytest.mark.parametrize(
    ("changes", "problem"),
    [
        pytest.param({"id": "B901"}, "id must be G", id="id section"),
        pytest.param({"topic": "wetter"}, "unknown topic", id="topic"),
        pytest.param({"points": 6}, "points must be 2 to 5", id="points"),
        pytest.param({"sign": "z999"}, "no drawing", id="sign"),
        pytest.param({"law": "§ 1 BGB"}, "unknown law", id="law"),
    ],
)
def test_label_problems(changes: dict[str, object], problem: str) -> None:
    assert problem in " ".join(label_problems(question(**changes)))


@pytest.mark.parametrize(
    ("changes", "problem"),
    [
        pytest.param({"correct": []}, "correct must list", id="no answer"),
        pytest.param({"correct": [2, 0]}, "correct must list", id="unsorted"),
        pytest.param({"correct": [3]}, "correct must list", id="out of range"),
        pytest.param(
            {"en": {"q": "What?", "o": ["One", "Two"], "why": "Because."}},
            "the same in German and English",
            id="unpaired",
        ),
        pytest.param(
            {"de": {"q": "Was?", "o": ["Eins", "Eins", "Drei"], "why": "Darum."}},
            "repeats an option",
            id="repeated",
        ),
        pytest.param(
            {"de": {"q": "Was?", "o": ["1 m", "2 m", "3 m"], "why": "Darum."}},
            "keep_order",
            id="numbers",
        ),
    ],
)
def test_option_problems(changes: dict[str, object], problem: str) -> None:
    assert problem in " ".join(option_problems(question(**changes)))


def test_bank_problems_find_duplicates() -> None:
    assert bank_problems([question(), question()]) == [
        "G901: duplicate 'G901'",
        "G901: duplicate 'Was gilt? [None]'",
    ]


def test_load_reports_every_problem(tmp_path: Path) -> None:
    directory = tmp_path
    entry = '[[questions]]\nid = "{id}"\ntopic = "wetter"\npoints = 5\ncorrect = [0]\n'
    entry += '[questions.de]\nq = "Was {id}?"\no = ["A", "B"]\nwhy = "D."\n'
    entry += '[questions.en]\nq = "What?"\no = ["A", "B"]\nwhy = "B."\n'
    (directory / "grundstoff.toml").write_text(entry.format(id="G001"), encoding="utf-8")
    (directory / "klasse-b.toml").write_text(entry.format(id="B001"), encoding="utf-8")
    with pytest.raises(QuestionError, match="unknown topic") as raised:
        load(directory)
    assert "B001" in str(raised.value)


def test_load_needs_question_tables(tmp_path: Path) -> None:
    directory = tmp_path
    for name in ("grundstoff.toml", "klasse-b.toml"):
        (directory / name).write_text('title = "nothing"\n', encoding="utf-8")
    with pytest.raises(QuestionError, match="expected"):
        load(directory)
