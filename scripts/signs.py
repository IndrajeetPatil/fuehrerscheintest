"""Simplified SVG drawings of the traffic signs the questions show.

Official German traffic signs are public-domain official works (§ 5 UrhG), and these drawings
are drawn from scratch: geometry and colours follow the Verkehrszeichenkatalog closely enough
to recognise each sign, but they are not to scale.
"""

lazy import math
lazy from collections.abc import Callable
lazy from dataclasses import dataclass
lazy from typing import Final

RED: Final = "#c1121c"
BLUE: Final = "#005387"
YELLOW: Final = "#f0ca00"
GREEN: Final = "#2e9e4f"
BLACK: Final = "#1a1a1a"
WHITE: Final = "#ffffff"
FONT: Final = "font-family='Arial, Helvetica, sans-serif' font-weight='700'"

# Square canvas most signs are drawn on, and its centre.
SIZE: Final = 120
MID: Final = 60
RING: Final = 57
INNER: Final = 46
OCTAGON_SIDES: Final = 8


@dataclass(frozen=True, slots=True)
class Sign:
    """A sign's official number, its names and its drawing."""

    number: str
    de: str
    en: str
    draw: Callable[[], str]


def svg(body: str, width: int = SIZE, height: int = SIZE) -> str:
    """A standalone SVG document."""
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {width} {height}' "
        f"width='{width * 2}' height='{height * 2}'>{body}</svg>\n"
    )


def warning(symbol: str) -> str:
    """A warning sign: red-bordered triangle, apex up, with a black symbol."""
    triangle = (
        f"<polygon points='60,10 112,102 8,102' fill='{WHITE}' stroke='{RED}' "
        "stroke-width='11' stroke-linejoin='round'/>"
    )
    return svg(triangle + symbol)


def prohibition(inside: str = "", field: str = WHITE) -> str:
    """A round prohibition sign: red ring around a coloured field."""
    ring = f"<circle cx='{MID}' cy='{MID}' r='{RING}' fill='{RED}'/>"
    disc = f"<circle cx='{MID}' cy='{MID}' r='{INNER}' fill='{field}'/>"
    return svg(ring + disc + inside)


def blue_disc(inside: str) -> str:
    """A round mandatory sign: blue disc with a white rim."""
    rim = f"<circle cx='{MID}' cy='{MID}' r='{RING}' fill='{WHITE}'/>"
    disc = f"<circle cx='{MID}' cy='{MID}' r='54' fill='{BLUE}'/>"
    return svg(rim + disc + inside)


def diamond(inside: str = "") -> str:
    """The priority-road diamond: yellow square on its corner with a white border."""
    outer = f"<polygon points='60,3 117,60 60,117 3,60' fill='{WHITE}' stroke='{BLACK}'/>"
    inner = f"<polygon points='60,20 100,60 60,100 20,60' fill='{YELLOW}'/>"
    return svg(outer + inner + inside)


def octagon_points(radius: float) -> str:
    """Corners of a regular octagon with flat top and bottom edges."""
    step = 2 * math.pi / OCTAGON_SIDES
    corners = [
        (MID + radius * math.cos(step * (i + 0.5)), MID + radius * math.sin(step * (i + 0.5)))
        for i in range(OCTAGON_SIDES)
    ]
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in corners)


def stop() -> str:
    """Zeichen 206: red octagon reading STOP."""
    return svg(
        f"<polygon points='{octagon_points(58)}' fill='{RED}'/>"
        f"<polygon points='{octagon_points(52)}' fill='none' stroke='{WHITE}' stroke-width='3'/>"
        f"<text x='60' y='71' text-anchor='middle' font-size='32' {FONT} "
        f"fill='{WHITE}'>STOP</text>"
    )


def give_way() -> str:
    """Zeichen 205: red-bordered triangle, apex down."""
    return svg(
        f"<polygon points='8,18 112,18 60,110' fill='{WHITE}' stroke='{RED}' "
        "stroke-width='11' stroke-linejoin='round'/>"
    )


def end_of_priority() -> str:
    """Zeichen 307: the priority diamond struck through with thin black lines."""
    stripes = "".join(
        f"<line x1='{x}' y1='{y}' x2='{x + 90}' y2='{y - 90}' stroke='{BLACK}' stroke-width='2'/>"
        for x, y in ((4, 96), (12, 104), (20, 112), (28, 120))
    )
    clip = "<clipPath id='sign'><polygon points='60,3 117,60 60,117 3,60'/></clipPath>"
    return diamond(f"{clip}<g clip-path='url(#sign)'>{stripes}</g>")


def level_crossing() -> str:
    """Zeichen 201: St Andrew's cross in red and white."""

    def arm(angle: int) -> str:
        segments = "".join(
            f"<rect x='{start}' y='-8' width='26' height='16' fill='{colour}'/>"
            for start, colour in ((-65, RED), (-39, WHITE), (-13, RED), (13, WHITE), (39, RED))
        )
        outline = f"<rect x='-65' y='-8' width='130' height='16' fill='none' stroke='{BLACK}'/>"
        return f"<g transform='translate(70 50) rotate({angle})'>{segments}{outline}</g>"

    return svg(arm(30) + arm(-30), width=140, height=100)


def turn_right() -> str:
    """Zeichen 209: white arrow bending right on a blue disc."""
    return blue_disc(
        f"<path d='M48 94 V64 Q48 48 64 48 H74' fill='none' stroke='{WHITE}' stroke-width='12'/>"
        f"<polygon points='72,32 96,48 72,64' fill='{WHITE}'/>"
    )


