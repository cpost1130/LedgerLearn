import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/schema";
import { count } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [moduleCount] = await db.select({ count: count() }).from(modules);
  const [lessonCount] = await db.select({ count: count() }).from(lessons);

  const cards = [
    {
      label: "Total Modules",
      value: moduleCount.count,
      href: "/admin/modules",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      label: "Total Lessons",
      value: lessonCount.count,
      href: "/admin/lessons",
      color: "bg-green-50 border-green-200 text-green-700",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`block rounded-lg border p-6 no-underline transition-shadow hover:shadow-md ${card.color}`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-4xl font-bold mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/modules"
          className="block rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 no-underline hover:border-teal hover:text-teal transition-colors"
        >
          Manage Modules
        </Link>
        <Link
          href="/admin/lessons"
          className="block rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 no-underline hover:border-teal hover:text-teal transition-colors"
        >
          Manage Lessons
        </Link>
        <Link
          href="/admin/drip"
          className="block rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 no-underline hover:border-teal hover:text-teal transition-colors"
        >
          Drip Schedule
        </Link>
      </div>
    </div>
  );
}
