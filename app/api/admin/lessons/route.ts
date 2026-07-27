import { NextRequest, NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { lessons, modules } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

// ── GET /api/admin/lessons ── list lessons, optionally filtered by moduleId
export async function GET(req: NextRequest) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const moduleIdParam = searchParams.get("moduleId");
    const mid = moduleIdParam ? parseInt(moduleIdParam, 10) : null;

    // Drizzle join types differ when where() is called, so use two paths
    let allLessons;
    if (mid !== null && !isNaN(mid)) {
      allLessons = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          title: lessons.title,
          type: lessons.type,
          content: lessons.content,
          orderIndex: lessons.orderIndex,
          moduleTitle: modules.title,
        })
        .from(lessons)
        .leftJoin(modules, eq(lessons.moduleId, modules.id))
        .where(eq(lessons.moduleId, mid))
        .orderBy(asc(lessons.orderIndex));
    } else {
      allLessons = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          title: lessons.title,
          type: lessons.type,
          content: lessons.content,
          orderIndex: lessons.orderIndex,
          moduleTitle: modules.title,
        })
        .from(lessons)
        .leftJoin(modules, eq(lessons.moduleId, modules.id))
        .orderBy(asc(lessons.orderIndex));
    }

    return NextResponse.json({ lessons: allLessons });
  } catch (err) {
    console.error("GET /api/admin/lessons error:", err);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/lessons ── create a new lesson
export async function POST(req: NextRequest) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, type, moduleId, orderIndex, content } = body;

    if (!title || !type || !moduleId) {
      return NextResponse.json(
        { error: "title, type, and moduleId are required" },
        { status: 400 }
      );
    }

    const validTypes = ["written", "slides", "exercise", "quiz"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify module exists
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

    const [created] = await db
      .insert(lessons)
      .values({
        title,
        type,
        moduleId,
        orderIndex: orderIndex ?? 0,
        content: content ?? null,
      })
      .returning();

    return NextResponse.json({ lesson: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/lessons error:", err);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
