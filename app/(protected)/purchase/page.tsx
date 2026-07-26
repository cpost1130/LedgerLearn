import Link from "next/link";

const ONE_TIME_LINK =
  "https://buy.stripe.com/cNibJ04fBaTGgyh3BNeQM07";
const MONTHLY_LINK =
  "https://buy.stripe.com/7sY6oG6nJ1j62Hr3BNeQM08";

export default function PurchasePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Heading */}
      <h1 className="text-center text-3xl md:text-4xl">
        Choose Your Plan
      </h1>
      <p className="mt-3 text-center text-lg text-navy/65">
        Start learning bookkeeping today — no experience required.
      </p>

      {/* Plan Cards */}
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* One-Time Purchase */}
        <div className="flex flex-col rounded-2xl border border-ice-blue bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="font-serif text-xl text-navy">
            One-Time Purchase
          </h2>
          <p className="mt-1 text-4xl font-bold text-teal">$97</p>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-navy/65">
            All current and future modules. Instant access — no waiting. One
            payment, yours forever.
          </p>
          <a
            href={ONE_TIME_LINK}
            className="mt-6 inline-block rounded-lg bg-teal px-6 py-3 text-center text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue no-underline"
          >
            Buy Now — $97
          </a>
        </div>

        {/* Monthly Subscription */}
        <div className="flex flex-col rounded-2xl border-2 border-teal bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <span className="mb-2 inline-block self-start rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
            Most Flexible
          </span>
          <h2 className="font-serif text-xl text-navy">
            Monthly Subscription
          </h2>
          <p className="mt-1 text-4xl font-bold text-teal">
            $19<span className="text-lg font-normal text-navy/50">/mo</span>
          </p>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-navy/65">
            Module 1 immediately, then one new module per week. Cancel anytime.
          </p>
          <a
            href={MONTHLY_LINK}
            className="mt-6 inline-block rounded-lg bg-teal px-6 py-3 text-center text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue no-underline"
          >
            Subscribe — $19/mo
          </a>
        </div>
      </div>

      {/* Already purchased link */}
      <p className="mt-10 text-center text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-teal underline underline-offset-2 transition-colors hover:text-deep-blue"
        >
          Already purchased? Go to Dashboard
        </Link>
      </p>
    </main>
  );
}
