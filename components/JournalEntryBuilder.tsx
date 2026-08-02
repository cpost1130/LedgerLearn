"use client";

import { useCallback, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface JournalEntryQuestion {
  text: string;
  /** Correct account for the debit side */
  debit: string;
  /** Correct account for the credit side */
  credit: string;
  /** Dollar amount of the entry (same on both sides) */
  amount: number;
  explanation: string;
}

interface TrialBalanceRow {
  debit: string;
  credit: string;
  amount: number;
}

// ── Diego's Bike Shop Questions (from journal_entry_builder.html) ───────────

const ACCOUNTS = [
  "Cash",
  "Parts Inventory",
  "Equipment",
  "Accounts Payable",
  "Repair Revenue",
  "Rental Revenue",
  "Wages Expense",
];

const QUESTIONS: JournalEntryQuestion[] = [
  {
    text: "Diego repairs a customer's bike for $95, paid in cash.",
    debit: "Cash",
    credit: "Repair Revenue",
    amount: 95,
    explanation:
      "Cash increases (Debit) from the payment; Repair Revenue increases (Credit) because the service was earned.",
  },
  {
    text: "Diego rents out 3 bikes for $45 total, paid in cash.",
    debit: "Cash",
    credit: "Rental Revenue",
    amount: 45,
    explanation:
      "Cash increases (Debit); Rental Revenue increases (Credit) because rental income was earned.",
  },
  {
    text: "Diego buys $200 of new inner tubes, paying with the shop's cash.",
    debit: "Parts Inventory",
    credit: "Cash",
    amount: 200,
    explanation:
      "Parts Inventory increases (Debit); Cash decreases (Credit) because it was paid immediately.",
  },
  {
    text: "Diego pays his part-time mechanic $250 in wages, in cash.",
    debit: "Wages Expense",
    credit: "Cash",
    amount: 250,
    explanation:
      "Wages Expense increases (Debit); Cash decreases (Credit) because it was paid out.",
  },
  {
    text: "Diego orders a $500 bike rack display from a supplier, to be paid in 30 days.",
    debit: "Equipment",
    credit: "Accounts Payable",
    amount: 500,
    explanation:
      "Equipment increases (Debit) because the shop now owns it; Accounts Payable increases (Credit) because it's owed, not yet paid.",
  },
  {
    text: "Diego sells $60 of spare parts to a customer for cash.",
    debit: "Cash",
    credit: "Parts Inventory",
    amount: 60,
    explanation:
      "Note: for simplicity, this entry treats the parts sale as reducing inventory directly — Cash increases (Debit), Parts Inventory decreases (Credit).",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

// ── Component ───────────────────────────────────────────────────────────────

export function JournalEntryBuilder() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [debitChoice, setDebitChoice] = useState("");
  const [creditChoice, setCreditChoice] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];

  const debitTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const creditTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const inBalance = debitTotal === creditTotal;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleCheck = useCallback(() => {
    if (answered || isComplete) return;
    if (!debitChoice || !creditChoice) {
      setFeedback("Select an account for both the debit and credit side first.");
      setIsCorrect(null);
      return;
    }

    const correct =
      debitChoice === question.debit && creditChoice === question.credit;
    setAnswered(true);
    setIsCorrect(correct);
    setScore((s) => (correct ? s + 1 : s));

    if (correct) {
      setFeedback("Correct! " + question.explanation);
    } else {
      setFeedback(
        `Not quite — the correct entry is Debit ${question.debit} / Credit ${question.credit}. ${question.explanation}`
      );
    }

    // Every recorded entry (right or wrong) still posts to the trial balance
    setRows((prev) => [
      ...prev,
      {
        debit: question.debit,
        credit: question.credit,
        amount: question.amount,
      },
    ]);
  }, [answered, isComplete, debitChoice, creditChoice, question]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setDebitChoice("");
      setCreditChoice("");
      setAnswered(false);
      setIsCorrect(null);
      setFeedback("");
    }
  }, [currentIndex, total]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setDebitChoice("");
    setCreditChoice("");
    setAnswered(false);
    setIsCorrect(null);
    setFeedback("");
    setRows([]);
    setIsComplete(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl bg-navy p-6 text-white">
        <h2 className="font-serif text-xl text-white">Journal Entry Builder</h2>
        <p className="mt-1 text-sm text-teal">
          Diego&apos;s Bike Shop — build the entry, then watch the trial balance
          grow
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

          {/* Entry builder */}
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="journal-debit"
                className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-navy/50"
              >
                Debit
              </label>
              <select
                id="journal-debit"
                value={debitChoice}
                disabled={answered}
                onChange={(e) => setDebitChoice(e.target.value)}
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
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="journal-credit"
                className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-navy/50"
              >
                Credit
              </label>
              <select
                id="journal-credit"
                value={creditChoice}
                disabled={answered}
                onChange={(e) => setCreditChoice(e.target.value)}
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

      {/* Running trial balance */}
      <TrialBalance
        rows={rows}
        debitTotal={debitTotal}
        creditTotal={creditTotal}
        inBalance={inBalance}
        isComplete={isComplete}
      />

      {/* Summary */}
      {isComplete && (
        <div className="rounded-xl border border-ice-blue bg-white p-8 text-center shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal">
            Exercise Complete
          </div>
          <div className="mt-2 text-5xl font-extrabold text-teal">
            {score}{" "}
            <span className="text-2xl font-bold text-navy/40">/ {total}</span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy/60">
            {score === total
              ? "Perfect score! You've got journal entries down."
              : score >= total * 0.6
              ? "Solid work — review the explanations above if any felt shaky."
              : "Journal entries take practice — consider re-reading the lesson and trying again."}
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

// ── Running Trial Balance ───────────────────────────────────────────────────

function TrialBalance({
  rows,
  debitTotal,
  creditTotal,
  inBalance,
  isComplete,
}: {
  rows: TrialBalanceRow[];
  debitTotal: number;
  creditTotal: number;
  inBalance: boolean;
  isComplete: boolean;
}) {
  if (rows.length === 0 && !isComplete) {
    return (
      <div className="rounded-xl border border-dashed border-ice-blue bg-white p-6 text-center">
        <p className="text-sm text-navy/40">
          Your running trial balance will appear here as you record each entry.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ice-blue bg-white p-6 shadow-sm">
      <h3 className="font-serif text-lg text-navy">Running Trial Balance</h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-navy">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-navy/60">
                Entry
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-navy/60">
                Debit
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-navy/60">
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-ice-blue">
                <td className="px-3 py-2 text-navy">
                  <span className="font-medium">{row.debit}</span>
                  <span className="text-navy/40"> / </span>
                  <span className="font-medium">{row.credit}</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy">
                  {formatCurrency(row.amount)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy">
                  {formatCurrency(row.amount)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2.5 font-bold text-navy">Totals</td>
              <td className="px-3 py-2.5 text-right font-bold tabular-nums text-navy">
                {formatCurrency(debitTotal)}
              </td>
              <td className="px-3 py-2.5 text-right font-bold tabular-nums text-navy">
                {formatCurrency(creditTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Balance indicator */}
      {rows.length > 0 && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-center ${
            inBalance ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          <span
            className={`text-sm font-bold ${
              inBalance ? "text-green-700" : "text-amber-700"
            }`}
          >
            {inBalance
              ? "✓ In balance — total debits equal total credits"
              : "Not in balance — total debits do not equal total credits"}
          </span>
        </div>
      )}

      {rows.length > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-navy/50">
          Every journal entry posts equal debits and credits, so the trial
          balance stays in balance — that&apos;s the same check a real
          bookkeeper runs before building financial statements.
        </p>
      )}
    </div>
  );
}
