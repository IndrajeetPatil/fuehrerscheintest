import { useId } from "react";
import type { ReactElement } from "react";

import { isoDateSchema } from "#lib/schemas.ts";
import type { Settings, SettingsPatch } from "#lib/schemas.ts";

import { Toggle } from "./Toggle.tsx";

/**
 * Exam date and display preferences.
 * @param props - Current settings and the change handler.
 * @returns The settings section.
 */
function SettingsSection(
  props: Readonly<{
    settings: Settings;
    onChange: (patch: SettingsPatch) => void;
  }>,
): ReactElement {
  const { settings, onChange } = props;
  const dateId = useId();
  return (
    <section className="mt-16 border-t border-line pt-8">
      <h2 className="text-heading">Einstellungen · Settings</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor={dateId}
            className="text-sm text-muted"
          >
            Exam date
          </label>
          <input
            id={dateId}
            type="date"
            className="input mt-1 block w-full"
            value={settings.examDate ?? ""}
            onChange={(event) => {
              const date = isoDateSchema.safeParse(event.target.value);
              onChange({ examDate: date.success ? date.data : null });
            }}
          />
        </div>
        <Toggle
          checked={settings.showEnglish}
          label="Show English next to German"
          hint="Turn off in the last days to check you can read the German alone (press E during a session)."
          onChange={(showEnglish) => {
            onChange({ showEnglish });
          }}
        />
        <Toggle
          checked={settings.shuffleOptions}
          label="Shuffle answer options"
          hint="Stops you from remembering positions instead of answers. Number options keep their order."
          onChange={(shuffleOptions) => {
            onChange({ shuffleOptions });
          }}
        />
      </div>
    </section>
  );
}

export { SettingsSection };
