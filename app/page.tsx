import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28 lg:py-36">
          <p className="mb-3 font-sans text-sm font-medium uppercase tracking-widest text-teal">
            Online Course
          </p>
          <h1 className="text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Bookkeeping Basics
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy/75 md:text-xl">
            Master the fundamentals of bookkeeping — no experience required.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy/65">
            A self-paced online course for small business owners,
            career-changers, and curious learners who find bookkeeping
            intimidating. Covers the accounting equation, debits/credits,
            T-accounts, and more — with hands-on interactive exercises, not just
            reading.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-teal px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue no-underline"
            >
              Start Learning
            </Link>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-navy/70 underline underline-offset-2 transition-colors hover:text-deep-blue"
            >
              Already enrolled? Sign in
            </Link>
          </div>
        </div>

        {/* subtle bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-ice-blue" />
      </section>

      {/* ── What You'll Learn ── */}
      <section className="bg-ice-blue px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl md:text-4xl">
            What You&rsquo;ll Learn
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {learnItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ice-blue text-teal">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg">{item.title}</h3>
                <p className="text-sm leading-relaxed text-navy/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl md:text-4xl">
            How It Works
          </h2>

          <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-1 flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-xl font-bold text-white shadow-sm">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-navy/10 bg-ice-blue px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="font-serif text-lg font-bold text-navy">
            LedgerLearn
          </p>
          <p className="text-sm text-navy/55">
            &copy; {new Date().getFullYear()} LedgerLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ── Icon SVGs (inline so we avoid an icon-lib dependency) ── */

const IconEquation = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M4 6h6M4 12h10M4 18h6" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="16" cy="18" r="2" />
    <line x1="14" y1="18" x2="18" y2="12" />
  </svg>
);

const IconTAccounts = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M12 3v18M3 3h18M3 21h18" />
    <circle cx="8" cy="9" r="1" fill="currentColor" />
    <circle cx="17" cy="16" r="1" fill="currentColor" />
  </svg>
);

const IconCashAccrual = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconPractice = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <polyline points="9 10 11 12 15 8" />
  </svg>
);

const learnItems = [
  {
    title: "The Accounting Equation & Debits/Credits",
    description:
      "Understand the core foundation: Assets = Liabilities + Equity, and how debits and credits keep everything in balance.",
    icon: IconEquation,
  },
  {
    title: "T-Accounts & Journal Entries",
    description:
      "Learn to visualize transactions with T-accounts, then record proper journal entries like a pro.",
    icon: IconTAccounts,
  },
  {
    title: "Cash vs. Accrual Basis",
    description:
      "Grasp the key difference between cash and accrual accounting and when each one matters.",
    icon: IconCashAccrual,
  },
  {
    title: "Hands-on Practice with Instant Feedback",
    description:
      "Apply what you learn right away with interactive exercises that tell you immediately whether you got it right.",
    icon: IconPractice,
  },
];

const steps = [
  {
    title: "Sign Up",
    description:
      "Create your free account in seconds and unlock Module 1 of the course.",
  },
  {
    title: "Learn at Your Own Pace",
    description:
      "Work through bite-sized lessons with clear explanations, slides, and examples — whenever it fits your schedule.",
  },
  {
    title: "Practice Interactively",
    description:
      "Reinforce every concept with hands-on exercises that give you instant feedback so you know you're on track.",
  },
];
