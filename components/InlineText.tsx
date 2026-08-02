import { Fragment, type ReactNode } from "react";

/**
 * Renders a string with lightweight markdown inline formatting:
 * - `**bold**`  → <strong>
 * - `*italic*`  → <em>
 *
 * The lesson content is written by a non-technical course creator, so we keep
 * the supported syntax tiny and predictable (no arbitrary HTML).
 */
export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

export function renderInline(text: string): ReactNode[] {
  // First split on ** for bold segments: even indexes are plain, odd are bold.
  const boldParts = text.split("**");
  return boldParts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i}>{part}</strong>;
    }
    // Within plain segments, split on * for italics.
    const italicParts = part.split("*");
    if (italicParts.length === 1) {
      return <Fragment key={i}>{part}</Fragment>;
    }
    return italicParts.map((sub, j) =>
      j % 2 === 1 ? (
        <em key={j}>{sub}</em>
      ) : (
        <Fragment key={j}>{sub}</Fragment>
      )
    );
  });
}
