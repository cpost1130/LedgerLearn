import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ONE_TIME } from "@/lib/stripe";
import { getOrCreateStudent } from "@/lib/students";

export const runtime = "nodejs";

type PriceType = "one_time" | "subscription";

export async function POST(request: Request) {
  try {
    // Diagnostic: check env vars
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY env var is not set" }, { status: 500 });
    }
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const priceType = body.priceType as PriceType;
    if (priceType !== "one_time" && priceType !== "subscription") {
      return NextResponse.json({ error: "Invalid priceType" }, { status: 400 });
    }
    const student = await getOrCreateStudent();
    const origin = new URL(request.url).origin;
    const session = await stripe().checkout.sessions.create({
      mode: priceType === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceType === "subscription" ? STRIPE_PRICE_MONTHLY : STRIPE_PRICE_ONE_TIME, quantity: 1 }],
      success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: userId,
      customer_email: student.email || undefined,
      metadata: { clerk_user_id: userId, price_type: priceType },
      ...(priceType === "subscription" ? { subscription_data: { metadata: { clerk_user_id: userId, price_type: priceType } } } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Stripe checkout error", msg);
    return NextResponse.json({ error: `Checkout failed: ${msg}` }, { status: 500 });
  }
}
