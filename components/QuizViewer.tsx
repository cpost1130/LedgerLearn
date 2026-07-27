"use client";

import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizViewerProps {
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
}

export function QuizViewer({ questions, onComplete }: QuizViewerProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);
    onComplete?.(score, questions.length);
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="space-y-8">
      {questions.map((q, qIndex) => {
        const isCorrect = answers[qIndex] === q.correctIndex;

        return (
          <div
            key={qIndex}
            className={`rounded-xl border p-6 ${
              submitted
                ? isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
                : "border-ice-blue bg-white"
            }`}
          >
            <p className="font-serif text-lg text-navy">
              {qIndex + 1}. {q.question}
            </p>

            <div className="mt-4 space-y-2">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[qIndex] === optIndex;
                const isCorrectOption = optIndex === q.correctIndex;

                let borderClass = "border-ice-blue";
                let bgClass = isSelected ? "bg-teal/10" : "bg-white";

                if (submitted) {
                  if (isCorrectOption) {
                    borderClass = "border-green-300";
                    bgClass = "bg-green-100";
                  } else if (isSelected && !isCorrectOption) {
                    borderClass = "border-red-300";
                    bgClass = "bg-red-100";
                  }
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelect(qIndex, optIndex)}
                    disabled={submitted}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${borderClass} ${bgClass} ${
                      submitted ? "cursor-default" : "cursor-pointer hover:border-teal"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                          isSelected
                            ? submitted
                              ? isCorrectOption
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-red-500 bg-red-500 text-white"
                              : "border-teal bg-teal text-white"
                            : submitted && isCorrectOption
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-navy/20 text-navy/50"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span
                        className={
                          submitted && isCorrectOption
                            ? "font-semibold text-green-800"
                            : ""
                        }
                      >
                        {opt}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p
                className={`mt-3 text-sm font-medium ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <div className="rounded-lg border border-ice-blue bg-white p-6 text-center">
          <p className="font-serif text-xl text-navy">
            Your Score:{" "}
            {questions.reduce(
              (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
              0
            )}{" "}
            / {questions.length}
          </p>
        </div>
      )}
    </div>
  );
}
