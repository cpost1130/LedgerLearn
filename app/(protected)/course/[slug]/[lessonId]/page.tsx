import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getOrCreateStudent } from "@/lib/students";
import { getUnlockedModules } from "@/lib/access";
import { db } from "@/lib/db";
import { modules, lessons, progress } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { ProgressBar } from "@/components/ProgressBar";
import { RichTextContent } from "@/components/RichTextContent";
import { SlidesViewer } from "@/components/SlidesViewer";
import { QuizViewer } from "@/components/QuizViewer";
import { TAccountExercise } from "@/components/TAccountExercise";
import { JournalEntryBuilder } from "@/components/JournalEntryBuilder";
import { DayToDayExercise } from "@/components/DayToDayExercise";
import { MonthEndCloseExercise } from "@/components/MonthEndCloseExercise";
import { ReconciliationReportingExercise } from "@/components/ReconciliationReportingExercise"
import { SoftwareWalkthroughExercise } from "@/components/SoftwareWalkthroughExercise";
import { MarkCompleteButton } from "./MarkCompleteButton";

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonViewerPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
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
    redirect(`/course/${slug}`);
  }

  // Find the lesson
  const lessonIdNum = parseInt(lessonId, 10);
  if (isNaN(lessonIdNum)) notFound();

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(
      and(eq(lessons.id, lessonIdNum), eq(lessons.moduleId, mod.id))
    )
    .limit(1);

  if (!lesson) notFound();

  // Get all lessons for this module (for prev/next and progress)
  const moduleLessons = await db
    .select({ id: lessons.id, orderIndex: lessons.orderIndex })
    .from(lessons)
    .where(eq(lessons.moduleId, mod.id))
    .orderBy(asc(lessons.orderIndex));

  const currentIndex = moduleLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson =
    currentIndex < moduleLessons.length - 1
      ? moduleLessons[currentIndex + 1]
      : null;
  const prevLesson =
    currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;

  // Get progress for this lesson
  const [lessonProgress] = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.studentId, student.id),
        eq(progress.lessonId, lesson.id)
      )
    )
    .limit(1);

  // Get completed count for progress bar
  const lessonIds = moduleLessons.map((l) => l.id);
  const completedRecords =
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
    completedRecords
      .filter((p) => lessonIds.includes(p.lessonId))
      .map((p) => p.lessonId)
  );
  const completedCount = moduleLessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;

  const isCompleted = lessonProgress?.completed ?? false;

  // Render content based on type
  function renderContent() {
    const content = lesson.content as Record<string, unknown> | null;

    switch (lesson.type) {
      case "written": {
        const sections = (content?.sections as Array<{
          heading: string;
          body: string;
          callout?: string;
        }>) || [];
        return <RichTextContent sections={sections} />;
      }
      case "slides": {
        const slides = (content?.slides as Array<{
          title: string;
          body: string;
        }>) || [];
        return <SlidesViewer slides={slides} />;
      }
      case "exercise": {
        const exerciseType = (content?.exerciseType as string) || "t-account";
        if (exerciseType === "journal-entry") {
          return <JournalEntryBuilder />;
        }
        if (exerciseType === "day-to-day") {
          return <DayToDayExercise />;
        }
        if (exerciseType === "month-end-close") {
          return <MonthEndCloseExercise />;
        }
        if (exerciseType === "reconciliation-reporting") {
          return <ReconciliationReportingExercise />;
        }
        if (exerciseType === "software-walkthrough") {
          return <SoftwareWalkthroughExercise />;
        }
        return <TAccountExercise />;
      }
      case "quiz": {
        const questions = (content?.questions as Array<{
          question: string;
          options: string[];
          correctIndex: number;
        }>) || [];
        return (
          <QuizViewer
            questions={questions}
          />
        );
      }
      default:
        return (
          <div className="rounded-lg border border-ice-blue bg-white p-8 text-center text-navy/50">
            Unknown lesson type.
          </div>
        );
    }
  }

  const nextUrl = nextLesson
    ? `/course/${slug}/${nextLesson.id}`
    : `/course/${slug}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-navy/50">
        <Link
          href="/course"
          className="no-underline hover:text-teal"
        >
          Course
        </Link>
        <span>/</span>
        <Link
          href={`/course/${slug}`}
          className="no-underline hover:text-teal"
        >
          {mod.title}
        </Link>
        <span>/</span>
        <span className="text-navy/70">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <h1 className="font-serif text-3xl text-navy">{lesson.title}</h1>

      {/* Module progress */}
      <div className="mt-4">
        <ProgressBar
          completed={completedCount}
          total={moduleLessons.length}
        />
      </div>

      {/* Lesson content */}
      <div className="mt-10">{renderContent()}</div>

      {/* Navigation and completion */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-ice-blue pt-8">
        <div className="flex gap-3">
          {prevLesson && (
            <Link
              href={`/course/${slug}/${prevLesson.id}`}
              className="rounded-lg border border-ice-blue bg-white px-4 py-2 text-sm font-medium text-navy no-underline transition-colors hover:bg-ice-blue"
            >
              ← Previous Lesson
            </Link>
          )}
        </div>

        <MarkCompleteButton
          studentId={student.id}
          lessonId={lesson.id}
          isCompleted={isCompleted}
          nextUrl={nextUrl}
        />
      </div>
    </main>
  );
}
