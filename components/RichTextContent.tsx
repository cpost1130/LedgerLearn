import { InlineText } from "./InlineText";

/**
 * Rich lesson content is stored in the DB as JSON and rendered here.
 *
 * Each section has a `heading` plus either:
 *  - a `body` (single paragraph) and optional `callout` (legacy form), or
 *  - a `blocks` array of typed blocks: paragraph, list, table, code, callout.
 *
 * The block form supports the full Module 1 lesson (tables, T-account
 * diagrams, glossaries) while keeping the data plain JSON that the admin
 * panel can edit.
 */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "callout"; text: string };

interface Section {
  heading: string;
  body?: string;
  callout?: string;
  blocks?: ContentBlock[];
}

interface RichTextContentProps {
  sections: Section[];
}

export function RichTextContent({ sections }: RichTextContentProps) {
  return (
    <div className="space-y-10">
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="font-serif text-xl text-navy">{section.heading}</h2>
          <div className="mt-3 space-y-4">
            {section.blocks && section.blocks.length > 0 ? (
              section.blocks.map((block, j) => (
                <BlockView key={j} block={block} />
              ))
            ) : (
              <>
                {section.body && (
                  <p className="leading-relaxed text-navy/80">
                    <InlineText text={section.body} />
                  </p>
                )}
                {section.callout && <Callout text={section.callout} />}
              </>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="leading-relaxed text-navy/80">
          <InlineText text={block.text} />
        </p>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={
            block.ordered
              ? "list-decimal space-y-2 pl-6 text-navy/80"
              : "list-disc space-y-2 pl-6 text-navy/80"
          }
        >
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <InlineText text={item} />
            </li>
          ))}
        </ListTag>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-ice-blue">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-left text-white">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 font-medium tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-ice-blue/40"}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border-t border-ice-blue px-4 py-2.5 text-navy/80"
                    >
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg bg-navy p-4 font-mono text-sm leading-relaxed text-white">
          {block.text}
        </pre>
      );
    case "callout":
      return <Callout text={block.text} />;
    default:
      return null;
  }
}

function Callout({ text }: { text: string }) {
  return (
    <div className="rounded-lg border-l-4 border-teal bg-teal/5 px-4 py-3">
      <p className="text-sm font-medium leading-relaxed text-teal">
        <InlineText text={text} />
      </p>
    </div>
  );
}
