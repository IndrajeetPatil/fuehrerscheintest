import type { ReactElement } from "react";

import { ExternalLink } from "./ExternalLink.tsx";

/**
 * Where the questions come from, and the licence.
 * @returns The footer.
 */
function SourcesFooter(): ReactElement {
  return (
    <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
      <p>
        Practice questions written for this app from German traffic law (StVO,
        StVG, StVZO, FeV) as published on{" "}
        <ExternalLink href="https://www.gesetze-im-internet.de/">
          gesetze-im-internet.de
        </ExternalLink>
        , with simplified drawings of the official traffic signs. They are not
        the official TÜV | DEKRA catalogue, so practise with your driving
        school&apos;s materials too. This app is free, MIT-licensed open-source
        software; see{" "}
        <a
          className="link"
          href="#datenschutz"
        >
          Datenschutz · Privacy
        </a>{" "}
        for what happens to your data.
      </p>
    </footer>
  );
}

export { SourcesFooter };
