import { describe, expect, test } from "vite-plus/test";

import { questions } from "./catalogue.ts";
import { fold, searchCatalogue } from "./catalogueSearch.ts";
import { statOf } from "./testing.ts";

function ids(query: string): string[] {
  return searchCatalogue(questions, {}, { query, mastery: "all" }).map(
    (entry) => entry.id,
  );
}

describe(fold, () => {
  test("ignores case, accents and ß", () => {
    expect(fold("Bürger Straße")).toBe("burger strasse");
  });
});

describe(searchCatalogue, () => {
  test("finds German and English text without accents", () => {
    const german = searchCatalogue(
      questions,
      {},
      { query: "Bremsfussigkeit", mastery: "all" },
    );
    const english = searchCatalogue(
      questions,
      {},
      { query: "zebra crossing", mastery: "all" },
    );
    expect(german).toHaveLength(0);
    expect(ids("bremsflussigkeit")).toStrictEqual(["B011"]);
    expect(english.some((entry) => entry.de.q.includes("Zebrastreifen"))).toBe(
      true,
    );
  });

  test("finds topics and the names of signs", () => {
    expect(ids("Andreaskreuz")).toContain("G055");
    expect(ids("right of way").length).toBeGreaterThan(5);
  });

  test("finds a question by its exact id, in any case", () => {
    expect(ids("g001")).toStrictEqual(["G001"]);
    expect(ids(" b011 ")).toStrictEqual(["B011"]);
    expect(ids("G999")).toStrictEqual([]);
  });

  test("filters by mastery", () => {
    const stats = { G001: statOf("0") };
    expect(
      searchCatalogue(questions, stats, { query: "", mastery: "missed" }).map(
        (entry) => entry.id,
      ),
    ).toStrictEqual(["G001"]);
  });
});
