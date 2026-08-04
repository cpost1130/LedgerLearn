import { db } from "./db";
import { purchases, modules, students } from "./schema";
import { eq, and, or, isNull, gt, asc } from "drizzle-orm";

/** Grant course access to a Clerk user. The student row is normally created by
 * getOrCreateStudent; the update is intentionally idempotent for checkout retries. */
export async function grantAccess(userId: string): Promise<void> {
  await db.update(students).set({ hasAccess: true }).where(eq(students.clerkId, userId));
}

export async function studentHasAccess(userId: string): Promise<boolean> {
  const [student] = await db.select({ hasAccess: students.hasAccess }).from(students)
    .where(eq(students.clerkId, userId)).limit(1);
  return student?.hasAccess === true;
}

export async function hasActivePurchase(studentId: number): Promise<boolean> {
  const result = await db.select().from(purchases).where(and(
    eq(purchases.studentId, studentId), eq(purchases.status, "active"),
    or(eq(purchases.type, "one_time"), and(eq(purchases.type, "subscription"),
      or(isNull(purchases.expiresAt), gt(purchases.expiresAt, new Date()))))
  )).limit(1);
  return result.length > 0;
}

export async function getActivePurchase(studentId: number): Promise<typeof purchases.$inferSelect | null> {
  const result = await db.select().from(purchases).where(and(
    eq(purchases.studentId, studentId), eq(purchases.status, "active"),
    or(eq(purchases.type, "one_time"), and(eq(purchases.type, "subscription"),
      or(isNull(purchases.expiresAt), gt(purchases.expiresAt, new Date()))))
  )).limit(1);
  return result[0] ?? null;
}

export interface UnlockedModule { id: number; title: string; slug: string; description: string | null; orderIndex: number; isLocked: boolean; unlocksAt: Date | null; }

export async function getUnlockedModules(studentId: number): Promise<UnlockedModule[]> {
  const purchase = await getActivePurchase(studentId);
  const allModules = await db.select().from(modules).orderBy(asc(modules.orderIndex));
  const now = new Date();
  return allModules.map((mod) => {
    if (!purchase) return { ...mod, isLocked: true, unlocksAt: null };
    if (purchase.type === "one_time") return { ...mod, isLocked: false, unlocksAt: null };
    const delay = Math.max((mod.orderIndex - 1) * 7, mod.dripDelayDays) * 86400000;
    const unlocksAt = new Date(new Date(purchase.purchasedAt).getTime() + delay);
    return { ...mod, isLocked: unlocksAt > now, unlocksAt };
  });
}
