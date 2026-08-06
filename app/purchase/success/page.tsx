import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

interface PageProps { searchParams: Promise<{ session_id?: string }> }

export default async function PurchaseSuccessPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/purchase/success`);
  const { session_id: sessionId } = await searchParams;
  let verified = false;
  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      verified = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required") && session.metadata?.clerk_user_id === userId;
    } catch { verified = false; }
  }
  return <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center"><div className="max-w-lg rounded-2xl border border-ice-blue bg-white p-10 shadow-sm">
    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${verified ? "bg-teal/10" : "bg-navy/10"}`}><span className={`text-3xl ${verified ? "text-teal" : "text-navy"}`} aria-hidden="true">{verified ? "✓" : "?"}</span></div>
    <h1 className="text-2xl md:text-3xl">{verified ? "Payment received!" : "We couldn’t verify that payment"}</h1>
    <p className="mt-4 text-base leading-relaxed text-navy/65">{verified ? "Your payment is confirmed. Course access will be available as soon as the payment webhook finishes processing." : "This link is missing, expired, or does not belong to your account. If you completed checkout, your access will be activated shortly."}</p>
    {verified ? <Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 font-semibold text-white no-underline hover:bg-deep-blue">Go to Dashboard</Link> : <Link href="/pricing" className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 font-semibold text-white no-underline hover:bg-deep-blue">Return to pricing</Link>}
  </div></main>;
}
