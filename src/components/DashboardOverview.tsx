import type { ReactElement } from "react";

import type { Summary } from "#lib/schemas.ts";

import { CoverageSection } from "./CoverageSection.tsx";
import type { DashboardActions } from "./dashboardActions.ts";
import { DataSection } from "./DataSection.tsx";
import { ProgressSection } from "./ProgressSection.tsx";
import { SessionHistory } from "./SessionHistory.tsx";
import { SettingsSection } from "./SettingsSection.tsx";
import { StartSection } from "./StartSection.tsx";
import { WeakSpots } from "./WeakSpots.tsx";

/**
 * Everything below the intro.
 * @param props - Summary, active-session flag and actions.
 * @returns The dashboard sections.
 */
function DashboardOverview(
  props: Readonly<{
    summary: Summary;
    hasActive: boolean;
    actions: DashboardActions;
  }>,
): ReactElement {
  const { summary, hasActive, actions } = props;
  const { settings, sessions, stats } = summary;
  return (
    <>
      <StartSection
        stats={stats}
        hasActive={hasActive}
        actions={actions}
      />
      <ProgressSection
        sessions={sessions}
        examDate={settings.examDate}
      />
      <CoverageSection stats={stats} />
      <WeakSpots
        stats={stats}
        disabled={hasActive}
        onPractise={actions.handlePractiseSelected}
      />
      {sessions.length > 0 ? <SessionHistory sessions={sessions} /> : null}
      <SettingsSection
        settings={settings}
        onChange={actions.handleSettings}
      />
      <DataSection
        backup={actions.backup}
        disabled={hasActive}
      />
    </>
  );
}

export { DashboardOverview };
