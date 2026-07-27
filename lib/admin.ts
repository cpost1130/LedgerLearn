import { currentUser } from "@clerk/nextjs/server";

/**
 * Checks whether the given email belongs to an admin,
 * based on the comma-separated ADMIN_EMAILS env var.
 */
export function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Server-side guard: returns true if the currently signed-in user is an admin.
 * Use in layouts and API routes to protect admin-only areas.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";

    return isAdmin(primaryEmail);
  } catch {
    return false;
  }
}
