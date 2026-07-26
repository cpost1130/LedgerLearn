import { db } from "./db";
import { students } from "./schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Ensures a student record exists for the currently signed-in Clerk user.
 * If no record exists, creates one with the Clerk user's ID and primary email.
 * Returns the student record (id, clerkId, email).
 */
export async function getOrCreateStudent(): Promise<{
  id: number;
  clerkId: string;
  email: string;
}> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const clerkId = user.id;
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";

  // Check for existing student
  const existing = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new student record
  const [created] = await db
    .insert(students)
    .values({
      clerkId,
      email: primaryEmail,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
    })
    .returning();

  return created;
}
