"use client";

import { useCallback, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Question {
  text: string;
  /** Correct side for the Cash account on this transaction */
  answer: "debit" | "credit";
  /** Dollar amount of the Cash movement */
  amount: number;
  explanation: string;
}

interface LedgerRow {
  side: "debit" | "credit";
  amount: number;
}

// ── Maria's Bakery Questions (from t_account_practice.html) ─────────────────

const QUESTIONS: Question[] = [
  {
    text: "Maria sells $40 of pastries for cash.",
    answer: "debit",
    amount: 40,
    explanation:
      "Cash (an asset) increases, so it's recorded as a Debit.",
  },
  {
    text: "Maria pays $75 cash for flour.",
    answer: "credit",
    amount: 75,
    explanation:
      "Cash (an asset) decreases, so it's recorded as a Credit.",
  },
  {
    text: "A customer pays Maria $120 cash for a catering order.",
    answer: "debit",
    amount: 120,
    explanation:
      "Cash increases when a customer pays, so it's a Debit.",
  },
  {
    text: "Maria pays her assistant $60 in cash wages.",
    answer: "credit",
    amount: 60,
    explanation:
      "Cash decreases when wages are paid out, so it's a Credit.",
  },
  {
    text:
      "Maria deposits an extra $200 of her own money into the business bank account.",
    answer: "debit",
    amount: 200,
    explanation:
      "Cash increases with the owner's deposit, so it's a Debit (Equity increases too, as a Credit — but we're tracking Cash here).",
  },
  {
    text: "Maria pays $90 cash for the electricity bill.",
    answer: "credit",
    amount: 90,
    explanation:
      "Cash decreases when a bill is paid, so it's a Credit.",
  },
  {
    text: "Maria sells $65 of bread for cash.",
    answer: "debit",
    amount: 65,
    explanation:
      "Cash increases with the sale, so it's a Debit.",
  },
  {
    text: "Maria pays $50 cash to repair the oven.",
    answer: "credit",
    amount: 50,
    explanation:
      "Cash decreases with the repair payment, so it's a Credit.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

// ── Component ───────────────────────────────────────────────────────────────

export function TAccountExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<"debit" | "credit" | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];

  const debitTotal = ledger
    .filter((r) => r.side === "debit")
    .reduce((sum, r) => sum + r.amount, 0);
  const creditTotal = ledger
    .filter((r) => r.side === "credit")
    .reduce((sum, r) => sum + r.amount, 0);
  const balance = debitTotal - creditTotal;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (answer: "debit" | "credit") => {
      if (chosen !== null || isComplete) return;
      const correct = answer === question.answer;
      setChosen(answer);
      setIsCorrect(correct);
      if (correct) setScore((s) => s + 1);
      setLedger((prev) => [
        ...prev,
        { side: question.answer, amount: question.amount },
      ]);
    },
    [chosen, isComplete, question]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setChosen(null);
      setIsCorrect(null);
    }
  }, [currentIndex, total]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setChosen(null);
    setIsCorrect(null);
    setLedger([]);
    setIsComplete(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl bg-navy p-6 text-white">
        <h2 className="font-serif text-xl text-white">T-Account Practice</h2>
        <p className="mt-1 text-sm text-teal">
          Maria&apos;s Bakery — pick Debit or Credit for each transaction
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{
              width: `${
                isComplete
                  ? 100
                  : ((currentIndex + (chosen !== null ? 1 : 0)) / total) * 100
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
          <p className="mt-3 text-lg font-medium leading-relaxed text-navy">
            {question.text}
          </p>
          <p className="mt-2 text-sm text-navy/50">
            For the <strong>Cash</strong> account, is this a{" "}
            <strong>Debit</strong> or a <strong>Credit</strong>?
          </p>

          {/* Answer buttons */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={chosen !== null}
              onClick={() => handleAnswer("debit")}
              className={`flex-1 rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all ${
                chosen === "debit"
                  ? isCorrect
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-red-600 bg-red-600 text-white"
                  : chosen !== null
                  ? question.answer === "debit"
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-ice-blue bg-white text-navy opacity-50"
                  : "border-navy bg-white text-navy hover:bg-navy hover:text-white"
              } disabled:cursor-default`}
            >
              Debit
            </button>
            <button
              type="button"
              disabled={chosen !== null}
              onClick={() => handleAnswer("credit")}
              className={`flex-1 rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all ${
                chosen === "credit"
                  ? isCorrect
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-red-600 bg-red-600 text-white"
                  : chosen !== null
                  ? question.answer === "credit"
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-ice-blue bg-white text-navy opacity-50"
                  : "border-navy bg-white text-navy hover:bg-navy hover:text-white"
              } disabled:cursor-default`}
            >
              Credit
            </button>
          </div>

          {/* Feedback */}
          {chosen !== null && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {isCorrect ? "✓ Correct!" : "✗ Not quite."}
              </p>
              <p
                className={`mt-1 text-sm leading-relaxed ${
                  isCorrect ? "text-green-800" : "text-red-800"
                }`}
              >
                {question.explanation}
              </p>
            </div>
          )}

          {/* Next button */}
          {chosen !== null && (
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

      {/* Live Cash ledger */}
      <CashLedger
        rows={ledger}
        debitTotal={debitTotal}
        creditTotal={creditTotal}
        balance={balance}
        isComplete={isComplete}
      />

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
              ? "Perfect score! You've got debits and credits down."
              : score >= total * 0.6
              ? "Solid work — review the explanations above if any felt shaky."
              : "Debits and credits take practice — consider re-reading the lesson and trying again."}
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

// ── Cash T-Account Ledger ───────────────────────────────────────────────────

function CashLedger({
  rows,
  debitTotal,
  creditTotal,
  balance,
  isComplete,
}: {
  rows: LedgerRow[];
  debitTotal: number;
  creditTotal: number;
  balance: number;
  isComplete: boolean;
}) {
  if (rows.length === 0 && !isComplete) {
    return (
      <div className="rounded-xl border border-dashed border-ice-blue bg-white p-6 text-center">
        <p className="text-sm text-navy/40">
          The Cash T-account ledger will appear here as you answer each
          transaction.
        </p>
      </div>
    );
  }

  const debitRows = rows.filter((r) => r.side === "debit");
  const creditRows = rows.filter((r) => r.side === "credit");
  const maxRows = Math.max(debitRows.length, creditRows.length);

  return (
    <div className="rounded-xl border border-ice-blue bg-white p-6 shadow-sm">
      <h3 className="text-center font-serif text-lg text-navy">
        Live Ledger — Cash Account
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-navy">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-navy/60">
                Debit
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-navy/60">
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(maxRows, 3) }).map((_, i) => (
              <tr key={i} className="border-b border-ice-blue">
                <td className="px-3 py-2 text-left tabular-nums text-navy">
                  {debitRows[i] ? formatCurrency(debitRows[i].amount) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy">
                  {creditRows[i] ? formatCurrency(creditRows[i].amount) : ""}
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2.5 text-left font-bold text-navy">
                Total Debits: {formatCurrency(debitTotal)}
              </td>
              <td className="px-3 py-2.5 text-right font-bold text-navy">
                Total Credits: {formatCurrency(creditTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Balance */}
      <div className="mt-4 rounded-lg bg-ice-blue/50 px-4 py-3 text-center">
        <span className="text-sm font-bold text-navy">
          Balance:{" "}
          <span className={balance < 0 ? "text-red-600" : "text-teal"}>
            {formatCurrency(balance)}
          </span>
        </span>
      </div>

      {/* Balance explainer */}
      {rows.length > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-navy/50">
          Cash is an asset, so it increases with debits and decreases with
          credits. The balance is total debits minus total credits — it tracks
          Maria&apos;s actual cash position as she works through the week.
        </p>
      )}
    </div>
  );
}
