import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { progress } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { studentId: number; lessonId: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { studentId, lessonId } = body;

  if (!studentId || !lessonId) {
    return NextResponse.json(
      { error: "Missing studentId or lessonId" },
      { status: 400 }
    );
  }

  // Upsert progress record
  const existing = await db
    .select()
    .from(progress)
    .where(
      and(eq(progress.studentId, studentId), eq(progress.lessonId, lessonId))
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(progress)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(
        and(eq(progress.studentId, studentId), eq(progress.lessonId, lessonId))
      );
  } else {
    await db.insert(progress).values({
      studentId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
