interface Section {
  heading: string;
  body: string;
  callout?: string;
}

interface RichTextContentProps {
  sections: Section[];
}

export function RichTextContent({ sections }: RichTextContentProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="font-serif text-xl text-navy">{section.heading}</h2>
          <p className="mt-2 leading-relaxed text-navy/80">{section.body}</p>
          {section.callout && (
            <div className="mt-4 rounded-lg border-l-4 border-teal bg-teal/5 px-4 py-3">
              <p className="text-sm font-medium text-teal">
                {section.callout}
              </p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
