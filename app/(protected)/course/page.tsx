import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateStudent } from "@/lib/students";
import { getUnlockedModules } from "@/lib/access";
import { db } from "@/lib/db";
import { progress, lessons } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ProgressBar } from "@/components/ProgressBar";

export default async function CoursePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await getOrCreateStudent();
  const modules = await getUnlockedModules(student.id);

  // Calculate progress for each module
  const moduleProgress = await Promise.all(
    modules.map(async (mod) => {
      // Get all lesson IDs for this module
      const moduleLessons = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.moduleId, mod.id));

      if (moduleLessons.length === 0) {
        return { moduleId: mod.id, completed: 0, total: 0 };
      }

      const lessonIds = moduleLessons.map((l) => l.id);

      const completedCount = await db
        .select()
        .from(progress)
        .where(
          and(
            eq(progress.studentId, student.id),
            eq(progress.completed, true),
            inArray(progress.lessonId, lessonIds)
          )
        );

      return {
        moduleId: mod.id,
        completed: completedCount.length,
        total: moduleLessons.length,
      };
    })
  );

  const progressMap = new Map(
    moduleProgress.map((p) => [p.moduleId, p])
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl">Course Outline</h1>
      <p className="mt-3 text-lg text-navy/65">
        Work through each module at your own pace. Modules unlock as you
        progress.
      </p>

      <div className="mt-10 space-y-6">
        {modules.map((mod) => {
          const prog = progressMap.get(mod.id);
          const complete = prog && prog.total > 0 && prog.completed === prog.total;
          const isLocked = mod.isLocked;

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow ${
                isLocked
                  ? "border-navy/10 opacity-60"
                  : "border-ice-blue hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        complete
                          ? "bg-green-100 text-green-700"
                          : isLocked
                          ? "bg-navy/10 text-navy/40"
                          : "bg-teal/10 text-teal"
                      }`}
                    >
                      {complete ? "✓" : mod.orderIndex}
                    </span>
                    <h2
                      className={`font-serif text-xl ${
                        isLocked ? "text-navy/50" : "text-navy"
                      }`}
                    >
                      {mod.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-navy/60">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {prog && prog.total > 0 && (
                <div className="mt-4">
                  <ProgressBar completed={prog.completed} total={prog.total} />
                </div>
              )}

              {/* Lock / action */}
              <div className="mt-4 flex items-center gap-3">
                {isLocked ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy/50">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {mod.unlocksAt
                      ? `Unlocks on ${mod.unlocksAt.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Locked"}
                  </span>
                ) : (
                  <Link
                    href={`/course/${mod.slug}`}
                    className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors no-underline ${
                      complete
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-teal text-white hover:bg-deep-blue"
                    }`}
                  >
                    {complete ? "Review Module" : "Start Module"}
                    <span className="text-lg leading-none">→</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
