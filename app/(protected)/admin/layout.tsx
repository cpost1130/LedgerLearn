import { currentUserIsAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await currentUserIsAdmin();

  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600 max-w-md">
          You do not have permission to access the admin area. If you believe
          this is an error, contact the site administrator.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 text-teal underline hover:text-deep-blue"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50">
      {/* Admin nav bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 max-w-6xl mx-auto">
          <span className="font-bold text-navy text-sm uppercase tracking-wider">
            Admin
          </span>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-navy no-underline"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/modules"
            className="text-sm text-gray-600 hover:text-navy no-underline"
          >
            Modules
          </Link>
          <Link
            href="/admin/lessons"
            className="text-sm text-gray-600 hover:text-navy no-underline"
          >
            Lessons
          </Link>
          <Link
            href="/admin/drip"
            className="text-sm text-gray-600 hover:text-navy no-underline"
          >
            Drip Schedule
          </Link>
          <Link
            href="/course"
            className="text-sm text-teal hover:text-deep-blue no-underline ml-auto"
          >
            View Site →
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
