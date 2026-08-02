"use client";
import { useState } from "react";
import { InlineText } from "./InlineText";

interface Slide {
  title: string;
  body: string;
}

interface SlidesViewerProps {
  slides: Slide[];
}

export function SlidesViewer({ slides }: SlidesViewerProps) {
  const [current, setCurrent] = useState(0);
  const goNext = () => setCurrent((c) => Math.min(c + 1, slides.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  if (slides.length === 0) {
    return (
      <div className="rounded-lg border border-ice-blue bg-white p-8 text-center text-navy/50">
        No slides available.
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div>
      {/* Slide card */}
      <div className="rounded-xl border border-ice-blue bg-white p-8 shadow-sm md:p-12">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-navy/40">
          Slide {current + 1} of {slides.length}
        </div>
        <h2 className="font-serif text-2xl text-navy">
          <InlineText text={slide.title} />
        </h2>
        <SlideBody body={slide.body} />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="rounded-lg border border-ice-blue bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-ice-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>
        {/* Dot indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? "bg-teal" : "bg-ice-blue"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          disabled={current === slides.length - 1}
          className="rounded-lg border border-ice-blue bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-ice-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/**
 * Slide bodies are stored as plain text lines. Lines starting with "-" or "•"
 * render as bullets; every other line renders as a paragraph. This keeps the
 * DB content simple JSON while letting slides contain bullet lists.
 */
function SlideBody({ body }: { body: string }) {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {lines.map((line, i) =>
        line.startsWith("-") || line.startsWith("•") ? (
          <p key={i} className="flex gap-2.5 leading-relaxed text-navy/80">
            <span className="mt-0.5 shrink-0 text-teal">•</span>
            <span>
              <InlineText text={line.replace(/^[-•]\s*/, "")} />
            </span>
          </p>
        ) : (
          <p key={i} className="leading-relaxed text-navy/80">
            <InlineText text={line} />
          </p>
        )
      )}
    </div>
  );
}
