const monthlyUrl = "https://buy.stripe.com/bJe7sK6nJ3re81L0pBeQM09";
const lifetimeUrl = "https://buy.stripe.com/cNicN49zVge03LvgozeQM0a";

export default function PricingPage() {
  return <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
    <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-medium uppercase tracking-widest text-teal">Choose your path</p><h1 className="mt-3 text-4xl md:text-5xl">Start learning bookkeeping</h1><p className="mt-4 text-lg text-navy/65">Get practical, beginner-friendly lessons and interactive exercises designed to make bookkeeping click.</p></div>
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <Plan title="Monthly Subscription" price="$19" suffix="/month" description="Flexible access while you learn, with the freedom to cancel anytime." features={["All 6 course modules", "Interactive practice exercises", "Learn at your own pace"]} href={monthlyUrl} />
      <Plan title="One-Time Purchase" price="$97" suffix="" description="Pay once and keep lifetime access to the complete course." features={["Everything in the monthly plan", "Lifetime course access", "No recurring charges"]} href={lifetimeUrl} featured />
    </div>
    <p className="mt-8 text-center text-sm text-navy/55">Secure checkout powered by Stripe. No bookkeeping experience required.</p>
  </main>;
}

function Plan({ title, price, suffix, description, features, href, featured = false }: { title: string; price: string; suffix: string; description: string; features: string[]; href: string; featured?: boolean }) {
  return <section className={`relative rounded-2xl border bg-white p-8 shadow-sm ${featured ? "border-teal ring-2 ring-teal/15" : "border-navy/10"}`}>
    {featured && <span className="absolute -top-3 left-6 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">Best value</span>}
    <h2 className="text-2xl">{title}</h2><p className="mt-4"><span className="text-4xl font-bold text-navy">{price}</span><span className="text-navy/60">{suffix}</span></p><p className="mt-4 min-h-12 text-navy/65">{description}</p>
    <ul className="mt-6 space-y-3 text-sm text-navy/75">{features.map((feature) => <li key={feature} className="flex gap-2"><span className="font-bold text-teal" aria-hidden="true">✓</span>{feature}</li>)}</ul>
    <a href={href} className="mt-8 block rounded-lg bg-teal px-6 py-3 text-center font-semibold text-white no-underline transition-colors hover:bg-deep-blue">Buy now<span className="sr-only">: {title}</span></a>
  </section>;
}
