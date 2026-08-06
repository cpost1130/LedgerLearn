import { NextResponse } from "next/server";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases, students } from "@/lib/schema";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Invalid webhook configuration" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature error", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.metadata?.clerk_user_id ?? session.client_reference_id;
      if (!clerkId) return NextResponse.json({ received: true });
      const [student] = await db.select({ id: students.id }).from(students).where(eq(students.clerkId, clerkId)).limit(1);
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 400 });
      const type = session.mode === "subscription" ? "subscription" : "one_time";
      const existing = await db.select({ id: purchases.id }).from(purchases).where(eq(purchases.stripeSessionId, session.id)).limit(1);
      if (existing.length) {
        await db.update(purchases).set({ status: "active", type, expiresAt: null }).where(eq(purchases.id, existing[0].id));
      } else {
        await db.insert(purchases).values({ studentId: student.id, stripeSessionId: session.id, type, status: "active", purchasedAt: new Date() });
      }
      await db.update(students).set({ hasAccess: true }).where(eq(students.id, student.id));
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const clerkId = subscription.metadata?.clerk_user_id;
      if (clerkId) {
        const [student] = await db.select({ id: students.id }).from(students).where(eq(students.clerkId, clerkId)).limit(1);
        if (student) {
          await db.update(purchases).set({ status: "canceled", expiresAt: new Date() }).where(and(eq(purchases.studentId, student.id), eq(purchases.type, "subscription"), eq(purchases.status, "active")));
          const remaining = await db.select({ id: purchases.id }).from(purchases).where(and(eq(purchases.studentId, student.id), eq(purchases.status, "active"))).limit(1);
          if (!remaining.length) await db.update(students).set({ hasAccess: false }).where(eq(students.id, student.id));
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
