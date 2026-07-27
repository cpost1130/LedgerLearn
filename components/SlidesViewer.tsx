"use client";

import { useState } from "react";

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
        <h2 className="font-serif text-2xl text-navy">{slide.title}</h2>
        <p className="mt-4 leading-relaxed text-navy/80">{slide.body}</p>
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
