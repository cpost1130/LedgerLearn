import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateStudent } from "@/lib/students";
import { hasActivePurchase } from "@/lib/access";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Student record is created by the protected layout, but we
  // still need its id for the access check
  let student: { id: number } | null = null;
  try {
    student = await getOrCreateStudent();
  } catch {
    redirect("/sign-in");
  }

  const purchased = await hasActivePurchase(student.id);

  if (!purchased) {
    // ── No active purchase ──
    return (
      <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl md:text-4xl">Ready to Start Learning?</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-navy/65">
          Purchase the course to unlock all modules and interactive exercises.
        </p>
        <Link
          href="/purchase"
          className="mt-8 inline-block rounded-lg bg-teal px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue no-underline"
        >
          View Purchase Options
        </Link>
      </main>
    );
  }

  // ── Active purchase ──
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl">
        Welcome to Bookkeeping Basics
      </h1>
      <p className="mt-3 text-lg text-navy/65">
        Your course modules will appear here as they become available.
      </p>

      {/* Course outline placeholder */}
      <div className="mt-10 rounded-2xl border border-ice-blue bg-white p-8 shadow-sm">
        <h2 className="font-serif text-xl text-navy">Course Outline</h2>
        <p className="mt-2 text-sm text-navy/50">
          Module content is being prepared. Check back soon!
        </p>

        <ul className="mt-6 space-y-3">
          {[
            "Module 1: The Accounting Equation & Debits/Credits",
            "Module 2: T-Accounts & Journal Entries",
            "Module 3: Cash vs. Accrual Basis",
            "Module 4: Adjusting Entries",
            "Module 5: Financial Statements",
          ].map((title, i) => (
            <li
              key={title}
              className="flex items-center gap-3 rounded-lg border border-ice-blue bg-ice-blue/40 px-4 py-3 text-sm text-navy/50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-navy/40">
                {i + 1}
              </span>
              {title}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
