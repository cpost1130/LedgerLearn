import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getOrCreateStudent } from "@/lib/students";
import { getUnlockedModules } from "@/lib/access";
import { db } from "@/lib/db";
import { modules, lessons, progress } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { ProgressBar } from "@/components/ProgressBar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await getOrCreateStudent();

  // Find the module
  const [mod] = await db
    .select()
    .from(modules)
    .where(eq(modules.slug, slug))
    .limit(1);

  if (!mod) notFound();

  // Check access
  const unlockedModules = await getUnlockedModules(student.id);
  const unlockStatus = unlockedModules.find((m) => m.id === mod.id);

  if (!unlockStatus || unlockStatus.isLocked) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-ice-blue bg-white p-12 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
            <svg
              className="h-8 w-8 text-navy/50"
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
          </div>
          <h1 className="font-serif text-2xl text-navy">Module Locked</h1>
          <p className="mt-2 text-navy/60">
            {unlockStatus?.unlocksAt
              ? `This module unlocks on ${unlockStatus.unlocksAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}.`
              : "Complete the previous modules to unlock this one."}
          </p>
          <Link
            href="/course"
            className="mt-6 inline-block rounded-lg bg-teal px-6 py-2 text-sm font-semibold text-white no-underline hover:bg-deep-blue"
          >
            ← Back to Course Outline
          </Link>
        </div>
      </main>
    );
  }

  // Fetch lessons for this module
  const moduleLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, mod.id))
    .orderBy(asc(lessons.orderIndex));

  // Fetch progress for these lessons
  const lessonIds = moduleLessons.map((l) => l.id);
  const progressRecords =
    lessonIds.length > 0
      ? await db
          .select()
          .from(progress)
          .where(
            and(
              eq(progress.studentId, student.id),
              eq(progress.completed, true)
            )
          )
      : [];

  const completedLessonIds = new Set(
    progressRecords
      .filter((p) => lessonIds.includes(p.lessonId))
      .map((p) => p.lessonId)
  );

  const completedCount = moduleLessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;

  // Determine which lessons are available
  // First lesson always available, subsequent lessons available if previous completed
  const isLessonAvailable = (index: number): boolean => {
    if (index === 0) return true;
    const prevLesson = moduleLessons[index - 1];
    return completedLessonIds.has(prevLesson.id);
  };

  const typeLabels: Record<string, string> = {
    written: "📖 Reading",
    slides: "📊 Slides",
    exercise: "✏️ Exercise",
    quiz: "✅ Quiz",
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Module header */}
      <Link
        href="/course"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal no-underline hover:text-deep-blue"
      >
        ← Back to Course Outline
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-navy">{mod.title}</h1>
      <p className="mt-2 text-lg text-navy/65">{mod.description}</p>

      {/* Progress */}
      <div className="mt-6">
        <ProgressBar
          completed={completedCount}
          total={moduleLessons.length}
        />
      </div>

      {/* Lesson list */}
      <div className="mt-8 space-y-4">
        {moduleLessons.map((lesson, index) => {
          const isComplete = completedLessonIds.has(lesson.id);
          const available = isLessonAvailable(index);

          return (
            <div
              key={lesson.id}
              className={`flex items-center gap-4 rounded-xl border bg-white p-4 ${
                available ? "border-ice-blue" : "border-navy/10 opacity-50"
              }`}
            >
              {/* Status icon */}
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${
                  isComplete
                    ? "bg-green-100 text-green-700"
                    : available
                    ? "bg-teal/10 text-teal"
                    : "bg-navy/10 text-navy/40"
                }`}
              >
                {isComplete ? "✓" : available ? lesson.orderIndex : "🔒"}
              </span>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    available ? "text-navy" : "text-navy/50"
                  }`}
                >
                  {lesson.title}
                </p>
                <p className="text-xs text-navy/50">
                  {typeLabels[lesson.type] || lesson.type}
                </p>
              </div>

              {available && (
                <Link
                  href={`/course/${slug}/${lesson.id}`}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-deep-blue"
                >
                  {isComplete ? "Review" : "Start"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
