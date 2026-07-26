import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">
      <SignIn />
    </main>
  );
}
