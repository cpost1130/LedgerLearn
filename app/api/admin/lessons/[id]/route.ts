import { NextRequest, NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { lessons, modules } from "@/lib/schema";
import { eq } from "drizzle-orm";

// ── PUT /api/admin/lessons/[id] ── update a lesson
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { title, type, moduleId, orderIndex, content } = body;

    if (type) {
      const validTypes = ["written", "slides", "exercise", "quiz"];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `type must be one of: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (moduleId) {
      const [mod] = await db
        .select({ id: modules.id })
        .from(modules)
        .where(eq(modules.id, moduleId))
        .limit(1);
      if (!mod) {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(lessons)
      .set({
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(moduleId !== undefined && { moduleId }),
        ...(orderIndex !== undefined && { orderIndex }),
        ...(content !== undefined && { content }),
      })
      .where(eq(lessons.id, lessonId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson: updated });
  } catch (err) {
    console.error("PUT /api/admin/lessons/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/lessons/[id] ── delete a lesson
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/admin/lessons/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
