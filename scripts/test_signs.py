"""Tests for the sign drawings."""

lazy import xml.etree.ElementTree as ET

lazy import pytest

lazy from signs import SIGNS, octagon_points


@pytest.mark.parametrize("code", sorted(SIGNS))
def test_every_sign_is_a_well_formed_svg(code: str) -> None:
    root = ET.fromstring(SIGNS[code].draw())
    assert root.tag == "{http://www.w3.org/2000/svg}svg"
    assert root.get("viewBox", "").startswith("0 0 ")
    assert len(root) > 0


def test_octagon_has_eight_corners() -> None:
    assert len(octagon_points(10).split()) == 8