def one_way() -> str:
    """Zeichen 220: white arrow reading Einbahnstraße on a blue panel."""
    return svg(
        f"<rect x='1' y='1' width='158' height='58' rx='5' fill='{BLUE}' stroke='{WHITE}' "
        "stroke-width='2'/>"
        f"<polygon points='12,19 116,19 116,8 148,30 116,52 116,41 12,41' fill='{WHITE}'/>"
        f"<text x='64' y='34' text-anchor='middle' font-size='12' {FONT} "
        f"fill='{BLACK}'>Einbahnstraße</text>",
        width=160,
        height=60,
    )


def speed_limit() -> str:
    """Zeichen 274: speed limit, here 30 km/h."""
    return prohibition(
        f"<text x='60' y='78' text-anchor='middle' font-size='50' {FONT} fill='{BLACK}'>30</text>"
    )


def no_entry() -> str:
    """Zeichen 267: white bar across a red disc."""
    return svg(
        f"<circle cx='{MID}' cy='{MID}' r='{RING}' fill='{RED}'/>"
        f"<rect x='20' y='51' width='80' height='18' fill='{WHITE}'/>"
    )


def stopping_line(x1: float, y1: float, x2: float, y2: float) -> str:
    """A red diagonal across the blue field of a no-stopping sign."""
    return f"<line x1='{x1}' y1='{y1}' x2='{x2}' y2='{y2}' stroke='{RED}' stroke-width='9'/>"


def motorway() -> str:
    """Zeichen 330.1: a motorway bridge over two carriageways, in white on blue."""
    return svg(
        f"<rect x='1' y='1' width='118' height='118' rx='8' fill='{BLUE}' stroke='{WHITE}' "
        "stroke-width='2'/>"
        f"<rect x='18' y='26' width='84' height='10' fill='{WHITE}'/>"
        f"<rect x='18' y='26' width='9' height='26' fill='{WHITE}'/>"
        f"<rect x='93' y='26' width='9' height='26' fill='{WHITE}'/>"
        f"<polygon points='22,104 52,104 57,44 51,44' fill='{WHITE}'/>"
        f"<polygon points='68,104 98,104 69,44 63,44' fill='{WHITE}'/>"
    )


def green_arrow() -> str:
    """The Grünpfeil: a green arrow pointing right on a black plate."""
    return svg(
        f"<rect x='1' y='1' width='118' height='88' rx='6' fill='{BLACK}'/>"
        f"<rect x='20' y='38' width='54' height='14' fill='{GREEN}'/>"
        f"<polygon points='70,24 100,45 70,66' fill='{GREEN}'/>",
        height=90,
    )


SIGNS: Final = frozendict({
    "z101": Sign(
        "101",
        "Gefahrstelle",
        "Danger",
        lambda: warning(
            f"<rect x='54.5' y='42' width='11' height='36' rx='3' fill='{BLACK}'/>"
            f"<circle cx='60' cy='88' r='6' fill='{BLACK}'/>"
        ),
    ),
    "z102": Sign(
        "102",
        "Kreuzung oder Einmündung mit Vorfahrt von rechts",
        "Crossroads with priority from the right",
        lambda: warning(
            f"<path d='M42 52 L78 92 M78 52 L42 92' stroke='{BLACK}' stroke-width='9'/>"
        ),
    ),
    "z201": Sign("201", "Andreaskreuz", "St Andrew's cross (level crossing)", level_crossing),
    "z205": Sign("205", "Vorfahrt gewähren", "Give way", give_way),
    "z206": Sign("206", "Halt. Vorfahrt gewähren", "Stop and give way", stop),
    "z209": Sign("209", "Vorgeschriebene Fahrtrichtung rechts", "Turn right", turn_right),
    "z220": Sign("220", "Einbahnstraße", "One-way street", one_way),
    "z250": Sign("250", "Verbot für Fahrzeuge aller Art", "No vehicles", prohibition),
    "z267": Sign("267", "Verbot der Einfahrt", "No entry", no_entry),
    "z274-30": Sign(
        "274",
        "Zulässige Höchstgeschwindigkeit 30 km/h",
        "Maximum speed 30 km/h",
        speed_limit,
    ),
    "z283": Sign(
        "283",
        "Absolutes Haltverbot",
        "No stopping",
        lambda: prohibition(
            stopping_line(27.5, 27.5, 92.5, 92.5) + stopping_line(92.5, 27.5, 27.5, 92.5),
            field=BLUE,
        ),
    ),
    "z286": Sign(
        "286",
        "Eingeschränktes Haltverbot",
        "Restricted stopping",
        lambda: prohibition(stopping_line(27.5, 27.5, 92.5, 92.5), field=BLUE),
    ),
    "z301": Sign(
        "301",
        "Vorfahrt",
        "Priority at the next junction",
        lambda: warning(
            f"<rect x='54' y='44' width='12' height='52' fill='{BLACK}'/>"
            f"<rect x='40' y='64' width='40' height='6' fill='{BLACK}'/>"
        ),
    ),
    "z306": Sign("306", "Vorfahrtstraße", "Priority road", diamond),
    "z307": Sign("307", "Ende der Vorfahrtstraße", "End of priority road", end_of_priority),
    "z330-1": Sign("330.1", "Autobahn", "Motorway", motorway),
    "z720": Sign("720", "Grünpfeil", "Green arrow", green_arrow),
})
