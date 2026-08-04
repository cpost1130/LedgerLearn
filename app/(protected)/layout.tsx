import Link from "next/link";
import { studentHasAccess } from "@/lib/access";
import { getOrCreateStudent } from "@/lib/students";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const student = await getOrCreateStudent();
  const hasAccess = await studentHasAccess(student.clerkId);
  if (!hasAccess) {
    return <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl items-center px-6 py-16 text-center"><div className="w-full rounded-2xl border border-ice-blue bg-white p-10 shadow-sm"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-2xl text-teal" aria-hidden="true">🔒</div><h1 className="text-3xl">Your course is waiting</h1><p className="mt-4 leading-relaxed text-navy/65">Purchase course access to unlock all six modules, interactive exercises, and your learning dashboard.</p><Link href="/pricing" className="mt-7 inline-block rounded-lg bg-teal px-6 py-3 font-semibold text-white no-underline hover:bg-deep-blue">View pricing</Link></div></main>;
  }
  return <>{children}</>;
}
