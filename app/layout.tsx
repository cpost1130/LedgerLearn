import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LedgerLearn — Bookkeeping Basics",
  description:
    "Master the fundamentals of bookkeeping with our self-paced online course.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className="min-h-screen bg-ice-blue text-navy antialiased">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
