"use client";

import { useCallback, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface ReconciliationQuestion {
  type: "number" | "choice";
  text: string;
  /** Numeric answers are exact dollar amounts; choice answers are the option string */
  answer: number | string;
  /** Only for choice questions */
  options?: string[];
  explain: string;
}

// ── Maria's Bakery Questions (from reconciliation_reporting_exercise.html) ──

const QUESTIONS: ReconciliationQuestion[] = [
  {
    type: "number",
    text: "Maria's ledger shows $1,800 in cash. Her bank statement shows $1,950.\nThere's a $200 outstanding check and a $50 deposit in transit.\n\nWhat is the adjusted (reconciled) cash balance?",
    answer: 1800,
    explain:
      "Adjusted bank: $1,950 − $200 (outstanding check) + $50 (deposit in transit) = $1,800. The ledger balance needs no adjustment here, so both sides land on $1,800 — reconciled.",
  },
  {
    type: "choice",
    text: "Maria's bank statement shows a $30 monthly service fee she hadn't recorded in her ledger yet. What should she do?",
    options: [
      "Ignore it — the bank will handle it",
      "Record it in her ledger as an expense",
    ],
    answer: "Record it in her ledger as an expense",
    explain:
      "A bank fee is a real transaction. Maria needs to record it (Debit Bank Fee Expense / Credit Cash) so her ledger stays accurate.",
  },
  {
    type: "number",
    text: "For the month, Maria's Bakery had:\nRevenue: $6,000\nIngredients: $2,000\nWages: $1,500\nRent: $800\n\nWhat is Net Income?",
    answer: 1700,
    explain:
      "Net Income = Revenue − Expenses = $6,000 − ($2,000 + $1,500 + $800) = $6,000 − $4,300 = $1,700.",
  },
  {
    type: "choice",
    text: "Which statement reports activity over a period of time (like a month), rather than a single date?",
    options: ["Profit & Loss Statement", "Balance Sheet"],
    answer: "Profit & Loss Statement",
    explain:
      "The P&L covers a period of time (Revenue − Expenses = Net Income). The Balance Sheet is a snapshot as of one specific date.",
  },
  {
    type: "number",
    text: "Maria's Bakery has Total Assets of $20,000 and Total Liabilities of $7,000.\n\nWhat is Maria's Equity?",
    answer: 13000,
    explain:
      "Equity = Assets − Liabilities = $20,000 − $7,000 = $13,000. This is the accounting equation from Module 1, rearranged.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

/** Parse a user-entered dollar amount, tolerating commas and whitespace. */
function parseAmount(value: string): number {
  return parseFloat(value.replace(/,/g, "").trim());
}

// ── Component ───────────────────────────────────────────────────────────────

export function ReconciliationReportingExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [numValue, setNumValue] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];

  // ── Handlers ────────────────────────────────────────────────────────────

  const resetQuestionState = useCallback((index: number) => {
    setNumValue("");
    setSelectedChoice(null);
    setAnswered(false);
    setIsCorrect(null);
    setFeedback("");
    void index;
  }, []);

  const handleCheck = useCallback(() => {
    if (answered || isComplete || question.type !== "number") return;

    const value = parseAmount(numValue);
    if (Number.isNaN(value)) {
      setFeedback("Enter a number first.");
      setIsCorrect(null);
      return;
    }

    const correct = value === question.answer;
    setAnswered(true);
    setIsCorrect(correct);
    setScore((s) => (correct ? s + 1 : s));

    if (correct) {
      setFeedback("Correct! " + question.explain);
    } else {
      setFeedback(
        `Not quite — the correct answer is ${formatCurrency(
          question.answer as number
        )}. ${question.explain}`
      );
    }
  }, [answered, isComplete, numValue, question]);

  const handleSelectChoice = useCallback(
    (choice: string) => {
      if (answered || isComplete || question.type !== "choice") return;

      const correct = choice === question.answer;
      setSelectedChoice(choice);
      setAnswered(true);
      setIsCorrect(correct);
      setScore((s) => (correct ? s + 1 : s));

      if (correct) {
        setFeedback("Correct! " + question.explain);
      } else {
        setFeedback(
          `Not quite — the correct answer is ${question.answer}. ${question.explain}`
        );
      }
    },
    [answered, isComplete, question]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setIsComplete(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    resetQuestionState(nextIndex);
  }, [currentIndex, total, resetQuestionState]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    resetQuestionState(0);
    setIsComplete(false);
  }, [resetQuestionState]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl bg-navy p-6 text-white">
        <h2 className="font-serif text-xl text-white">Reconciliation &amp; Reporting</h2>
        <p className="mt-1 text-sm text-teal">
          Maria&apos;s Bakery — reconcile the cash, then build the reports
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{
              width: `${
                isComplete
                  ? 100
                  : ((currentIndex + (answered ? 1 : 0)) / total) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question card */}
      {!isComplete && (
        <div className="rounded-xl border border-ice-blue bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal">
            Question {currentIndex + 1} of {total}
          </div>
          <p className="mt-3 whitespace-pre-line text-lg font-medium leading-relaxed text-navy">
            {question.text}
          </p>

          {/* Answer area */}
          <div className="mt-5">
            {question.type === "number" ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-navy/40">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label="Enter amount"
                  placeholder="Enter amount"
                  value={numValue}
                  disabled={answered}
                  onChange={(e) => setNumValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheck();
                  }}
                  className={`w-full flex-1 rounded-lg border-2 bg-white px-3 py-2.5 text-base text-navy transition-colors focus:border-teal focus:outline-none disabled:cursor-default ${
                    answered
                      ? isCorrect
                        ? "border-green-600 bg-green-50"
                        : "border-red-300"
                      : "border-ice-blue"
                  }`}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                {(question.options ?? []).map((option) => {
                  const isAnswer = option === question.answer;
                  const isSelected = option === selectedChoice;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectChoice(option)}
                      disabled={answered}
                      className={`flex-1 rounded-lg border-2 px-4 py-3.5 text-sm font-semibold transition-colors disabled:cursor-default ${
                        answered
                          ? isAnswer
                            ? "border-green-600 bg-green-600 text-white"
                            : isSelected
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-ice-blue bg-white text-navy/50"
                          : "border-navy bg-white text-navy hover:bg-ice-blue"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Check button (number questions only) */}
          {question.type === "number" && !answered && (
            <button
              type="button"
              onClick={handleCheck}
              className="mt-5 w-full rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
            >
              Check Answer
            </button>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                isCorrect === null
                  ? "border-amber-200 bg-amber-50"
                  : isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  isCorrect === null
                    ? "text-amber-700"
                    : isCorrect
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {isCorrect === null
                  ? "Almost there"
                  : isCorrect
                  ? "✓ Correct!"
                  : "✗ Not quite."}
              </p>
              <p
                className={`mt-1 text-sm leading-relaxed ${
                  isCorrect === null
                    ? "text-amber-800"
                    : isCorrect
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {feedback}
              </p>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 w-full rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue"
            >
              {currentIndex + 1 >= total ? "See Results →" : "Next Question →"}
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {isComplete && (
        <div className="rounded-xl border border-ice-blue bg-white p-8 text-center shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal">
            Exercise Complete
          </div>
          <div className="mt-2 text-5xl font-extrabold text-teal">
            {score} <span className="text-2xl font-bold text-navy/40">/ {total}</span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy/60">
            {score === total
              ? "Perfect score! You've tied reconciliation, the P&L, and the balance sheet together."
              : score >= total * 0.6
              ? "Solid work — review any explanations that felt shaky."
              : "This one pulls the whole course together — consider re-reading the lesson and trying again."}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="mt-6 rounded-lg bg-navy px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
