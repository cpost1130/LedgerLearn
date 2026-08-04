"use client";

import { useState } from "react";

type Question = { tool: string; text: string; options: string[]; answer: string; explain: string };
const QUESTIONS: Question[] = [
  { tool: "QuickBooks Online", text: 'Maria wants to rename a generic default account to "Catering Revenue." Where does she go?', options: ["Bookkeeping → Chart of Accounts", "Reports → Trial Balance", "Bookkeeping → Reconcile"], answer: "Bookkeeping → Chart of Accounts", explain: "The Chart of Accounts is where account names and categories live and get edited." },
  { tool: "QuickBooks Online", text: "A customer pays Maria $40 cash on the spot for pastries. Which screen records it?", options: ["Sales → New Invoice", "Sales → New Sales Receipt", "Expenses → New Expense"], answer: "Sales → New Sales Receipt", explain: "A Sales Receipt is for immediate payment; an Invoice is paid later." },
  { tool: "QuickBooks Online", text: "Maria wants to match her bank's transactions against what's already in her books. Where does she go?", options: ["Bookkeeping → Reconcile", "Reports → Profit and Loss", "Sales → New Invoice"], answer: "Bookkeeping → Reconcile", explain: "Reconcile connects the bank feed and lets Maria match or correct transactions." },
  { tool: "Excel", text: "In a 3-tab Excel system, which tab holds one row per transaction?", options: ["Chart of Accounts tab", "Transactions tab", "Summary tab"], answer: "Transactions tab", explain: "The Transactions tab is the journal: every transaction is logged as a row." },
  { tool: "Excel", text: "Which formula totals debits or credits for a specific account?", options: ["SUMIF", "VLOOKUP", "COUNTA"], answer: "SUMIF", explain: "SUMIF totals values based on a matching condition in another column." },
  { tool: "Excel", text: "True or False: Excel automatically stops Maria entering a transaction that doesn't balance.", options: ["True", "False"], answer: "False", explain: "Excel can flag an unbalanced entry with a formula, but does not enforce balance." },
];

export function SoftwareWalkthroughExercise() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const q = QUESTIONS[current];
  const choose = (option: string) => { if (selected) return; setSelected(option); if (option === q.answer) setScore((s) => s + 1); };
  const next = () => { if (current === QUESTIONS.length - 1) setComplete(true); else { setCurrent((c) => c + 1); setSelected(null); } };
  const restart = () => { setCurrent(0); setScore(0); setSelected(null); setComplete(false); };
  if (complete) return <div className="rounded-xl border border-ice-blue bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-teal">Exercise Complete</p><p className="my-3 font-serif text-4xl text-teal">{score} / {QUESTIONS.length}</p><p className="text-sm text-navy/70">{score === QUESTIONS.length ? "Perfect score! You know your way around QuickBooks Online and Excel." : score >= 4 ? "Solid work — review any explanations that felt shaky." : "Review the lesson and try again to build confidence."}</p><button onClick={restart} className="mt-6 rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-deep-blue">Try Again</button></div>;
  return <div className="space-y-4"><div className="rounded-xl bg-navy p-6 text-white"><h2 className="font-serif text-xl">Software Walkthrough</h2><p className="mt-1 text-sm text-teal/80">Maria&apos;s Bakery — where does this actually happen?</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-teal transition-all" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} /></div></div><div className="rounded-xl border border-ice-blue bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-teal">Question {current + 1} of {QUESTIONS.length}</p><span className="mt-3 inline-block rounded bg-teal/20 px-2 py-1 text-[11px] font-bold uppercase text-navy">{q.tool}</span><p className="mt-3 text-base leading-relaxed text-navy">{q.text}</p><div className="mt-5 space-y-2">{q.options.map((option) => { const isAnswer = option === q.answer; const picked = option === selected; return <button key={option} onClick={() => choose(option)} disabled={!!selected} className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${selected && isAnswer ? "border-teal bg-teal text-white" : selected && picked ? "border-red-500 bg-red-500 text-white" : "border-navy bg-white text-navy hover:border-teal"}`}>{option}</button>; })}</div>{selected && <p className={`mt-4 rounded-lg p-3 text-sm leading-relaxed ${selected === q.answer ? "bg-teal/10 text-teal" : "bg-red-50 text-red-700"}`}>{selected === q.answer ? "Correct! " : `Not quite — the correct answer is “${q.answer}”. `}{q.explain}</p>}{selected && <button onClick={next} className="mt-4 w-full rounded-lg bg-teal px-4 py-3 font-semibold text-white hover:bg-deep-blue">{current === QUESTIONS.length - 1 ? "See Results →" : "Next Question →"}</button>}</div></div>;
}
