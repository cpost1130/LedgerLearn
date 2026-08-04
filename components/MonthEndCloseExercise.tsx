"use client";

import { useState } from "react";

type ChoiceQuestion = { type: "choice"; text: string; options: string[]; answer: string; explain: string };
type OrderQuestion = { type: "order"; text: string; items: string[]; correctOrder: string[]; explain: string };
type Question = ChoiceQuestion | OrderQuestion;

const QUESTIONS: Question[] = [
  { type: "order", text: "Put Maria's month-end close steps in the correct order.", items: ["Reconcile bank accounts", "Generate the P&L and Balance Sheet", "Record all outstanding transactions", "Run the trial balance"], correctOrder: ["Record all outstanding transactions", "Reconcile bank accounts", "Run the trial balance", "Generate the P&L and Balance Sheet"], explain: "Record everything first, reconcile against the bank, confirm the trial balance, and only then generate reports." },
  { type: "choice", text: "Maria's trial balance shows Debits of $12,400 and Credits of $12,250. What does this tell her?", options: ["The books are fine, small gaps are normal", "There's a $150 error somewhere that needs to be found"], answer: "There's a $150 error somewhere that needs to be found", explain: "Debits and credits must always be equal. A $150 gap signals a missing or mis-recorded entry." },
  { type: "choice", text: "True or False: If the trial balance balances, the books are guaranteed to be free of errors.", options: ["True", "False"], answer: "False", explain: "A balanced trial balance will not catch an entry posted to the wrong (but same-type) account." },
  { type: "choice", text: "Maria recorded a $75 supply purchase as a debit to Repair Expense instead of Supplies Expense. Would this throw off her trial balance?", options: ["Yes, it would be out of balance", "No, it would still balance"], answer: "No, it would still balance", explain: "Both accounts are expenses, so the debit lands on the correct side. The P&L is still wrong by category." },
  { type: "choice", text: "Maria forgot to record a $150 catering payment's debit to Cash — only the credit to Revenue was entered. What would this cause?", options: ["Nothing — Revenue was recorded correctly", "The trial balance would be out of balance"], answer: "The trial balance would be out of balance", explain: "Every transaction needs both a debit and a credit. A single-sided entry is a common beginner mistake." },
];

export function MonthEndCloseExercise() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[] | string>>({});
  const [checked, setChecked] = useState(false);
  const [complete, setComplete] = useState(false);
  const q = QUESTIONS[current];
  const answer = answers[current];
  const isCorrect = q.type === "order" ? JSON.stringify(answer) === JSON.stringify(q.correctOrder) : answer === q.answer;

  function check() { if (!checked && answer && (q.type !== "order" || ((answer as string[]).length === q.items.length && (answer as string[]).every(Boolean) && new Set(answer as string[]).size === q.items.length))) { setChecked(true); if (isCorrect) setScore((s) => s + 1); } }
  function next() { if (current === QUESTIONS.length - 1) setComplete(true); else { setCurrent((n) => n + 1); setChecked(false); } }
  function restart() { setCurrent(0); setScore(0); setAnswers({}); setChecked(false); setComplete(false); }

  if (complete) return <div className="rounded-xl border border-ice-blue bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-teal">Exercise Complete</p><p className="my-3 font-serif text-4xl font-bold text-teal">{score} / {QUESTIONS.length}</p><p className="text-sm text-navy/65">{score === QUESTIONS.length ? "Perfect score! Maria's books are ready to close." : "Solid work — review the explanations and try again."}</p><button onClick={restart} className="mt-6 rounded-lg bg-navy px-5 py-3 font-semibold text-white hover:bg-deep-blue">Try Again</button></div>;

  return <div className="space-y-4">
    <div className="rounded-xl bg-navy p-5 text-white"><h2 className="font-serif text-xl">Month-End Close</h2><p className="mt-1 text-sm text-teal/90">Maria&apos;s Bakery — close the month, then spot the mistakes</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-teal transition-all" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} /></div></div>
    <div className={`rounded-xl border p-6 shadow-sm ${checked ? isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50" : "border-ice-blue bg-white"}`}><p className="text-xs font-bold uppercase tracking-widest text-teal">Question {current + 1} of {QUESTIONS.length}</p><p className="mt-3 whitespace-pre-line font-serif text-lg text-navy">{q.text}</p>
      {q.type === "order" ? <div className="mt-5 space-y-2">{q.items.map((item, _i) => <label key={item} className="flex items-center gap-3 rounded-lg bg-ice-blue/50 p-3 text-sm text-navy"><select aria-label={`Order for ${item}`} disabled={checked} value={(answer as string[] | undefined)?.indexOf(item) !== -1 ? ((answer as string[]).indexOf(item) + 1) : ""} onChange={(e) => { const nextAnswer = [...((answer as string[]) || Array(q.items.length).fill(""))]; nextAnswer[Number(e.target.value) - 1] = item; setAnswers((a) => ({ ...a, [current]: nextAnswer })); }} className="rounded border-ice-blue p-2"><option value="">#</option>{q.items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}</select><span>{item}</span></label>)}</div> : <div className="mt-5 grid gap-2">{q.options.map((option) => <button key={option} disabled={checked} onClick={() => setAnswers((a) => ({ ...a, [current]: option }))} className={`rounded-lg border px-4 py-3 text-left text-sm ${answer === option ? "border-teal bg-teal/10" : "border-ice-blue bg-white"} ${checked && option === q.answer ? "border-green-400 bg-green-100" : ""}`}>{option}</button>)}</div>}
      {checked && <p className={`mt-4 rounded-lg p-3 text-sm ${isCorrect ? "bg-teal/10 text-teal" : "bg-red-100 text-red-800"}`}>{isCorrect ? "Correct! " : `Not quite. ${q.type === "order" ? "The correct order is: " + q.correctOrder.join(" → ") + ". " : `The answer is ${q.answer}. `}`}{q.explain}</p>}
      {!checked ? <button onClick={check} disabled={!answer || (q.type === "order" && (answer as string[]).length !== q.items.length)} className="mt-5 w-full rounded-lg bg-navy px-4 py-3 font-semibold text-white hover:bg-deep-blue disabled:opacity-40">Check Answer</button> : <button onClick={next} className="mt-3 w-full rounded-lg bg-teal px-4 py-3 font-semibold text-white">{current === QUESTIONS.length - 1 ? "See Results →" : "Next Question →"}</button>}
    </div>
  </div>;
}
