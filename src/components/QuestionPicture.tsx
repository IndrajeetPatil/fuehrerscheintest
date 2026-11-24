import type { ReactElement } from "react";

import type { Question } from "#lib/schemas.ts";

type Size = "thumbnail" | "full";
type Sign = NonNullable<Question["sign"]>;

// Catalogue thumbnails load lazily on their own white mat; the full picture
// sits on the mat its figure provides.
const CLASSES: Readonly<Record<Size, string>> = {
  thumbnail: "mt-4 h-24 w-auto rounded-md border border-line bg-white p-2",
  full: "h-40 w-auto md:h-48",
};

/**
 * A traffic sign. Its alternative text gives only the sign's number, so it
 * does not give away the answer to "What does this sign mean?".
 * @param props - The sign and display size.
 * @returns The image.
 */
function QuestionPicture(
  props: Readonly<{ sign: Sign; size: Size }>,
): ReactElement {
  const { sign, size } = props;
  return (
    <img
      src={`${import.meta.env.BASE_URL}signs/${sign.code}.svg`}
      alt={`Verkehrszeichen ${sign.number}`}
      loading={size === "thumbnail" ? "lazy" : "eager"}
      decoding="async"
      className={CLASSES[size]}
    />
  );
}

export { QuestionPicture };
