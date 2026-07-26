import { getOrCreateStudent } from "@/lib/students";

/**
 * Layout for all protected routes.
 * Ensures a student record exists in the database for every signed-in user.
 * If no record exists, one is auto-created with the Clerk user's ID and email.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto-create student record on every protected page visit
  await getOrCreateStudent();

  return <>{children}</>;
}
