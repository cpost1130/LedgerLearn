"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  const { isLoaded, isSignedIn } = useUser();

  // Don't render anything until Clerk has loaded to prevent flash
  if (!isLoaded) {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-ice-blue">
        <span className="font-serif text-2xl font-bold text-navy">
          LedgerLearn
        </span>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-ice-blue">
      <Link
        href="/"
        className="font-serif text-2xl font-bold text-navy no-underline hover:text-deep-blue"
      >
        LedgerLearn
      </Link>

      <div className="flex items-center gap-4">
        {!isSignedIn ? (
          <SignInButton mode="redirect">
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-deep-blue cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-teal no-underline hover:text-deep-blue"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
