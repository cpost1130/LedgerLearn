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

  let student: { id: number } | null = null;
  try {
    student = await getOrCreateStudent();
  } catch {
    redirect("/sign-in");
  }

  const purchased = await hasActivePurchase(student.id);

  if (purchased) {
    redirect("/course");
  }

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
