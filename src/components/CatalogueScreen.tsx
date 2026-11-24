import type { ReactElement } from "react";

import { CatalogueView } from "./CatalogueView.tsx";
import type { ScreenProps } from "./screenProps.ts";

/**
 * The question catalogue.
 * @param props - Trainer and summary.
 * @returns The catalogue view.
 */
function CatalogueScreen(props: Readonly<ScreenProps>): ReactElement {
  const { summary } = props;
  const { settings } = summary;
  return (
    <CatalogueView
      settings={settings}
      stats={summary.stats}
    />
  );
}

export { CatalogueScreen };
