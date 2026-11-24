"""Legal references such as `§ 8 StVO` and links to their text on gesetze-im-internet.de."""

lazy import re
lazy from typing import Final

BASE: Final = "https://www.gesetze-im-internet.de"
# Path of each law on gesetze-im-internet.de.
LAWS: Final = frozendict({
    "StVO": "stvo_2013",
    "StVG": "stvg",
    "StVZO": "stvzo_2012",
    "FeV": "fev_2010",
    "StGB": "stgb",
})
REFERENCE: Final = re.compile(r"(?:§ (?P<section>\d+[a-z]?)|Anlage (?P<annex>\d+)) (?P<law>\w+)")


class LawError(ValueError):
    """A legal reference this app cannot link."""


def law_url(reference: str) -> str:
    """The URL of a section (`§ 24a StVG`) or an annex (`Anlage 2 StVO`)."""
    match = REFERENCE.fullmatch(reference)
    if match is None:
        msg = f"unrecognised legal reference {reference!r}"
        raise LawError(msg)
    path = LAWS.get(match["law"])
    if path is None:
        msg = f"unknown law in {reference!r}"
        raise LawError(msg)
    page = f"__{match['section']}" if match["section"] else f"anlage_{match['annex']}"
    return f"{BASE}/{path}/{page}.html"
