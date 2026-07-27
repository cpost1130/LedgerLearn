import { NextRequest, NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/schema";
import { eq, asc, count } from "drizzle-orm";

// ── GET /api/admin/modules ── list all modules with lesson counts
export async function GET() {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const allModules = await db
      .select()
      .from(modules)
      .orderBy(asc(modules.orderIndex));

    // Attach lesson counts
    const withCounts = await Promise.all(
      allModules.map(async (mod) => {
        const [result] = await db
          .select({ count: count() })
          .from(lessons)
          .where(eq(lessons.moduleId, mod.id));
        return { ...mod, lessonCount: result.count };
      })
    );

    return NextResponse.json({ modules: withCounts });
  } catch (err) {
    console.error("GET /api/admin/modules error:", err);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/modules ── create a new module
export async function POST(req: NextRequest) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, slug, description, orderIndex, dripDelayDays } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "title and slug are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(modules)
      .values({
        title,
        slug,
        description: description ?? null,
        orderIndex: orderIndex ?? 0,
        dripDelayDays: dripDelayDays ?? 0,
      })
      .returning();

    return NextResponse.json({ module: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/admin/modules error:", err);
    if ((err as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "A module with that slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
