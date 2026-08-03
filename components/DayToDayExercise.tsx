"use client";

import { useCallback, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface EntryLine {
  account: string;
  amount: number;
}

interface DayToDayQuestion {
  text: string;
  /** Correct account for each debit line */
  debits: EntryLine[];
  /** Correct account for each credit line */
  credits: EntryLine[];
  explain: string;
}

// ── Green Acres Landscaping Questions (from day_to_day_transactions_exercise.html) ──

const ACCOUNTS = [
  "Cash",
  "Accounts Receivable",
  "Accounts Payable",
  "Mowing Revenue",
  "Landscaping Revenue",
  "Supplies Expense",
  "Fuel Expense",
  "Repair Expense",
  "Wages Expense",
  "Payroll Taxes Payable",
];

const QUESTIONS: DayToDayQuestion[] = [
  {
    text: "Green Acres mows a lawn for $60, paid in cash.",
    debits: [{ account: "Cash", amount: 60 }],
    credits: [{ account: "Mowing Revenue", amount: 60 }],
    explain:
      "Cash increases from the payment (Debit); Mowing Revenue increases because the service was earned (Credit).",
  },
  {
    text: "Green Acres completes a $450 job for a client, to be invoiced and paid in 30 days.",
    debits: [{ account: "Accounts Receivable", amount: 450 }],
    credits: [{ account: "Landscaping Revenue", amount: 450 }],
    explain:
      "Accounts Receivable increases because cash hasn't arrived yet (Debit); Landscaping Revenue increases because the job is done and earned (Credit).",
  },
  {
    text: "That same client pays their $450 invoice in full.",
    debits: [{ account: "Cash", amount: 450 }],
    credits: [{ account: "Accounts Receivable", amount: 450 }],
    explain:
      "Cash increases with the payment (Debit); Accounts Receivable decreases since the amount owed is now collected (Credit).",
  },
  {
    text: "Green Acres buys $90 of mulch and plants, paid immediately by debit card.",
    debits: [{ account: "Supplies Expense", amount: 90 }],
    credits: [{ account: "Cash", amount: 90 }],
    explain:
      "Supplies Expense increases (Debit); Cash decreases since it was paid immediately (Credit).",
  },
  {
    text: "Green Acres gets a $150 equipment repair done on credit, to be paid in 15 days.",
    debits: [{ account: "Repair Expense", amount: 150 }],
    credits: [{ account: "Accounts Payable", amount: 150 }],
    explain:
      "Repair Expense increases (Debit) because the cost was incurred; Accounts Payable increases because it hasn't been paid yet (Credit).",
  },
  {
    text: "A crew member earns $400 in gross wages; $60 is withheld for payroll taxes, and $340 is paid by direct deposit.",
    debits: [{ account: "Wages Expense", amount: 400 }],
    credits: [
      { account: "Payroll Taxes Payable", amount: 60 },
      { account: "Cash", amount: 340 },
    ],
    explain:
      "The full $400 is Wages Expense (Debit) — the real cost to the business. It splits into two credits: $60 held as Payroll Taxes Payable, and $340 actually paid out as Cash.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

function emptyChoices(lines: EntryLine[]): string[] {
  return lines.map(() => "");
}

// ── Component ───────────────────────────────────────────────────────────────

export function DayToDayExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [debitChoices, setDebitChoices] = useState<string[]>(() =>
    emptyChoices(QUESTIONS[0].debits)
  );
  const [creditChoices, setCreditChoices] = useState<string[]>(() =>
    emptyChoices(QUESTIONS[0].credits)
  );
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];

  // ── Handlers ────────────────────────────────────────────────────────────

  const setChoice = useCallback(
    (
      side: "debit" | "credit",
      index: number,
      value: string
    ) => {
      if (side === "debit") {
        setDebitChoices((prev) =>
          prev.map((c, i) => (i === index ? value : c))
        );
      } else {
        setCreditChoices((prev) =>
          prev.map((c, i) => (i === index ? value : c))
        );
      }
    },
    []
  );

  const handleCheck = useCallback(() => {
    if (answered || isComplete) return;

    const allFilled =
      debitChoices.every((c) => c !== "") &&
      creditChoices.every((c) => c !== "");

    if (!allFilled) {
      setFeedback("Select an account for every line first.");
      setIsCorrect(null);
      return;
    }

    const debitsCorrect = question.debits.every(
      (line, i) => debitChoices[i] === line.account
    );
    const creditsCorrect = question.credits.every(
      (line, i) => creditChoices[i] === line.account
    );
    const correct = debitsCorrect && creditsCorrect;

    setAnswered(true);
    setIsCorrect(correct);
    setScore((s) => (correct ? s + 1 : s));

    if (correct) {
      setFeedback("Correct! " + question.explain);
    } else {
      const debitAnswer = question.debits
        .map((d) => `${d.account} ${formatCurrency(d.amount)}`)
        .join(", ");
      const creditAnswer = question.credits
        .map((c) => `${c.account} ${formatCurrency(c.amount)}`)
        .join(", ");
      setFeedback(
        `Not quite — the correct entry is Debit ${debitAnswer} / Credit ${creditAnswer}. ${question.explain}`
      );
    }
  }, [answered, isComplete, debitChoices, creditChoices, question]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setIsComplete(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    const next = QUESTIONS[nextIndex];
    setCurrentIndex(nextIndex);
    setDebitChoices(emptyChoices(next.debits));
    setCreditChoices(emptyChoices(next.credits));
    setAnswered(false);
    setIsCorrect(null);
    setFeedback("");
  }, [currentIndex, total]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setDebitChoices(emptyChoices(QUESTIONS[0].debits));
    setCreditChoices(emptyChoices(QUESTIONS[0].credits));
    setAnswered(false);
    setIsCorrect(null);
    setFeedback("");
    setIsComplete(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl bg-navy p-6 text-white">
        <h2 className="font-serif text-xl text-white">Day-to-Day Transactions</h2>
        <p className="mt-1 text-sm text-teal">
          Green Acres Landscaping — build each entry, debit and credit
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
            Transaction {currentIndex + 1} of {total}
          </div>
          <p className="mt-3 text-lg font-medium leading-relaxed text-navy">
            {question.text}
          </p>

          {/* Debit rows */}
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wide text-navy/50">
              Debit
            </div>
            <div className="mt-2 space-y-2">
              {question.debits.map((line, i) => (
                <div
                  key={`debit-${i}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <select
                    aria-label={`Debit line ${i + 1} account`}
                    value={debitChoices[i] ?? ""}
                    disabled={answered}
                    onChange={(e) => setChoice("debit", i, e.target.value)}
                    className={`w-full flex-1 rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-navy transition-colors focus:border-teal focus:outline-none disabled:cursor-default ${
                      answered
                        ? isCorrect
                          ? "border-green-600 bg-green-50"
                          : "border-red-300"
                        : "border-ice-blue"
                    }`}
                  >
                    <option value="">Select an account…</option>
                    {ACCOUNTS.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  <span className="shrink-0 text-right font-bold tabular-nums text-navy sm:w-20">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit rows */}
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wide text-navy/50">
              Credit
            </div>
            <div className="mt-2 space-y-2">
              {question.credits.map((line, i) => (
                <div
                  key={`credit-${i}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <select
                    aria-label={`Credit line ${i + 1} account`}
                    value={creditChoices[i] ?? ""}
                    disabled={answered}
                    onChange={(e) => setChoice("credit", i, e.target.value)}
                    className={`w-full flex-1 rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-navy transition-colors focus:border-teal focus:outline-none disabled:cursor-default ${
                      answered
                        ? isCorrect
                          ? "border-green-600 bg-green-50"
                          : "border-red-300"
                        : "border-ice-blue"
                    }`}
                  >
                    <option value="">Select an account…</option>
                    {ACCOUNTS.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  <span className="shrink-0 text-right font-bold tabular-nums text-navy sm:w-20">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Check button */}
          {!answered && (
            <button
              type="button"
              onClick={handleCheck}
              className="mt-5 w-full rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
            >
              Check Entry
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
              {currentIndex + 1 >= total ? "See Results →" : "Next Transaction →"}
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
              ? "Perfect score! Sales, expenses, and payroll are clicking."
              : score >= total * 0.6
              ? "Solid work — review any explanations that felt shaky, especially the payroll entry."
              : "This one takes practice, especially payroll — consider re-reading the lesson and trying again."}
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
