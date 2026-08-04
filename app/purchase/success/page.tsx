import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { grantAccess } from "@/lib/access";
import { getOrCreateStudent } from "@/lib/students";
import { eq } from "drizzle-orm";

interface PageProps { searchParams: Promise<{ session_id?: string }> }

export default async function PurchaseSuccessPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/purchase/success`);
  const { session_id: sessionId } = await searchParams;
  if (sessionId) {
    const student = await getOrCreateStudent();
    const existing = await db.select({ id: purchases.id }).from(purchases).where(eq(purchases.stripeSessionId, sessionId)).limit(1);
    if (existing.length === 0) {
      await db.insert(purchases).values({ studentId: student.id, stripeSessionId: sessionId, type: "one_time", status: "pending", purchasedAt: new Date() });
    }
    await grantAccess(userId);
  }
  return <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center"><div className="max-w-lg rounded-2xl border border-ice-blue bg-white p-10 shadow-sm"><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10"><span className="text-3xl text-teal" aria-hidden="true">✓</span></div><h1 className="text-2xl md:text-3xl">Payment received!</h1><p className="mt-4 text-base leading-relaxed text-navy/65">Payment received! Your course access is being activated. You&apos;ll get an email confirmation shortly.</p><Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 font-semibold text-white no-underline hover:bg-deep-blue">Go to Dashboard</Link></div></main>;
}
