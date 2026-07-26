import Link from "next/link";

export default function PurchaseSuccessPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-ice-blue bg-white p-10 shadow-sm max-w-lg">
        {/* Checkmark icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-teal"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl">Payment Received!</h1>

        <p className="mt-4 text-base leading-relaxed text-navy/65">
          We&rsquo;re setting up your access now. Check back in a moment
          — your course will be ready on the Dashboard.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue no-underline"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
