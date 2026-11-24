"""The committed catalogue and sign pictures must match a fresh build."""

lazy import json

lazy from build_data import OUT_JSON, OUT_SIGNS, QUESTIONS, document, drawings, main, serialise
lazy from questions import load
lazy from signs import SIGNS

EXAM_GRUNDSTOFF = 20
EXAM_KLASSE_B = 10


def test_committed_catalogue_is_up_to_date() -> None:
    assert OUT_JSON.read_text(encoding="utf-8") == serialise(load(QUESTIONS)), "run `make data`"


def test_committed_signs_are_up_to_date() -> None:
    on_disk = {path.name: path.read_text(encoding="utf-8") for path in OUT_SIGNS.glob("*.svg")}
    assert on_disk == drawings(), "run `make data`"


def test_bank_fills_a_mock_exam_and_uses_every_sign() -> None:
    questions = load(QUESTIONS)
    sections = [question.section for question in questions]
    assert sections.count("G") >= EXAM_GRUNDSTOFF * 2
    assert sections.count("B") >= EXAM_KLASSE_B * 2
    assert {question.sign for question in questions} - {None} == set(SIGNS)


def test_document_links_the_law_and_names_the_sign() -> None:
    entries = document(load(QUESTIONS))["questions"]
    assert isinstance(entries, list)
    first = json.loads(json.dumps(entries[0]))
    assert first["law"] == {
        "ref": "§ 8 StVO",
        "url": "https://www.gesetze-im-internet.de/stvo_2013/__8.html",
    }
    assert first["sign"] == {
        "code": "z205",
        "number": "205",
        "de": "Vorfahrt gewähren",
        "en": "Give way",
    }


def test_main_rewrites_the_same_files() -> None:
    before = OUT_JSON.read_text(encoding="utf-8")
    assert main() == 0
    assert OUT_JSON.read_text(encoding="utf-8") == before
