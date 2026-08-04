import { NextRequest, NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { lessons, modules } from "@/lib/schema";
import { eq } from "drizzle-orm";

// ── PUT /api/admin/modules/[id] ── update a module
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { title, slug, description, orderIndex, dripDelayDays } = body;

    const [updated] = await db
      .update(modules)
      .set({
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(orderIndex !== undefined && { orderIndex }),
        ...(dripDelayDays !== undefined && { dripDelayDays }),
      })
      .where(eq(modules.id, moduleId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module: updated });
  } catch (err: unknown) {
    console.error("PUT /api/admin/modules/[id] error:", err);
    if ((err as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "A module with that slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/modules/[id] ── delete a module
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Lessons reference their module without ON DELETE CASCADE, so remove
    // dependent lessons first to keep the delete consistent with the UI.
    await db.delete(lessons).where(eq(lessons.moduleId, moduleId));

    const [deleted] = await db
      .delete(modules)
      .where(eq(modules.id, moduleId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/admin/modules/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
