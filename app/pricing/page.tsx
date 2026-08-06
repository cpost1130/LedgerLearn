"use client";

import { useState } from "react";

export default function PricingPage() {
  return <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
    <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-medium uppercase tracking-widest text-teal">Choose your path</p><h1 className="mt-3 text-4xl md:text-5xl">Start learning bookkeeping</h1><p className="mt-4 text-lg text-navy/65">Get practical, beginner-friendly lessons and interactive exercises designed to make bookkeeping click.</p></div>
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <Plan title="Monthly Subscription" price="$19" suffix="/month" description="Flexible access while you learn, with the freedom to cancel anytime." features={["All 6 course modules", "Interactive practice exercises", "Learn at your own pace"]} priceType="subscription" />
      <Plan title="One-Time Purchase" price="$97" suffix="" description="Pay once and keep lifetime access to the complete course." features={["Everything in the monthly plan", "Lifetime course access", "No recurring charges"]} priceType="one_time" featured />
    </div>
    <p className="mt-8 text-center text-sm text-navy/55">Secure checkout powered by Stripe. No bookkeeping experience required.</p>
  </main>;
}

function Plan({ title, price, suffix, description, features, priceType, featured = false }: { title: string; price: string; suffix: string; description: string; features: string[]; priceType: "one_time" | "subscription"; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceType }) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? "Unable to start checkout");
      window.location.href = data.url;
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to start checkout"); setLoading(false); }
  }
  return <section className={`relative rounded-2xl border bg-white p-8 shadow-sm ${featured ? "border-teal ring-2 ring-teal/15" : "border-navy/10"}`}>
    {featured && <span className="absolute -top-3 left-6 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">Best value</span>}
    <h2 className="text-2xl">{title}</h2><p className="mt-4"><span className="text-4xl font-bold text-navy">{price}</span><span className="text-navy/60">{suffix}</span></p><p className="mt-4 min-h-12 text-navy/65">{description}</p>
    <ul className="mt-6 space-y-3 text-sm text-navy/75">{features.map((feature) => <li key={feature} className="flex gap-2"><span className="font-bold text-teal" aria-hidden="true">✓</span>{feature}</li>)}</ul>
    <button type="button" onClick={checkout} disabled={loading} className="mt-8 block w-full rounded-lg bg-teal px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-deep-blue disabled:cursor-wait disabled:opacity-60">{loading ? "Loading…" : "Buy now"}<span className="sr-only">: {title}</span></button>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>;
}
