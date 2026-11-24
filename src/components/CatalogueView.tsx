import { useDeferredValue, useMemo, useState } from "react";
import type { ReactElement } from "react";

import { questions } from "#lib/catalogue.ts";
import { searchCatalogue } from "#lib/catalogueSearch.ts";
import type { CatalogueFilter } from "#lib/catalogueSearch.ts";
import type { QuestionStat, Settings } from "#lib/schemas.ts";

import { CatalogueEntry } from "./CatalogueEntry.tsx";
import { CatalogueFilters } from "./CatalogueFilters.tsx";

/**
 * Read-through of every question, with answers and explanations.
 * @param props - Settings and statistics.
 * @returns The catalogue view.
 */
function CatalogueView(
  props: Readonly<{
    settings: Settings;
    stats: Readonly<Record<string, QuestionStat>>;
  }>,
): ReactElement {
  const { settings, stats } = props;
  const [filter, setFilter] = useState<CatalogueFilter>({
    query: "",
    mastery: "all",
  });
  const deferred = useDeferredValue(filter);
  const shown = useMemo(
    () => searchCatalogue(questions, stats, deferred),
    [deferred, stats],
  );
  return (
    <main className="mx-auto max-w-5xl px-5 pt-10 pb-24 md:px-8">
      <h1 className="text-title">Fragenkatalog</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">
        All {questions.length} practice questions with their correct answers, an
        explanation and the law behind each. Reading is no substitute for
        answering — use it to look things up.
      </p>
      <CatalogueFilters
        filter={filter}
        shown={shown.length}
        onChange={setFilter}
      />
      <ol className="divide-y divide-line">
        {shown.map((entry) => (
          <CatalogueEntry
            key={entry.id}
            question={entry}
            stat={stats[entry.id]}
            showEnglish={settings.showEnglish}
          />
        ))}
      </ol>
    </main>
  );
}

export { CatalogueView };
