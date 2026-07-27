import { db } from "./db";
import { purchases, modules } from "./schema";
import { eq, and, or, isNull, gt, asc } from "drizzle-orm";

/**
 * Checks whether a student has at least one active purchase.
 * - one_time purchases with status 'active' are always considered active.
 * - subscription purchases must have status 'active' AND either no expiry
 *   (null expires_at) or a future expiry date.
 */
export async function hasActivePurchase(
  studentId: number
): Promise<boolean> {
  const result = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.studentId, studentId),
        eq(purchases.status, "active"),
        or(
          eq(purchases.type, "one_time"),
          and(
            eq(purchases.type, "subscription"),
            or(
              isNull(purchases.expiresAt),
              gt(purchases.expiresAt, new Date())
            )
          )
        )
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Returns the student's active purchase record, or null.
 */
export async function getActivePurchase(
  studentId: number
): Promise<typeof purchases.$inferSelect | null> {
  const result = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.studentId, studentId),
        eq(purchases.status, "active"),
        or(
          eq(purchases.type, "one_time"),
          and(
            eq(purchases.type, "subscription"),
            or(
              isNull(purchases.expiresAt),
              gt(purchases.expiresAt, new Date())
            )
          )
        )
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export interface UnlockedModule {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  isLocked: boolean;
  unlocksAt: Date | null;
}

/**
 * Returns all modules with their unlock status for a student.
 *
 * - For one-time purchasers: all modules unlocked immediately.
 * - For subscription purchasers: Module 1 (orderIndex=1, dripDelayDays=0)
 *   is available immediately. Subsequent modules unlock based on:
 *   purchasedAt + (orderIndex - 1) * 7 days
 * - A module's own dripDelayDays acts as an additional delay floor.
 * - If no active purchase: all modules are locked except those with
 *   dripDelayDays=0 (Module 1 free preview, if applicable).
 */
export async function getUnlockedModules(
  studentId: number
): Promise<UnlockedModule[]> {
  const purchase = await getActivePurchase(studentId);
  const allModules = await db
    .select()
    .from(modules)
    .orderBy(asc(modules.orderIndex));

  const now = new Date();

  return allModules.map((mod) => {
    if (!purchase) {
      // No purchase — lock everything (could allow free previews here)
      return {
        id: mod.id,
        title: mod.title,
        slug: mod.slug,
        description: mod.description,
        orderIndex: mod.orderIndex,
        isLocked: true,
        unlocksAt: null,
      };
    }

    if (purchase.type === "one_time") {
      // One-time purchasers get everything immediately
      return {
        id: mod.id,
        title: mod.title,
        slug: mod.slug,
        description: mod.description,
        orderIndex: mod.orderIndex,
        isLocked: false,
        unlocksAt: null,
      };
    }

    // Subscription: calculate unlock time
    // Module 1 (orderIndex=1): available immediately
    // Module N: purchasedAt + (orderIndex - 1) * 7 days, floored by dripDelayDays
    const subscriptionDelayMs =
      (mod.orderIndex - 1) * 7 * 24 * 60 * 60 * 1000;
    const dripDelayMs = mod.dripDelayDays * 24 * 60 * 60 * 1000;
    const effectiveDelayMs = Math.max(subscriptionDelayMs, dripDelayMs);

    const purchasedAt = new Date(purchase.purchasedAt);
    const unlocksAt = new Date(purchasedAt.getTime() + effectiveDelayMs);

    return {
      id: mod.id,
      title: mod.title,
      slug: mod.slug,
      description: mod.description,
      orderIndex: mod.orderIndex,
      isLocked: unlocksAt > now,
      unlocksAt,
    };
  });
}
