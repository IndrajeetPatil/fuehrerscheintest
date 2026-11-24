"""Tests for legal references and their links."""

lazy import pytest

lazy from laws import LawError, law_url


@pytest.mark.parametrize(
    ("reference", "url"),
    [
        pytest.param("§ 8 StVO", "stvo_2013/__8.html", id="section"),
        pytest.param("§ 24a StVG", "stvg/__24a.html", id="lettered section"),
        pytest.param("Anlage 2 StVO", "stvo_2013/anlage_2.html", id="annex"),
        pytest.param("§ 323c StGB", "stgb/__323c.html", id="criminal code"),
    ],
)
def test_law_url(reference: str, url: str) -> None:
    assert law_url(reference) == f"https://www.gesetze-im-internet.de/{url}"


@pytest.mark.parametrize("reference", ["§8 StVO", "§ 8 BGB", "Art. 3 GG"])
def test_law_url_rejects_unknown_references(reference: str) -> None:
    with pytest.raises(LawError):
        law_url(reference)
