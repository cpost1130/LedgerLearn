import { db } from "./db";
import { purchases } from "./schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";

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
