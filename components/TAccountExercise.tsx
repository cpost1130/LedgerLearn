"use client";

import { useState, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
  id: number;
  description: string;
  firstAccount: string;
  firstAmount: number;
  /** Whether the first account is a debit or credit — the correct answer the student must pick */
  firstType: "debit" | "credit";
  secondAccount: string;
  secondAmount: number;
  explanation: string;
}

interface AnsweredTransaction {
  transaction: Transaction;
  studentAnswer: "debit" | "credit";
  isCorrect: boolean;
}

/** A single ledger entry (account + amount) shown on one side of the T-account */
interface LedgerEntry {
  account: string;
  amount: number;
}

// ── Sample Transactions ─────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "Maria's Bakery invests $10,000 cash to start the business.",
    firstAccount: "Cash",
    firstAmount: 10000,
    firstType: "debit",
    secondAccount: "Owner's Equity",
    secondAmount: 10000,
    explanation:
      "Cash (an asset) is increasing, so we debit Cash. Owner's Equity is increasing, so we credit Owner's Equity.",
  },
  {
    id: 2,
    description: "Purchased baking equipment for $3,000 cash.",
    firstAccount: "Equipment",
    firstAmount: 3000,
    firstType: "debit",
    secondAccount: "Cash",
    secondAmount: 3000,
    explanation:
      "Equipment (an asset) is increasing, so we debit Equipment. Cash is decreasing, so we credit Cash.",
  },
  {
    id: 3,
    description: "Bought $500 of flour and sugar on credit from Supplier Co.",
    firstAccount: "Supplies",
    firstAmount: 500,
    firstType: "debit",
    secondAccount: "Accounts Payable",
    secondAmount: 500,
    explanation:
      "Supplies (an asset) is increasing, so we debit Supplies. Accounts Payable (a liability) is increasing, so we credit Accounts Payable.",
  },
  {
    id: 4,
    description: "Sold $800 of baked goods for cash.",
    firstAccount: "Cash",
    firstAmount: 800,
    firstType: "debit",
    secondAccount: "Revenue",
    secondAmount: 800,
    explanation:
      "Cash (an asset) is increasing, so we debit Cash. Revenue is increasing, and revenue accounts are increased with credits.",
  },
  {
    id: 5,
    description: "Paid $200 to Supplier Co (partial payment).",
    firstAccount: "Accounts Payable",
    firstAmount: 200,
    firstType: "debit",
    secondAccount: "Cash",
    secondAmount: 200,
    explanation:
      "Accounts Payable (a liability) is decreasing, so we debit Accounts Payable. Cash is decreasing, so we credit Cash.",
  },
  {
    id: 6,
    description: "Paid $100 for monthly utilities.",
    firstAccount: "Utilities Expense",
    firstAmount: 100,
    firstType: "debit",
    secondAccount: "Cash",
    secondAmount: 100,
    explanation:
      "Utilities Expense is increasing, and expenses are increased with debits. Cash is decreasing, so we credit Cash.",
  },
  {
    id: 7,
    description: "Maria withdrew $500 for personal use.",
    firstAccount: "Owner's Draw",
    firstAmount: 500,
    firstType: "debit",
    secondAccount: "Cash",
    secondAmount: 500,
    explanation:
      "Owner's Draw (a contra-equity account) is increasing, so we debit Owner's Draw. Cash is decreasing, so we credit Cash.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

// ── Component ───────────────────────────────────────────────────────────────

export function TAccountExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnsweredTransaction[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"debit" | "credit" | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const totalTransactions = TRANSACTIONS.length;
  const currentTransaction = TRANSACTIONS[currentIndex];

  // ── Compute the running T-account ledger from all answered transactions ──

  const ledger = answers.reduce(
    (acc, a) => {
      const t = a.transaction;
      if (t.firstType === "debit") {
        acc.debits.push({ account: t.firstAccount, amount: t.firstAmount });
        acc.credits.push({ account: t.secondAccount, amount: t.secondAmount });
      } else {
        acc.debits.push({ account: t.secondAccount, amount: t.secondAmount });
        acc.credits.push({ account: t.firstAccount, amount: t.firstAmount });
      }
      return acc;
    },
    { debits: [] as LedgerEntry[], credits: [] as LedgerEntry[] }
  );

  const debitTotal = ledger.debits.reduce((sum, e) => sum + e.amount, 0);
  const creditTotal = ledger.credits.reduce((sum, e) => sum + e.amount, 0);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (answer: "debit" | "credit") => {
      if (selectedAnswer !== null || !currentTransaction) return;

      const isCorrect = answer === currentTransaction.firstType;
      setSelectedAnswer(answer);
      setFeedback({
        isCorrect,
        message: isCorrect
          ? currentTransaction.explanation
          : `Not quite. ${currentTransaction.explanation}`,
      });

      setAnswers((prev) => [
        ...prev,
        {
          transaction: currentTransaction,
          studentAnswer: answer,
          isCorrect,
        },
      ]);
    },
    [selectedAnswer, currentTransaction]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalTransactions) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    }
  }, [currentIndex, totalTransactions]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setFeedback(null);
    setSelectedAnswer(null);
    setIsComplete(false);
  }, []);

  const score = answers.filter((a) => a.isCorrect).length;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Progress indicator ── */}
      {!isComplete && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-ice-blue">
              <div
                className="h-2 rounded-full bg-teal transition-all duration-500"
                style={{
                  width: `${((currentIndex + (selectedAnswer ? 1 : 0)) / totalTransactions) * 100}%`,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-navy/60">
            {currentIndex + 1} of {totalTransactions}
          </span>
        </div>
      )}

      {/* ── Transaction Card ── */}
      {!isComplete && currentTransaction && (
        <div className="rounded-xl border border-ice-blue bg-white p-6 shadow-sm">
          <p className="text-lg font-medium text-navy">
            {currentTransaction.description}
          </p>
          <p className="mt-3 text-navy/70">
            <span className="font-semibold text-navy">
              {currentTransaction.firstAccount}
            </span>
            : {formatCurrency(currentTransaction.firstAmount)}
          </p>
          <p className="mt-1 text-sm text-navy/50">
            Is this first account a <strong>Debit</strong> or{" "}
            <strong>Credit</strong>?
          </p>

          {/* Answer buttons */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswer("debit")}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                selectedAnswer === "debit"
                  ? feedback?.isCorrect
                    ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                    : "bg-red-100 text-red-700 ring-2 ring-red-500"
                  : "bg-navy text-white hover:bg-navy/90"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Debit
            </button>
            <button
              type="button"
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswer("credit")}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                selectedAnswer === "credit"
                  ? feedback?.isCorrect
                    ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                    : "bg-red-100 text-red-700 ring-2 ring-red-500"
                  : "bg-teal text-white hover:bg-deep-blue"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Credit
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                feedback.isCorrect
                  ? "border border-green-200 bg-green-50"
                  : "border border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  feedback.isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {feedback.isCorrect ? "✓ Correct!" : "✗ Not quite"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  feedback.isCorrect ? "text-green-800" : "text-red-800"
                }`}
              >
                {feedback.message}
              </p>
            </div>
          )}

          {/* Next button */}
          {selectedAnswer !== null && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep-blue"
            >
              {currentIndex + 1 >= totalTransactions
                ? "See Results"
                : "Next →"}
            </button>
          )}
        </div>
      )}

      {/* ── Live T-Account Ledger ── */}
      <TAccountLedger
        entries={ledger}
        debitTotal={debitTotal}
        creditTotal={creditTotal}
        isComplete={isComplete}
      />

      {/* ── End-of-Exercise Summary ── */}
      {isComplete && (
        <div className="rounded-xl border border-ice-blue bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
            <span className="text-3xl">
              {score === totalTransactions ? "🎉" : score >= totalTransactions / 2 ? "👍" : "📚"}
            </span>
          </div>

          <h2 className="text-center font-serif text-2xl text-navy">
            Exercise Complete
          </h2>

          <div className="mt-4 text-center">
            <p className="text-4xl font-bold text-teal">
              {score} / {totalTransactions}
            </p>
            <p className="mt-1 text-navy/60">
              {score === totalTransactions
                ? "Perfect score! You've got a solid grasp of debits and credits."
                : score >= totalTransactions / 2
                ? "Good work! Review the explanations below and try again to improve."
                : "Keep practicing! Debits and credits take time to master."}
            </p>
          </div>

          {/* Debit = Credit explanation */}
          <div className="mt-6 rounded-lg bg-ice-blue/50 p-5">
            <h3 className="font-serif text-lg text-navy">Why Debits = Credits</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              In double-entry bookkeeping, <strong>total debits must always equal total
              credits</strong>. This is because every transaction affects at least two
              accounts — when you debit one account, you credit another by the same
              amount. The T-account ledger below shows debit and credit totals of{" "}
              <strong>{formatCurrency(debitTotal)}</strong> each — they balance!
              This built-in check is one of the reasons double-entry bookkeeping has
              been the gold standard for over 500 years.
            </p>
          </div>

          {/* Restart button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
            >
              Restart Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── T-Account Ledger Sub-component ──────────────────────────────────────────

function TAccountLedger({
  entries,
  debitTotal,
  creditTotal,
  isComplete,
}: {
  entries: { debits: LedgerEntry[]; credits: LedgerEntry[] };
  debitTotal: number;
  creditTotal: number;
  isComplete: boolean;
}) {
  const hasEntries = entries.debits.length > 0 || entries.credits.length > 0;

  if (!hasEntries && !isComplete) {
    return (
      <div className="rounded-xl border border-dashed border-ice-blue bg-white p-6 text-center">
        <p className="text-sm text-navy/40">
          The T-Account ledger will appear here as you answer each transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ice-blue bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-center font-serif text-lg text-navy">
        T-Account Ledger
      </h3>

      {/* Two-column layout: stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {/* Debit column */}
        <div>
          <div className="rounded-t-lg bg-navy px-4 py-2 text-center">
            <span className="text-sm font-bold tracking-wider text-white">
              DEBIT
            </span>
          </div>
          <div className="min-h-[120px] rounded-b-lg border-x border-b border-navy/20 bg-white">
            {entries.debits.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-sm text-navy/30">No entries yet</span>
              </div>
            ) : (
              <div className="divide-y divide-ice-blue">
                {entries.debits.map((entry, i) => (
                  <div
                    key={`debit-${i}`}
                    className="flex items-center justify-between px-3 py-2.5 animate-[fadeIn_0.3s_ease-out]"
                  >
                    <span className="text-sm text-navy">{entry.account}</span>
                    <span className="text-sm font-medium tabular-nums text-navy">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Debit total */}
          <div className="rounded-b-lg border-x border-b border-teal bg-teal/5 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal">Total Debits</span>
              <span className="text-sm font-bold tabular-nums text-teal">
                {formatCurrency(debitTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Credit column */}
        <div>
          <div className="rounded-t-lg bg-teal px-4 py-2 text-center">
            <span className="text-sm font-bold tracking-wider text-white">
              CREDIT
            </span>
          </div>
          <div className="min-h-[120px] rounded-b-lg border-x border-b border-teal/30 bg-white">
            {entries.credits.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-sm text-navy/30">No entries yet</span>
              </div>
            ) : (
              <div className="divide-y divide-ice-blue">
                {entries.credits.map((entry, i) => (
                  <div
                    key={`credit-${i}`}
                    className="flex items-center justify-between px-3 py-2.5 animate-[fadeIn_0.3s_ease-out]"
                  >
                    <span className="text-sm text-navy">{entry.account}</span>
                    <span className="text-sm font-medium tabular-nums text-navy">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Credit total */}
          <div className="rounded-b-lg border-x border-b border-teal bg-teal/5 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal">
                Total Credits
              </span>
              <span className="text-sm font-bold tabular-nums text-teal">
                {formatCurrency(creditTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance indicator */}
      {hasEntries && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-center text-sm font-medium ${
            debitTotal === creditTotal
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {debitTotal === creditTotal
            ? `✓ Balanced: Debits equal Credits (${formatCurrency(debitTotal)})`
            : `⚠ Debits (${formatCurrency(debitTotal)}) ≠ Credits (${formatCurrency(creditTotal)})`}
        </div>
      )}
    </div>
  );
}
